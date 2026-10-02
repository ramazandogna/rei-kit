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

  return problems
}
