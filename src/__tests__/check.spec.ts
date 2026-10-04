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

describe('the order the parts are imported in', () => {
  /* `tokens.css` sets `--surface-opacity` under `:root`; a material resets it
     under `[data-material='glass']`. The two selectors carry the same
     specificity, so source order settles it — and with the material first it
     computes to 100% rather than 56%, measured in a real build. The build is
     green, the attribute is on the element, and the material is inert.

     Written in `AGENTS.md` and in `materials.css`'s own header since they
     existed, and enforced by nothing until now. */
  const parts = (order: string[]) =>
    `@import 'tailwindcss';\n${order.map((f) => `@import 'rei-kit/${f}';`).join('\n')}\n@source './node_modules/rei-kit/dist';\n`

  it('accepts the material after the tokens', () => {
    const css = parts(['tokens.css', 'materials.css', 'styles.css'])

    expect(checkStyling({ css, tokens })).toEqual([])
  })

  it('reports the material before the tokens', () => {
    const css = parts(['materials.css', 'tokens.css', 'styles.css'])
    const reported = checkStyling({ css, tokens })
      .map((p) => p.message)
      .join(' ')

    expect(reported).toMatch(/after tokens\.css/i)
    expect(reported).toContain('materials.css')
  })

  it('names every part that is too early, not just the first', () => {
    const css = parts(['materials.css', 'palettes.css', 'tokens.css', 'styles.css'])
    const reported = checkStyling({ css, tokens })
      .map((p) => p.message)
      .join(' ')

    expect(reported).toContain('materials.css')
    expect(reported).toContain('palettes.css')
  })

  it('does not ask it of a preset, which orders its own parts', () => {
    expect(
      checkStyling({ css: "@import 'tailwindcss';\n@import 'rei-kit/mobile.css';\n", tokens }),
    ).toEqual([])
  })
})

describe('what the order rule does not ask about', () => {
  it('leaves motion.css wherever it is', () => {
    /* It shares no custom property with `tokens.css`, so nothing it sets can
       be overwritten by anything tokens sets and its position cannot matter.
       4.1.0 asked about it regardless — a false alarm, and the fourth this
       check has produced in the hands of the person writing it. */
    const css = `@import 'tailwindcss';\n@import 'rei-kit/motion.css';\n@import 'rei-kit/tokens.css';\n@import 'rei-kit/styles.css';\n@source './node_modules/rei-kit/dist';\n`

    expect(checkStyling({ css, tokens })).toEqual([])
  })

  it('still reports a palette that comes too early', () => {
    const css = `@import 'tailwindcss';\n@import 'rei-kit/palettes.css';\n@import 'rei-kit/tokens.css';\n@import 'rei-kit/styles.css';\n@source './node_modules/rei-kit/dist';\n`

    expect(
      checkStyling({ css, tokens })
        .map((p) => p.message)
        .join(' '),
    ).toContain('palettes.css')
  })
})

describe('text on a filled role', () => {
  const tokens = readFileSync('src/styles/tokens.css', 'utf8')
  const wired = (theme: string) =>
    `@import 'tailwindcss';\n@import 'rei-kit/mobile.css';\n@theme {\n${theme}\n}\n`

  it('passes a role whose on-colour is measured against it', () => {
    expect(
      checkStyling({
        css: wired('  --color-primary: #67c090;\n  --color-on-primary: #07141a;'),
        tokens,
      }),
    ).toEqual([])
  })

  /* The exact pair this rule was written for: light green with the net's own
     white on it, which is what an app gets by rebranding a role and leaving
     `on-primary` alone. It is readable enough to look fine and measures
     under the line. */
  it('fails a role the net cannot rescue', () => {
    const problems = checkStyling({ css: wired('  --color-positive: #3f8f5f;'), tokens })

    expect(problems).toHaveLength(1)
    expect(problems[0]!.message).toContain('3.96:1')
  })

  /* A role lightened for the dark is a second pair, and the one nobody looks
     at: the day's on-colour stays unless the app restates it. */
  it('measures the night separately', () => {
    const css = `${wired('  --color-primary: #12544f;\n  --color-on-primary: #ffffff;')}\n.dark {\n  --color-primary: #8bbb92;\n}\n`
    const problems = checkStyling({ css, tokens })

    expect(problems.map((problem) => problem.message).join()).toContain('primary by night')
  })

  /* Hibi names its colours by pigment and reaches the roles through var().
     A reader that only takes a literal measures nothing in the one
     stylesheet in this family that most needs measuring — and this is the
     pair that stylesheet describes in a comment: white on leaf, 2.21:1. */
  it('follows an alias to the pigment it names', () => {
    const problems = checkStyling({
      css: wired(
        '  --color-leaf: #67c090;\n  --color-positive: var(--color-leaf);\n  --color-on-positive: #ffffff;',
      ),
      tokens,
    })

    expect(problems[0]!.message).toContain('#67c090')
  })

  /* The rule carries its own copy of the `oklch()` net in `tokens.css`,
     because evaluating a `calc()` out of a stylesheet is a CSS engine. These
     two fills sit either side of its 0.6 lightness threshold, and each is
     paired with the ink the net is supposed to pick: a copy that chose the
     other way round would measure the other pair and report it. */
  it.each([
    ['dark enough for white', '#12544f', '#ffffff'],
    ['light enough for black', '#8bbb92', '#000000'],
  ])('picks the ink tokens.css would, %s', (_case, fill, ink) => {
    expect(checkStyling({ css: wired(`  --color-primary: ${fill};`), tokens })).toEqual([])

    const flipped = checkStyling({
      css: wired(
        `  --color-primary: ${fill};\n  --color-on-primary: ${ink === '#ffffff' ? '#000000' : '#ffffff'};`,
      ),
      tokens,
    })

    expect(flipped).toHaveLength(1)
  })

  it('skips a value it cannot resolve rather than guessing', () => {
    expect(
      checkStyling({
        css: wired('  --color-primary: oklch(0.6 0.1 200);'),
        tokens,
      }),
    ).toEqual([])
  })
})
