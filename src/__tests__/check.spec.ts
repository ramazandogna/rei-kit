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

describe('the roles that change after dark', () => {
  /* `@theme` compiles to `:root` and Tailwind emits it early. A plain
     `.dark { … }` has the same specificity and arrives after, so it wins: a
     role restated for the day and not for the night keeps the kit's value
     after dark, and the app comes up in somebody else's colours with every
     check green. An app in this family found this; the kit did not.

     `:where(.dark)` is the deliberate opposite — no specificity at all, so
     an app's brand survives the night without restating anything. The kit
     puts the filled roles there for exactly that reason. */
  const brand = (theme: string, dark = '') =>
    `@import 'tailwindcss';\n@import 'rei-kit/mobile.css';\n@theme {\n${theme}\n}\n${dark}`

  it('reports a role the kit sets in a plain .dark', () => {
    const reported = checkStyling({ css: brand('  --color-canvas: #fff;'), tokens })
      .map((problem) => problem.message)
      .join(' ')

    expect(reported).toMatch(/at night/i)
    expect(reported).toContain('canvas')
  })

  it('leaves alone a role the kit sets in :where(.dark)', () => {
    /* The false alarm this check cried once, against a real app: nine roles
       reported as broken that were already correct, because `:where` carries
       no specificity and the app's `@theme` beats it. A check that cries
       wolf is worse than no check. */
    const reported = checkStyling({ css: brand('  --color-primary: #6b4de6;'), tokens })

    expect(reported).toEqual([])
  })

  it('is satisfied once the night answers too', () => {
    const css = brand('  --color-canvas: #fff;', '.dark {\n  --color-canvas: #000;\n}\n')

    expect(checkStyling({ css, tokens })).toEqual([])
  })

  it('does not ask an app that redefines nothing', () => {
    expect(
      checkStyling({ css: "@import 'tailwindcss';\n@import 'rei-kit/mobile.css';\n", tokens }),
    ).toEqual([])
  })

  it('reads the rule bodies rather than slicing from the word', () => {
    /* A comment that mentions the selector must not start the slice. An
       app's own first attempt did, and passed while the fault was live. */
    const css = brand(
      '  --color-canvas: #fff;',
      '/* the .dark block below answers it */\n.dark {\n  --color-canvas: #000;\n}\n',
    )

    expect(checkStyling({ css, tokens })).toEqual([])
  })

  it('reads a body that holds nested rules', () => {
    const css = brand(
      '  --color-canvas: #fff;',
      '.dark {\n  --color-canvas: #000;\n  @media (min-width: 40rem) {\n    --color-hair: #111;\n  }\n}\n',
    )

    expect(checkStyling({ css, tokens })).toEqual([])
  })
})

describe('a kit reached by path rather than by package', () => {
  /* The kit's own showcase, and any workspace that builds the two together.
     The first version of this check read `@import 'rei-kit/…'` literally and
     told the showcase three times that it had imported none of what it had
     plainly imported. */
  const WORKSPACE = `@import 'tailwindcss';
@import '../src/styles/tokens.css';
@import '../src/styles/shell/mobile.css';
@source '../src';
`

  it('recognises the stylesheets by their file', () => {
    const reported = checkStyling({ css: WORKSPACE, tokens })
      .map((p) => p.message)
      .join(' ')

    expect(reported).not.toMatch(/never defined/i)
  })

  it('does not ask it for an @source into node_modules', () => {
    /* It has no node_modules copy to point at, and where it keeps the source
       is its own business. */
    const reported = checkStyling({ css: WORKSPACE, tokens })
      .map((p) => p.message)
      .join(' ')

    expect(reported).not.toMatch(/scan the kit/i)
  })

  it('still asks an installed app for it', () => {
    const installed = `@import 'tailwindcss';\n@import 'rei-kit/tokens.css';\n@import 'rei-kit/styles.css';\n`
    const reported = checkStyling({ css: installed, tokens })
      .map((p) => p.message)
      .join(' ')

    expect(reported).toMatch(/scan the kit/i)
  })
})

describe('the showcase is a consumer too', () => {
  /* The nearest real app to hand, and the one that exercises the path-import
     shape. Running the check against it keeps the two in step: a rule that
     starts reporting the kit's own site is a rule that would report somebody
     else's workspace the same way, and this says so before they find out. */
  it('passes its own check', () => {
    const problems = checkStyling({ css: readFileSync('showcase/main.css', 'utf8'), tokens })

    expect(problems.map((problem) => problem.message)).toEqual([])
  })
})
