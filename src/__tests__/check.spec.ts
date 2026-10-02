import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { checkStyling } from '../check/index'

/**
 * The check an app runs against its own stylesheet.
 *
 * Every fault it reports is one that leaves a green build and a page that
 * renders: a missing `@source` means Tailwind emits no utility the components
 * ask for, a missing stylesheet import means they keep their markup and lose
 * their layout, a colour role nobody defines makes `bg-primary` emit nothing
 * at all. One app in this family shipped with its tab bar invisible that way,
 * and both of them then wrote the same check — which is what moved it here.
 *
 * So these cases are written as the stylesheets an app would actually have,
 * and each one asserts the fault is *found*. A checker that returns an empty
 * list for everything passes a test that only ever gives it correct input.
 */
const tokens = readFileSync('src/styles/tokens.css', 'utf8')

const PRESET = `@import 'tailwindcss';\n@import 'rei-kit/mobile.css';\n`

const PARTS = `@import 'tailwindcss';
@import 'rei-kit/tokens.css';
@import 'rei-kit/styles.css';
@source '../../node_modules/rei-kit/dist';
`

const messages = (css: string) => checkStyling({ css, tokens }).map((p) => p.message)

describe('an app wired the short way', () => {
  it('has nothing to report', () => {
    expect(checkStyling({ css: PRESET, tokens })).toEqual([])
  })

  it('is not asked for the parts the preset already carries', () => {
    /* The apps' own copies predate the preset and ask for `tokens.css` and
       the `@source` by name. Reporting those against a preset would be three
       faults an app does not have, which is how a check stops being read. */
    expect(messages(PRESET)).toEqual([])
  })

  it('says so when both presets are imported', () => {
    const both = `${PRESET}@import 'rei-kit/web.css';\n`

    expect(messages(both).join(' ')).toMatch(/both presets/i)
  })
})

describe('an app wired the long way', () => {
  it('has nothing to report when every line is there', () => {
    expect(checkStyling({ css: PARTS, tokens })).toEqual([])
  })

  it('finds the missing component styles', () => {
    const css = PARTS.replace("@import 'rei-kit/styles.css';\n", '')

    expect(messages(css).join(' ')).toMatch(/component styles/i)
  })

  it('finds the missing @source', () => {
    const css = PARTS.replace("@source '../../node_modules/rei-kit/dist';\n", '')

    expect(messages(css).join(' ')).toMatch(/scan the kit/i)
  })

  it('names the colour roles an app never defined', () => {
    const css = `@import 'tailwindcss';\n@import 'rei-kit/styles.css';\n@source './node_modules/rei-kit/dist';\n`
    const reported = messages(css).join(' ')

    expect(reported).toMatch(/never defined/i)
    /* Named rather than counted: "eleven roles are missing" is not something
       anybody can act on. */
    expect(reported).toContain('primary')
  })

  it('accepts roles the app declares itself', () => {
    /* Redefining a role is the documented way to rebrand, so an app that
       states them all has not got the fault even without the import. */
    const own = [...tokens.matchAll(/--color-([a-z0-9-]+)\s*:/g)]
      .map(([, name]) => `  --color-${name}: #000;`)
      .join('\n')
    const css = `@import 'tailwindcss';\n@import 'rei-kit/styles.css';\n@source './node_modules/rei-kit/dist';\n@theme {\n${own}\n}\n`

    expect(messages(css).join(' ')).not.toMatch(/never defined/i)
  })
})

describe('what it reports', () => {
  it('offers the line to add', () => {
    const problems = checkStyling({ css: `@import 'tailwindcss';\n`, tokens })

    expect(problems.length).toBeGreaterThan(0)
    for (const problem of problems) expect(problem.fix).toBeTruthy()
  })
})
