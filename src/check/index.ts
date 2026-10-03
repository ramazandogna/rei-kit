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

function imports(css: string, file: string): boolean {
  return new RegExp(`@import\\s+['"]rei-kit/${file}['"]`).test(css)
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

    if (!/@source\s+['"][^'"]*node_modules\/rei-kit[^'"]*['"]/.test(css)) {
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

  return problems
}
