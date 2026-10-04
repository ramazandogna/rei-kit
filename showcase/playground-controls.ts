import catalogue from './props.generated.json'

/**
 * Turning a generated prop table into something you can actually turn.
 *
 * The catalogue already carries every prop's name, type, default and reason —
 * it is what the prop table reads. A type written as a union of string
 * literals is a set of radio buttons that nobody has drawn yet, and a
 * `boolean` is a switch. So the controls are derived rather than listed: a
 * component that grows a variant grows a button for it on the next build, and
 * a playground cannot document a prop the component does not have.
 *
 * Props whose type is a function, an object or an array get no control. They
 * are real props and they belong in the table, but there is no honest widget
 * for "a function that returns a class", and inventing one would mean the
 * playground quietly demonstrating something other than the component.
 */

export type Entry = (typeof catalogue)[number]
export type Prop = Entry['props'][number]

export type Control =
  | { kind: 'enum'; prop: Prop; options: string[] }
  | { kind: 'boolean'; prop: Prop }
  | { kind: 'number'; prop: Prop }
  | { kind: 'text'; prop: Prop }

/** `'a' | 'b'` is a set of choices; `'a' | (string & {})` is not. */
function literalOptions(type: string): string[] | null {
  const quoted = [...type.matchAll(/'([^']*)'/g)].map(([, value]) => value ?? '')
  if (quoted.length < 2) return null

  const rest = type.replace(/'[^']*'/g, '').replace(/[|\s]|undefined|null/g, '')
  return rest === '' ? quoted : null
}

export function controlsFor(entry: Entry): Control[] {
  const controls: Control[] = []

  for (const prop of entry.props) {
    const type = prop.type.trim()
    const options = literalOptions(type)

    if (options) controls.push({ kind: 'enum', prop, options })
    else if (/^boolean(\s*\|\s*undefined)?$/.test(type)) controls.push({ kind: 'boolean', prop })
    else if (/^number(\s*\|\s*undefined)?$/.test(type)) controls.push({ kind: 'number', prop })
    else if (/^string(\s*\|\s*undefined)?$/.test(type)) controls.push({ kind: 'text', prop })
  }

  return controls
}

/**
 * The value a control starts on.
 *
 * The catalogue writes a default as it appears in the source — `'md'`, with
 * the quotes — because that is what a reader of the table needs to see. Here
 * it has to become the value itself.
 */
export function initialValue(control: Control): string | number | boolean | undefined {
  const written = control.prop.default?.trim()

  if (control.kind === 'boolean') return written === 'true'
  if (control.kind === 'enum') {
    const quoted = written?.match(/^'([^']*)'$/)
    return quoted ? quoted[1] : control.options[0]
  }
  if (control.kind === 'number') {
    /* `undefined`, `-Infinity` and `Infinity` are all real defaults in here —
       `NumberInput`'s bounds are the last two. None of them is a number an
       `<input type="number">` can carry, and setting one put
       `The specified value "NaN" cannot be parsed` in the console seven times
       on every load. Absent is the honest control state for them. */
    const parsed = written === undefined ? Number.NaN : Number(written)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  const quoted = written?.match(/^'([^']*)'$/)
  if (quoted) return quoted[1]

  /* A required string with no default is almost always the visible words —
     this kit has no language of its own, so every label is a prop. Seeding it
     with the prop's own name keeps the control legible and obviously yours to
     change. */
  if (control.prop.required) return sentence(control.prop.name)

  /* And an optional one is left alone. It used to be seeded with `''`, which
     is not the same thing as absent: `''` is a date key the calendar cannot
     parse and a locale tag `Intl` throws on, so `BaseCalendar`,
     `BaseDatePicker`, `TimePicker`, `CountUp` and `NumberTicker` all threw
     while mounting and the page carried four console errors on every load.
     `undefined` is what the component's own default expects. */
  return undefined
}

function sentence(name: string): string {
  const spaced = name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** The tag as it would be written, with only what differs from the defaults. */
export function snippetFor(
  name: string,
  controls: Control[],
  values: Record<string, unknown>,
  slot: string | null,
): string {
  const written = controls
    .filter((control) => values[control.prop.name] !== initialValue(control))
    .map((control) => {
      const value = values[control.prop.name]
      if (control.kind === 'boolean')
        return value ? control.prop.name : `:${control.prop.name}="false"`
      if (control.kind === 'number') return `:${control.prop.name}="${String(value)}"`
      return `${control.prop.name}="${String(value)}"`
    })

  const open = [name, ...written].join(' ')
  if (written.join(' ').length > 48) {
    const indented = written.map((attribute) => `  ${attribute}`).join('\n')
    return slot === null
      ? `<${name}\n${indented}\n/>`
      : `<${name}\n${indented}\n>\n  ${slot}\n</${name}>`
  }

  return slot === null ? `<${open} />` : `<${open}>${slot}</${name}>`
}
