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

/*
 * The showcase is scanned too, and not for tidiness.
 *
 * The page carries a button that mirrors it, which is the only evidence
 * anyone has that the kit works right to left — a claim in a README is not
 * one. A demo page whose own chrome breaks under that button would be
 * evidence of the opposite, so its stylesheets are held to the rule they
 * are there to demonstrate.
 */
const files = [
  ...DIRS.flatMap((dir) =>
    readdirSync(`src/${dir}`)
      .filter((name) => name.endsWith('.vue'))
      .map((name) => ({
        name: `${dir}/${name}`,
        source: readFileSync(`src/${dir}/${name}`, 'utf8'),
      })),
  ),
  ...readdirSync('showcase')
    .filter((name) => name.endsWith('.vue'))
    .map((name) => ({
      name: `showcase/${name}`,
      source: readFileSync(`showcase/${name}`, 'utf8'),
    })),
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

  /*
   * A gradient that runs sideways picks a side, and CSS has no logical
   * keyword for it — `to inline-end` does not exist. So the rule cannot be
   * "write it logically"; it is "write it twice", the same answer
   * `BaseSwitch`'s `translateX` got.
   *
   * `ScrollArea`'s fades are the ones that matter — the fade at the edge
   * with more content past it is the only sign on screen that there is
   * more — and `BaseSlider` paints its own WebKit track, which would have
   * filled from the left while the thumb started on the right.
   */
  const SIDEWAYS = /linear-gradient\(\s*to (left|right)\s*,/g

  /* To the matching bracket, not to the first one: every stop in the kit is
     a `var()`, so a regex that stops at `)` reads one colour and calls the
     gradient symmetric. That is how this rule found nothing the first time
     it ran. */
  function stopsAt(source: string, from: number) {
    let depth = 1

    for (let at = from; at < source.length; at += 1) {
      if (source[at] === '(') depth += 1
      else if (source[at] === ')') {
        depth -= 1
        if (depth === 0) return source.slice(from, at)
      }
    }

    return source.slice(from)
  }

  /**
   * A gradient that reads the same mirrored, which many masks do.
   *
   * `to right, transparent, black 8%, black 92%, transparent` is the same
   * picture either way round: reverse the stops and take each position
   * from the far end, and you have what you started with. Such a gradient
   * picks no side, so asking it to be written twice would be asking for
   * two identical rules.
   */
  function symmetric(stops: string) {
    const parts = stops
      .split(',')
      .map((stop) => stop.trim())
      .filter(Boolean)

    const mirrored = parts
      .map((stop) => {
        const at = /^(.*?)\s+([\d.]+)%$/.exec(stop)
        return at ? `${at[1]} ${100 - Number(at[2])}%` : stop
      })
      .reverse()

    return parts.join('|') === mirrored.join('|')
  }

  function sideways(source: string) {
    const block = styles(source)

    return [...block.matchAll(SIDEWAYS)]
      .map((match) => stopsAt(block, match.index + match[0].length))
      .filter((stops) => !symmetric(stops))
  }

  it.each(files.filter(({ source }) => sideways(source).length > 0))(
    '$name paints sideways, so it says what right-to-left looks like',
    ({ source }) => {
      expect(styles(source)).toMatch(/\[dir='rtl'\]/)
    },
  )

  it('is looking at sideways gradients at all', () => {
    // Two today: `ScrollArea`'s fades and `BaseSlider`'s WebKit track. If
    // this reaches zero the rule above has stopped running.
    expect(files.filter(({ source }) => sideways(source).length > 0).length).toBeGreaterThanOrEqual(
      2,
    )
  })

  it('does not ask a symmetric mask to be written twice', () => {
    expect(
      sideways(
        '<style>\n.x {\n  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);\n}\n</style>',
      ),
    ).toEqual([])
  })

  it('does ask a one-sided one', () => {
    expect(
      sideways(
        '<style>\n.x {\n  background: linear-gradient(to right, black, transparent);\n}\n</style>',
      ),
    ).toHaveLength(1)
  })

  it('is looking at the files it thinks it is', () => {
    // A scan that quietly found nothing to scan would pass for ever.
    expect(files.length).toBeGreaterThan(100)
    expect(files.some(({ name }) => name === 'showcase/SideNav.vue')).toBe(true)
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
