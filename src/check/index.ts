/**
 * The wiring that fails silently, checked at unit-test speed.
 *
 * Every line of this package's install can be left out and leave a build that
 * is green: a missing `@source` means Tailwind never emits the utilities the
 * components ask for, a missing stylesheet import means the components keep
 * their markup and lose their layout, and a colour role the app never defines
 * makes `bg-primary` emit no declaration at all. None of it is visible to
 * `vue-tsc`, to a component test, or to a reader of the diff. One of the apps
 * in this family shipped a release with its tab bar invisible exactly this
 * way.
 *
 * Both apps then wrote the same check, independently, with three of the four
 * assertions carrying the same names — which is this kit's own test for a
 * missing part. So the check moved here, and it knows one thing their copies
 * could not: that the preset exists and carries the `@source` and the
 * component styles with it.
 *
 * Nothing here reads a file or touches the DOM. The caller supplies the two
 * stylesheets as text, because that is the only part that differs between a
 * Vitest run, a Node script and a CI step.
 */

/** A problem found in an app's stylesheet, written to be read in a failure. */
export type StylingProblem = {
  /** What is wrong, in one sentence. */
  message: string
  /** The line to add, where there is a single obvious one. */
  fix?: string
}

export type StylingInput = {
  /** The app's own stylesheet — the file that imports Tailwind. */
  css: string
  /** `node_modules/rei-kit/dist/tokens.css`, for the roles it declares. */
  tokens: string
}

/** Every `--color-<name>` a stylesheet declares. */
function colourRoles(css: string): Set<string> {
  return new Set([...css.matchAll(/--color-([a-z0-9-]+)\s*:/g)].map(([, name]) => name!))
}

/**
 * Whether the app imports one of the kit's stylesheets, however it resolves it.
 *
 * Matched on the file rather than on `rei-kit/…`, because a workspace that
 * builds the kit alongside the app reaches it by path — the kit's own
 * showcase does, and the first version of this told it three times that it
 * had not imported what it plainly had. A check that cries wolf is one
 * nobody reads.
 */
function imports(css: string, file: string): boolean {
  return new RegExp(`@import\\s+['"][^'"]*${file.replace('.', '\\.')}['"]`).test(css)
}

/** Whether it is the published package rather than a path into a workspace. */
function byPackage(css: string): boolean {
  return /@import\s+['"]rei-kit\//.test(css)
}

/**
 * The roles a rule in the dark sets, where that rule can beat `:root`.
 *
 * The kit writes two kinds, and the difference is the whole point. A plain
 * `.dark { … }` has the same specificity as `:root` and is emitted after it,
 * so it wins — an app that restates one of those roles in `@theme` and not
 * under `.dark` keeps the kit's colour at night. A `:where(.dark) { … }`
 * carries no specificity at all, which is exactly why the kit puts the
 * filled roles there: an app's own brand has to survive after dark, and
 * before that block existed the kit's lightening beat it.
 *
 * So only the first kind is something an app has to answer, and a reader
 * that lumps them together reports nine roles that are already correct. It
 * did, once, against a real app — which is how this comment came to be here
 * rather than in the version that shipped.
 *
 * The body runs to its matching brace, not the next one: these blocks hold
 * comments and nested rules. And it is found from a rule rather than from
 * the word, or a comment mentioning `.dark` starts the slice and swallows
 * the stylesheet.
 */
function darkRoles(css: string): Set<string> {
  const bodies: string[] = []

  /* Not preceded by `)` or a word character, so `:where(.dark)` and
     `.dark [data-palette]` are both left out — the first for specificity,
     the second because it answers a palette rather than the app. */
  for (const match of css.matchAll(/(?<![\w):])\.dark\s*\{/g)) {
    let depth = 1
    let at = match.index! + match[0].length

    while (at < css.length && depth > 0) {
      if (css[at] === '{') depth += 1
      else if (css[at] === '}') depth -= 1
      at += 1
    }

    bodies.push(css.slice(match.index! + match[0].length, at - 1))
  }

  return colourRoles(bodies.join('\n'))
}

/** The five roles a component fills and then writes on. */
const FILLED_ROLES = ['primary', 'accent', 'positive', 'negative', 'warning'] as const

/** Every `--color-<name>: <value>` of a block, as declared. */
function colourValues(css: string): Map<string, string> {
  return new Map(
    [...css.matchAll(/--color-([a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [
      name!,
      value!.trim(),
    ]),
  )
}

/** The body of a rule, from its opening brace to the matching one. */
function bodies(css: string, opening: RegExp): string {
  const found: string[] = []

  for (const match of css.matchAll(opening)) {
    let depth = 1
    let at = match.index! + match[0].length

    while (at < css.length && depth > 0) {
      if (css[at] === '{') depth += 1
      else if (css[at] === '}') depth -= 1
      at += 1
    }

    found.push(css.slice(match.index! + match[0].length, at - 1))
  }

  return found.join('\n')
}

/**
 * A role's value as six hex digits, following aliases.
 *
 * An app that names its colours by pigment reaches the roles through
 * `var(--color-sea)`, so a reader that only accepts a literal sees nothing to
 * measure in the one stylesheet in this family written that way. Anything
 * else — `oklch()`, `color-mix()`, a value from outside this stylesheet —
 * returns null and is skipped rather than guessed at.
 */
function hex(values: Map<string, string>, role: string, seen = new Set<string>()): string | null {
  const value = values.get(role)
  if (!value || seen.has(role)) return null
  seen.add(role)

  const alias = /^var\(--color-([a-z0-9-]+)\)$/.exec(value)
  if (alias) return hex(values, alias[1]!, seen)

  const literal = /^#([0-9a-f]{6})$/i.exec(value)
  return literal ? `#${literal[1]!.toLowerCase()}` : null
}

function channels(colour: string): [number, number, number] {
  const n = Number.parseInt(colour.slice(1), 16)

  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((value) => {
    const c = value / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
}

/** WCAG contrast, the ratio the kit's own palettes are measured against. */
function contrast(a: string, b: string): number {
  const luminance = (colour: string) => {
    const [r, g, b] = channels(colour)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/**
 * What `tokens.css` derives for an `on-` role the app leaves alone.
 *
 * The same arithmetic as the `oklch(from … clamp(0, (0.6 - l) * 1000, 1) 0 0)`
 * net there: black or white, whichever is further from the fill's lightness.
 * Repeated rather than read out of the stylesheet, because a check that
 * evaluates a `calc()` is a CSS engine; this is one threshold, and
 * `check.spec.ts` holds the two to the same answer.
 */
function derivedInk(fill: string): string {
  const [r, g, b] = channels(fill)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s

  return lightness < 0.6 ? '#ffffff' : '#000000'
}

/**
 * What is missing from an app's stylesheet, as a list to assert is empty.
 *
 * ```ts
 * import { checkStyling } from 'rei-kit/check'
 *
 * it('is wired to the kit', () => {
 *   expect(
 *     checkStyling({
 *       css: readFileSync('src/assets/main.css', 'utf8'),
 *       tokens: readFileSync('node_modules/rei-kit/dist/tokens.css', 'utf8'),
 *     }),
 *   ).toEqual([])
 * })
 * ```
 */
export function checkStyling({ css, tokens }: StylingInput): StylingProblem[] {
  const problems: StylingProblem[] = []

  /* The preset is tokens, shell, materials, palettes, the compiled component
     styles and the `@source` — so an app that imports one has answered every
     question below at once, and asking them separately would report faults it
     does not have. */
  const preset = imports(css, 'mobile.css') || imports(css, 'web.css')

  if (preset && imports(css, 'mobile.css') && imports(css, 'web.css')) {
    problems.push({
      message:
        'Both presets are imported. They are two answers to the same question, and the second one wins wherever they disagree.',
      fix: "keep one of @import 'rei-kit/mobile.css' or @import 'rei-kit/web.css'",
    })
  }

  if (!preset) {
    if (!imports(css, 'styles.css')) {
      problems.push({
        message:
          'The compiled component styles are not imported, so every component keeps its markup and loses its layout. Nothing else reports this: the build is green and the page renders.',
        fix: "@import 'rei-kit/mobile.css'; /* or web.css — the preset carries the rest too */",
      })
    }

    /* Only asked of an app that installed the package. A workspace reaching
       the kit by path points Tailwind at wherever it keeps the source, and
       guessing that path is not this check's business. */
    if (byPackage(css) && !/@source\s+['"][^'"]*node_modules\/rei-kit[^'"]*['"]/.test(css)) {
      problems.push({
        message:
          'Tailwind is not told to scan the kit, so it emits no utility the components ask for. It does not walk node_modules unless pointed at it.',
        fix: "@source '<relative path>/node_modules/rei-kit/dist';",
      })
    }
  }

  /* Checked last and only when the roles cannot be arriving from the kit
     itself, so the list reports what the app has to define rather than
     repeating the import it is already being told about. */
  const declared = colourRoles(css)
  if (!preset && !imports(css, 'tokens.css')) {
    const missing = [...colourRoles(tokens)].filter((role) => !declared.has(role))

    if (missing.length) {
      problems.push({
        message: `These colour roles are never defined, so every utility built on them emits nothing: ${missing.join(', ')}.`,
        fix: "@import 'rei-kit/tokens.css';",
      })
    }
  }

  /* Measured, because the instruction had been written down and never
     enforced: with the material imported first, `--surface-opacity` computes
     to 100% under `data-material="glass"` instead of 56% — the material is
     simply inert. Both files set the same custom properties, `:root` and
     `[data-material]` carry the same specificity, and equal specificity is
     settled by source order. The build is green, the attribute is on the
     element, and nothing happens. */
  if (!preset) {
    const at = (file: string) => {
      const found = new RegExp(`@import\\s+['"][^'"]*${file.replace('.', '\\.')}['"]`).exec(css)
      return found ? found.index : -1
    }

    const tokensAt = at('tokens.css')
    /* Materials and palettes only. Both reset properties `tokens.css` also
       sets — 17 of them for the palettes — under a selector of the same
       specificity, so order settles it. `motion.css` shares no property with
       `tokens.css` at all, so its position cannot matter, and 4.1.0 asked
       about it anyway: a rule that reports a setup nothing is wrong with is
       the kind that gets switched off. */
    const late = ['materials.css', 'palettes.css']
      .map((file) => ({ file, at: at(file) }))
      .filter((entry) => entry.at !== -1 && tokensAt !== -1 && entry.at < tokensAt)

    if (late.length) {
      problems.push({
        message: `${late.map((entry) => entry.file).join(' and ')} must be imported after tokens.css, or the values they set are overwritten and the attribute they answer to does nothing.`,
        fix: "@import 'rei-kit/tokens.css'; then the rest",
      })
    }
  }

  /* The trap an app found before this check existed, and the sharpest one
     here: `@theme` compiles to `:root`, which Tailwind emits near the top of
     the stylesheet, while the kit's `.dark` block arrives after it. A role
     the app restates in `@theme` but not under `.dark` therefore keeps the
     kit's value at night — so the app comes up in somebody else's colours
     after dark, with a green build and every other check passing. */
  const kitDark = darkRoles(tokens)
  const appDark = darkRoles(css)
  const redefined = [...declared].filter((role) => kitDark.has(role) && !appDark.has(role))

  if (redefined.length) {
    problems.push({
      message: `These roles are redefined for the day and left at the kit's own values at night, because \`@theme\` lands in \`:root\` and the kit's \`.dark\` comes after it: ${redefined.join(', ')}.`,
      fix: '.dark { --color-primary: …; } — restate each one under `.dark` as well',
    })
  }

  /* The one fault in here that is about a value rather than a line, and the
     reason it belongs with the others: it is just as quiet. A rebranded role
     is a colour chosen by eye, the text on it comes from a token or from the
     net in `tokens.css`, and the pair is never seen together until it is on
     somebody's screen. Two apps in this family declared the right
     on-colours and then wrote `text-white` anyway; a third left the roles to
     the net, which is documented as a safety net rather than a guarantee,
     and its green landed at 3.96:1.

     Only roles the app itself redefines are measured — the kit's own are
     measured by the kit — and a value that is not a hex is skipped rather
     than guessed at. */
  const theme = colourValues(bodies(css, /@theme[^{]*\{/g))
  const night = new Map([...theme, ...colourValues(bodies(css, /(?<![\w):])\.dark\s*\{/g))])

  const unreadable = FILLED_ROLES.flatMap((role) =>
    (
      [
        ['day', theme],
        ['night', night],
      ] as const
    ).flatMap(([mode, values]) => {
      const fill = hex(values, role)
      if (!fill) return []

      const ink = hex(values, `on-${role}`) ?? derivedInk(fill)
      const ratio = contrast(fill, ink)

      return ratio >= 4.5
        ? []
        : [`${role} by ${mode} (${fill} under ${ink}, ${ratio.toFixed(2)}:1)`]
    }),
  )

  if (unreadable.length) {
    problems.push({
      message: `Text on these filled roles is below WCAG AA, so a label on one of them is unreadable at normal size: ${unreadable.join('; ')}.`,
      fix: 'move the role, or declare its `--color-on-<role>` as a colour measured against it',
    })
  }

  return problems
}
