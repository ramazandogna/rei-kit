import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'

import {
  MATERIALS,
  PALETTES,
  applyMaterial,
  applyPalette,
  isMaterial,
  isPaletteName,
} from '../index'
// @ts-expect-error -- a plain .mjs build script, imported for its measurements
import { PAIRINGS, contrast, failures } from '../../scripts/build-palettes.mjs'

/**
 * The appearance layer: materials, palettes, and the rule underneath both.
 *
 * Three axes — colour, material, motion — changed independently, which only
 * works while no component carries a value that belongs to one of them. The
 * tests here are mostly about keeping that true.
 */

const read = (path: string) => readFileSync(path, 'utf8')

afterEach(() => {
  delete document.documentElement.dataset['material']
  delete document.documentElement.dataset['palette']
})

describe('no component carries a colour of its own', () => {
  /* The rule in AGENTS.md, which was only ever written down. PriceCard broke
     it with four hand-picked hex values that could not follow a palette, and
     a test asserting those very values kept them in place. */
  const EXEMPT: Record<string, string> = {
    // Google's brand guidelines require its own four colours on its mark.
    'GoogleButton.vue': 'the Google mark',
  }

  const files = ['src/components', 'src/app', 'src/web', 'src/pwa'].flatMap((dir) =>
    readdirSync(dir)
      .filter((f) => f.endsWith('.vue'))
      .map((f) => `${dir}/${f}`),
  )

  it.each(files)('%s', (file) => {
    const name = file.split('/').pop()!
    if (EXEMPT[name]) return

    const code = read(file)
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')

    expect(code.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([])
  })
})

describe('palettes', () => {
  it('ship ten, each with both modes and a four-colour swatch', () => {
    expect(PALETTES).toHaveLength(10)
    for (const palette of PALETTES) {
      expect(palette.swatch).toHaveLength(4)
      expect(Object.keys(palette.light)).toEqual(Object.keys(palette.dark))
    }
  })

  it('clear WCAG AA on every pairing, in both modes', () => {
    /* 4.5:1 for text, 3:1 for the primary as a control. A palette that fails
       one pairing in one mode does not ship — which caught seven in Nord,
       Solarized, Gruvbox, Tokyo Night and Rosé Pine as their official values
       came in, every one fixed by the smallest nudge that clears the line. */
    expect(failures(PALETTES)).toEqual([])
  })

  it('choose the on-colour by measurement, not by habit', () => {
    // Solarized's yellow wants dark text, its blue wants white; nobody had to
    // decide that, which is the point.
    for (const palette of PALETTES) {
      for (const mode of ['light', 'dark'] as const) {
        const roles = palette[mode]
        expect(contrast(roles.onWarning, roles.warning)).toBeGreaterThanOrEqual(4.5)
      }
    }
    expect(PAIRINGS.length).toBeGreaterThan(5)
  })

  it('are generated from the source, and the generated files are current', () => {
    // A stale stylesheet would ship values the contrast test never saw.
    const before = [read('src/styles/palettes.css'), read('src/palettes/palettes.generated.json')]
    execFileSync('node', ['scripts/build-palettes.mjs'])
    const after = [read('src/styles/palettes.css'), read('src/palettes/palettes.generated.json')]

    expect(after).toEqual(before)
  })

  it('include the tokens’ own palette, value for value', () => {
    /* `rei` is what an app gets with no attribute at all. If tokens.css and the
       palette drifted, choosing "Rei" in a picker would change the colours of
       an app that was already on Rei. */
    const tokens = read('src/styles/tokens.css')
    const rei = PALETTES.find((p) => p.name === 'rei')!
    const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
    const block = (open: string) => {
      const i = tokens.indexOf(open)
      return tokens.slice(i, tokens.indexOf('}', i))
    }

    // Light: the grounds live in @theme, the filled roles in the layer.
    const light = block('@theme static {') + block(':where(:root) {')
    for (const [key, value] of Object.entries(rei.light)) {
      expect(light).toContain(`--color-${kebab(key)}: ${value};`)
    }

    // Dark: grounds in .dark, filled roles in :where(.dark) — every role that
    // differs from light has to be answered in one of them.
    const dark = block('\n.dark {') + block(':where(.dark) {')
    for (const [key, value] of Object.entries(rei.dark)) {
      if (value === rei.light[key as keyof typeof rei.light]) continue
      expect(dark).toContain(`--color-${kebab(key)}: ${value};`)
    }
  })

  it('let an app’s own brand win in both modes', () => {
    /* The filled roles are declared at zero specificity inside the theme layer.
       Written as a plain `.dark` rule they beat every app's @theme in the dark,
       and an app that rebranded its primary switched to dark mode and got
       Rei's blue — two consumers' own contract tests caught it pre-release. */
    const tokens = read('src/styles/tokens.css')
    const plainDark = tokens.slice(tokens.indexOf('\n.dark {'))
    const plainDarkBlock = plainDark.slice(0, plainDark.indexOf('}'))

    for (const role of ['primary', 'accent', 'positive', 'negative', 'warning']) {
      expect(plainDarkBlock).not.toContain(`--color-${role}:`)
      expect(plainDarkBlock).not.toContain(`--color-on-${role}:`)
    }
    expect(tokens).toContain('@theme reference {')
    expect(tokens).toContain(':where(.dark) {')
  })

  it('switch by attribute, and the default removes it', () => {
    applyPalette('nord')
    expect(document.documentElement.dataset['palette']).toBe('nord')

    applyPalette('rei')
    expect(document.documentElement.dataset['palette']).toBeUndefined()

    expect(isPaletteName('dracula')).toBe(true)
    expect(isPaletteName('comic-sans')).toBe(false)
  })
})

describe('materials', () => {
  const DEPTHS = ['--shadow-card', '--shadow-raised', '--shadow-overlay', '--shadow-control']

  it.each(MATERIALS.filter((m) => m !== 'quiet'))('%s redefines every depth', (material) => {
    // A material that forgot one level would leave that level quiet inside an
    // otherwise brutalist page — the one card that looks like it came from a
    // different app.
    const css = read(`src/styles/materials/${material}.css`)

    for (const depth of DEPTHS) expect(css).toContain(depth)
  })

  it('can restore quiet inside another material, with the defaults exactly', () => {
    /* quiet.css re-declares what tokens.css already says, so a quiet region
       can sit inside a glass page. Copied values drift unless something checks
       them, and a stale copy would make "quiet" mean last year's quiet. */
    const flat = (s: string) => s.replace(/\s+/g, ' ')
    const tokens = flat(read('src/styles/tokens.css'))
    const quiet = read('src/styles/materials/quiet.css')

    const decls = [...quiet.matchAll(/(--[a-z-]+):\s*([^;]+);/g)]
    expect(decls.length).toBeGreaterThan(15)

    for (const [, name, value] of decls) {
      expect(tokens).toContain(`${name}: ${flat(value!).trim()};`)
    }
  })

  it('bundles every material in materials.css', () => {
    const bundle = read('src/styles/materials.css')

    for (const material of MATERIALS.filter((m) => m !== 'quiet')) {
      expect(bundle).toContain(`./materials/${material}.css`)
    }
  })

  it('never blurs by default', () => {
    /* Any backdrop-filter, blur(0) included, turns an element into the
       containing block for its fixed descendants. Only a material that
       actually blurs should pay for that. */
    expect(read('src/styles/tokens.css')).toContain('--surface-backdrop: none;')
  })

  it('gives glass a way out for readers who asked for less transparency', () => {
    expect(read('src/styles/materials/glass.css')).toContain('prefers-reduced-transparency')
  })

  it('switches by attribute, and quiet removes it', () => {
    applyMaterial('glass')
    expect(document.documentElement.dataset['material']).toBe('glass')

    applyMaterial('quiet')
    expect(document.documentElement.dataset['material']).toBeUndefined()

    expect(isMaterial('brutal')).toBe(true)
    expect(isMaterial('skeuomorphic')).toBe(false)
  })
})

describe('depth reaches every component', () => {
  it('is never read through a frozen shadow utility', () => {
    /* Tailwind builds a theme shadow's utility by inlining its value, so a
       `shadow-control` class stays quiet's shadow whatever the material says.
       The brutalist buttons shipped flat for exactly this reason on the first
       try, while every card beside them had its hard offset. Only the runtime
       form -- `shadow-(--shadow-control)` -- reaches the material. */
    const files = ['src/components', 'src/app', 'src/web', 'src/pwa'].flatMap((dir) =>
      readdirSync(dir)
        .filter((f) => f.endsWith('.vue'))
        .map((f) => read(`${dir}/${f}`)),
    )

    const frozen = files
      .join('\n')
      .match(/(?<![-(\w])shadow-(control-pressed|control|card|raised|overlay)\b(?!\))/g)

    expect(frozen ?? []).toEqual([])
    expect(
      read('src/styles/tokens.css').slice(0, read('src/styles/tokens.css').indexOf(':root {')),
    ).not.toContain('--shadow-card')
  })
})

describe('motion', () => {
  it('lives in tokens rather than in components', () => {
    /* Ten durations and a cubic-bezier pasted into eight files is how a
       material could not have reached the motion at all. */
    const files = ['src/components', 'src/app', 'src/web'].flatMap((dir) =>
      readdirSync(dir)
        .filter((f) => f.endsWith('.vue'))
        .map((f) => read(`${dir}/${f}`)),
    )

    const pasted = files.join('\n').match(/cubic-bezier\(/g) ?? []
    expect(pasted).toEqual([])
  })

  it('stops for a reader who asked it to', () => {
    expect(read('src/styles/tokens.css')).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*--duration-fast: 0ms/,
    )
  })
})
