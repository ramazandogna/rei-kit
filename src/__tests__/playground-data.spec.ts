import { describe, expect, it } from 'vitest'

import catalogue from '../../showcase/props.generated.json'
import { controlsFor, type Entry } from '../../showcase/playground-controls'
import { PLAYGROUND_DATA } from '../../showcase/playground-data'
import { NOT_PLAYABLE, SLOT_TEXT } from '../../showcase/playground-seeds'

/**
 * That every component on the docs site can be tried, or says why not.
 *
 * The playground derives its controls from the catalogue, which is what keeps
 * it from going stale — and it means a component silently has no playground
 * the moment one required prop is a list or a function. That was true of
 * thirty-nine of them, including a select, a table and a tab bar: the parts a
 * reader reaches for first were the ones the page would not let them touch,
 * and nothing failed.
 *
 * So the floor is asserted here rather than counted by hand. A component is
 * either driveable or listed with a reason; there is no third state.
 */
const entries = catalogue as unknown as Entry[]

function covered(entry: Entry): Set<string> {
  return new Set([
    ...controlsFor(entry).map((control) => control.prop.name),
    ...Object.keys(PLAYGROUND_DATA[entry.name] ?? {}),
  ])
}

function playable(entry: Entry): boolean {
  if (NOT_PLAYABLE[entry.name]) return false

  const answered = covered(entry)
  if (answered.size === 0) return false

  return entry.props.every((prop) => !prop.required || answered.has(prop.name))
}

describe('the playground', () => {
  it('drives a component or says why it cannot', () => {
    const silent = entries
      .filter((entry) => !playable(entry) && !NOT_PLAYABLE[entry.name])
      .map((entry) => {
        const answered = covered(entry)
        const missing = entry.props
          .filter((prop) => prop.required && !answered.has(prop.name))
          .map((prop) => `${prop.name}: ${prop.type}`)

        return `${entry.name} — ${missing.join('; ') || 'no prop a control can be derived from'}`
      })

    /* Either seed the prop in `playground-data.ts` or name the component in
       `NOT_PLAYABLE` with the reason. A component that is neither is one the
       page shows a type table for and nothing else. */
    expect(silent).toEqual([])
  })

  it('keeps most of the kit driveable', () => {
    const count = entries.filter(playable).length

    /* A floor, not a target: 76 of 105 when the seeds were written, and the
       29 that are out are overlays, hosts and shells — things that take over
       a page or render nothing until something happens. If this drops, a type
       stopped parsing or a required prop changed shape. */
    expect(count).toBeGreaterThanOrEqual(76)
  })

  it('seeds only props the components actually have', () => {
    const wrong: string[] = []

    for (const [name, seeds] of Object.entries(PLAYGROUND_DATA)) {
      const entry = entries.find((item) => item.name === name)
      if (!entry) {
        wrong.push(`${name} is not in the catalogue`)
        continue
      }

      for (const prop of Object.keys(seeds)) {
        if (!entry.props.some((item) => item.name === prop)) wrong.push(`${name}.${prop}`)
      }
    }

    expect(wrong).toEqual([])
  })

  it('names a real component in every list it keeps', () => {
    const names = new Set(entries.map((entry) => entry.name))

    expect(
      [...Object.keys(NOT_PLAYABLE), ...Object.keys(SLOT_TEXT)].filter((name) => !names.has(name)),
    ).toEqual([])
  })

  it('gives a reason for every component it leaves out', () => {
    expect(Object.entries(NOT_PLAYABLE).filter(([, reason]) => reason.trim() === '')).toEqual([])
  })
})
