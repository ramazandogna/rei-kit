import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'

/**
 * Nothing in the kit may be painted on a side of the screen.
 *
 * The kit sets `dir` on the document from the active locale, and every
 * logical property it is written with — `inset-inline-start`,
 * `padding-inline-end`, `text-align: start` — exists to follow it. One
 * `left:` among them is not a small inconsistency: it is a piece of a
 * component pinned to the side the *author* reads from, while the rest of
 * it moved. The result is a knob outside its track, a rail through the
 * middle of the text, a chevron over the value.
 *
 * None of that shows up anywhere else. It type-checks, it renders, it
 * passes axe, and it is only visible to someone reading Arabic or Hebrew —
 * which is to say, not to whoever writes the next component. So it is a
 * test.
 *
 * This ran for the first time against 61 physical declarations across
 * twenty-odd components: the kit had paid the cost of logical properties
 * everywhere and had never actually been right-to-left.
 */

const DIRS = ['components', 'web', 'app', 'pwa', 'motion']

const files = [
  ...DIRS.flatMap((dir) =>
    readdirSync(`src/${dir}`)
      .filter((name) => name.endsWith('.vue'))
      .map((name) => ({
        name: `${dir}/${name}`,
        source: readFileSync(`src/${dir}/${name}`, 'utf8'),
      })),
  ),
  ...readdirSync('src/styles')
    .filter((name) => name.endsWith('.css') && !name.startsWith('_'))
    .map((name) => ({
      name: `styles/${name}`,
      source: readFileSync(`src/styles/${name}`, 'utf8'),
    })),
]

/** Only the stylesheet: a doc comment may well say the word "left". */
function styles(source: string) {
  const start = source.indexOf('\n<style')

  return start === -1 ? source : source.slice(start)
}

/**
 * The properties that pick a side, and the logical property each one
 * should have been.
 */
const PHYSICAL: Record<string, string> = {
  'margin-left': 'margin-inline-start',
  'margin-right': 'margin-inline-end',
  'padding-left': 'padding-inline-start',
  'padding-right': 'padding-inline-end',
  'border-left': 'border-inline-start',
  'border-right': 'border-inline-end',
  left: 'inset-inline-start',
  right: 'inset-inline-end',
}

function offences(source: string) {
  const found: string[] = []

  for (const line of styles(source).split('\n')) {
    const match = /^\s*([a-z-]+)\s*:\s*([^;]+);/.exec(line)
    if (!match) continue

    const [, property, value] = match as unknown as [string, string, string]

    if (property === 'text-align' && /^(left|right)$/.test(value.trim())) {
      found.push(
        `text-align: ${value.trim()} → text-align: ${value.trim() === 'left' ? 'start' : 'end'}`,
      )
      continue
    }

    const logical = PHYSICAL[property]
    if (!logical) continue

    /* `left: 50%` with a `-50%` translate is centring, which is the same
       thing in both directions, so it is not an offence. */
    if ((property === 'left' || property === 'right') && value.trim() === '50%') continue

    found.push(`${property}: ${value.trim()} → ${logical}`)
  }

  return found
}

describe('every side is a logical one', () => {
  it.each(files)('$name', ({ source }) => {
    expect(offences(source)).toEqual([])
  })

  it('is looking at the files it thinks it is', () => {
    // A scan that quietly found nothing to scan would pass for ever.
    expect(files.length).toBeGreaterThan(80)
    expect(files.some(({ name }) => name === 'components/BaseSwitch.vue')).toBe(true)
  })

  it('catches a physical property when there is one', () => {
    expect(offences('<style>\n.x {\n  margin-left: 1rem;\n}\n</style>')).toEqual([
      'margin-left: 1rem → margin-inline-start',
    ])
  })

  it('lets centring through, because it is the same either way', () => {
    expect(offences('<style>\n.x {\n  left: 50%;\n}\n</style>')).toEqual([])
  })

  it('does not read a doc comment as a stylesheet', () => {
    // "left" is an ordinary English word and appears in prose all over the
    // kit; only the `<style>` block is markup.
    expect(offences('/** the item on the left: 0 of them */\n<template><p /></template>')).toEqual(
      [],
    )
  })
})
