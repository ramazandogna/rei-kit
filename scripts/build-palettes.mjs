/**
 * Turns `src/palettes/palettes.source.json` into the files the kit ships.
 *
 *   src/styles/palettes.css                — `[data-palette]` rules, both modes
 *   src/palettes/palettes.generated.json   — resolved values for the runtime API
 *
 * Generated rather than hand-written because a palette is eleven roles times
 * two modes, plus five on-colours each, times ten palettes: 320 values that
 * must stay in step between a stylesheet and a picker. Written twice by hand,
 * they would disagree by the second edit.
 *
 * The on-colours are *chosen*, not declared. For every filled role the script
 * takes whichever of white or the palette's own darkest ink reads better on
 * it. That is how Solarized's yellow gets dark text and its blue gets white,
 * without anybody having to remember that it should.
 *
 * `--check` measures every text pairing the kit actually renders and exits
 * non-zero if a palette falls below the line — the same numbers the unit test
 * asserts, runnable on its own while a palette is being designed.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Scripts run from the package root (`pnpm palettes`), and the unit test
// imports this file for its measurements -- where `import.meta.url` is Vite's,
// not the file's. The working directory is the one thing both agree on.
const ROOT = process.cwd()

// ---------------------------------------------------------------- contrast --

function channel(c) {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// ------------------------------------------------------------------ roles --

const FILLED = ['primary', 'accent', 'positive', 'negative', 'warning']

/**
 * The palette's own darkest tone, for text on a light fill.
 *
 * Its own rather than a generic black, so dark text on Gruvbox's yellow is
 * Gruvbox's brown-black and on Nord's green is Nord's polar night -- the kind
 * of thing nobody notices when it is right and everybody feels when it is not.
 */
function darkest(palette) {
  const inks = [palette.light.ink, palette.dark.canvas, palette.dark.surface]
  return inks.sort((a, b) => luminance(a) - luminance(b))[0]
}

function resolve(palette) {
  const dark = darkest(palette)
  const out = { ...palette }

  for (const mode of ['light', 'dark']) {
    const roles = { ...palette[mode] }
    for (const role of FILLED) {
      const fill = roles[role]
      const best = (options) =>
        options.reduce((a, b) => (contrast(a, fill) >= contrast(b, fill) ? a : b))

      // The palette's own voice first; a neutral near-black only when the
      // palette's darkest tone is not dark enough to be read on that fill.
      let on = best(['#ffffff', dark])
      if (contrast(on, fill) < 4.5) on = best(['#ffffff', dark, '#111111'])

      roles[`on${role[0].toUpperCase()}${role.slice(1)}`] = on
    }
    out[mode] = roles
  }

  out.swatch = palette.swatch ?? [
    palette.light.primary,
    palette.light.accent,
    palette.light.positive,
    palette.light.warning,
  ]

  return out
}

// ------------------------------------------------------------------ checks --

/**
 * Every pairing a reader actually meets, with the line it has to clear.
 *
 * 4.5:1 is WCAG AA for body text. 3:1 is the line for large text and for
 * non-text UI — a focus ring, an icon, a border — which is what `primary`
 * mostly is when it is not a filled button. A palette that fails any of these
 * does not ship.
 */
export const PAIRINGS = [
  ['ink', 'canvas', 4.5],
  ['ink', 'surface', 4.5],
  ['inkSoft', 'surface', 4.5],
  ['inkSoft', 'canvas', 4.5],
  ['onPrimary', 'primary', 4.5],
  ['onAccent', 'accent', 4.5],
  ['onPositive', 'positive', 4.5],
  ['onNegative', 'negative', 4.5],
  ['onWarning', 'warning', 4.5],
  ['primary', 'surface', 3],
]

export function failures(resolved) {
  const out = []
  for (const palette of resolved) {
    for (const mode of ['light', 'dark']) {
      for (const [fg, bg, min] of PAIRINGS) {
        const ratio = contrast(palette[mode][fg], palette[mode][bg])
        if (ratio < min) out.push({ palette: palette.name, mode, fg, bg, ratio, min })
      }
    }
  }
  return out
}

// --------------------------------------------------------------------- css --

const kebab = (key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

function declarations(roles) {
  return Object.entries(roles)
    .map(([key, value]) => `  --color-${kebab(key)}: ${value};`)
    .join('\n')
}

function css(resolved) {
  const blocks = resolved.map(
    (p) => `/* ${p.label} — ${p.origin} */
[data-palette='${p.name}'] {
${declarations(p.light)}
}

.dark[data-palette='${p.name}'],
.dark [data-palette='${p.name}'] {
${declarations(p.dark)}
  --shadow-color: #000000;
}`,
  )

  return `/* rei-kit palettes. Generated by scripts/build-palettes.mjs — edit
 * src/palettes/palettes.source.json and run \`pnpm palettes\`, never this file.
 *
 * Import after \`tokens.css\` and choose one with an attribute:
 *
 *   <html data-palette="nord">
 *
 * or at runtime with \`applyPalette('nord')\` / \`usePalette()\`. Every palette
 * has a light and a dark mode, and every text pairing in both has been
 * measured against WCAG AA before it was allowed in this file. */

${blocks.join('\n\n')}
`
}

// -------------------------------------------------------------------- main --

/** Imported by the test for `contrast` and `failures`; only run when invoked. */
const invoked = (process.argv[1] ?? '').endsWith('build-palettes.mjs')

const source = invoked
  ? JSON.parse(readFileSync(join(ROOT, 'src/palettes/palettes.source.json'), 'utf8'))
  : []
const resolved = source.map(resolve)

if (invoked && process.argv.includes('--check')) {
  const bad = failures(resolved)
  for (const f of bad) {
    console.log(
      `${f.palette.padEnd(12)} ${f.mode.padEnd(5)} ${f.fg} on ${f.bg}: ${f.ratio.toFixed(2)} < ${f.min}`,
    )
  }
  console.log(bad.length ? `\n${bad.length} failing pairing(s)` : 'every pairing passes')
  process.exit(bad.length ? 1 : 0)
}

if (invoked) {
  writeFileSync(join(ROOT, 'src/styles/palettes.css'), css(resolved))
  writeFileSync(
    join(ROOT, 'src/palettes/palettes.generated.json'),
    JSON.stringify(resolved, null, 2) + '\n',
  )
  console.log(`build-palettes: ${resolved.length} palettes`)
}
