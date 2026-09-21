import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'
import tailwindcss from '@tailwindcss/vite'

/**
 * What an app actually downloads, measured the way an app builds it.
 *
 * The size of `dist/index.js` says little: an app never ships the whole file,
 * it ships what its bundler keeps. So each case here is a tiny app, bundled
 * and minified by Vite like a real one, with Vue left out because the app pays
 * for Vue whichever kit it picks.
 *
 * Each case has a budget. Going over fails `check`, so a component that drags
 * the whole barrel in behind it — a stray side effect at the top of a module —
 * is caught the day it lands rather than by a user's bundle analyser.
 *
 * `bench/` runs the same measurement against other kits.
 */

const ROOT = process.cwd()
const WORK = resolve(ROOT, 'node_modules/.tmp/size')
const dist = (file) => resolve(ROOT, 'dist', file)

const JS_CASES = [
  {
    name: 'BaseButton alone',
    budget: 2,
    code: `import { BaseButton } from '${dist('index.js')}'\nconsole.log(BaseButton)`,
  },
  {
    name: 'Button + Input + Modal',
    budget: 4,
    code: `import { BaseButton, BaseInput } from '${dist('index.js')}'\nimport { BaseModal } from '${dist('web.js')}'\nconsole.log(BaseButton, BaseInput, BaseModal)`,
  },
  {
    name: 'every component',
    // Raised deliberately as the kit grows, and only ever with the number
    // that moved it: 25.6 KB at 2.4, 29.1 at 2.5 (six controls), 31.2 at 2.6
    // (the calendar), 34.1 at 2.7 (ten small parts, about 0.3 KB each),
    // 36.7 at 2.8 (the data table, the command menu and the listbox),
    // 40.7 at 2.13 (the combobox's multiple mode, its debounced search and
    // its virtual window -- 0.8 KB for all three, which is the whole of
    // what a virtual list usually costs as a dependency), 41.4 at 2.14
    // (the mega menu), 42.0 at 2.15 (the slider field and the tooltip's
    // pointer tracking -- 0.5 KB, most of it the field).
    budget: 48, // 47.3 KB at 2.22.0: SkipLink, AnnounceHost, ErrorSummary.
    code: ['index', 'web', 'app', 'pwa', 'motion']
      .map((entry) => `import * as ${entry} from '${dist(`${entry}.js`)}'\nconsole.log(${entry})`)
      .join('\n'),
  },
]

/* A preset brings its own `@source`, so those cases add none: if the preset
   stopped finding the components, the build would still pass and the size
   would drop. `mustContain` is what catches that — a rule from a template
   class, one from a compiled scoped style, and one from a kit utility. */
const MUST_CONTAIN = ['.bg-primary', '.rk-modal-panel', '.surface-overlay', '.focus-ring']

const CSS_CASES = [
  {
    name: 'core only',
    // Raised with the number that moved it: 12.1 KB at 2.2, 14.4 at 2.6
    // (the calendar), 16.6 at 2.8 (the data table and the command menu),
    // 18.0 at 2.14 (the mega menu's panel and columns).
    budget: 21, // 20.0 KB at 2.22.0: the error summary, and logical properties
    // are longer to spell than the physical ones they replaced.
    imports: ['tokens.css', 'shell/mobile.css', 'styles.css'],
    source: true,
  },
  /* Raised with the number that moved them: 20.2/19.9 KB at 2.11, 21.1/20.8
     at 2.16 (the colour picker's well, hex field and swatches). */
  { name: 'mobile.css preset', budget: 23, // 22.1 KB at 2.19.0: CodeBlock and the drawer.
 imports: ['mobile.css'], source: false },
  { name: 'web.css preset', budget: 23, // 22.1 KB at 2.19.0: CodeBlock and the drawer.
 imports: ['web.css'], source: false },
]

const kb = (bytes) => (bytes / 1024).toFixed(1)
const gzip = (buffer) => gzipSync(buffer, { level: 9 }).length

async function bundle(name, entryFile, plugins = []) {
  const outDir = resolve(WORK, 'out', name)

  await build({
    logLevel: 'silent',
    configFile: false,
    root: WORK,
    plugins,
    build: {
      outDir,
      emptyOutDir: true,
      minify: true,
      rollupOptions: {
        input: entryFile,
        external: [/^vue$/, /^vue-router$/, /^vue-i18n$/, /^lucide-vue-next$/],
        output: { entryFileNames: 'entry.js', assetFileNames: '[name][extname]' },
      },
    },
  })

  const files = readdirSync(outDir, { recursive: true, encoding: 'utf8' })

  const read = (extension) =>
    files
      .filter((file) => file.endsWith(extension))
      .map((file) => readFileSync(resolve(outDir, file)))

  return {
    size: (extension) => read(extension).reduce((sum, buffer) => sum + gzip(buffer), 0),
    text: (extension) => read(extension).join('\n'),
  }
}

rmSync(WORK, { recursive: true, force: true })
mkdirSync(WORK, { recursive: true })

const rows = []

for (const [index, { name, budget, code }] of JS_CASES.entries()) {
  const entry = resolve(WORK, `js-${index}.js`)
  writeFileSync(entry, code)
  const size = (await bundle(`js-${index}`, entry)).size('.js')
  rows.push({ name, kind: 'JS', size, budget })
}

const blind = []

for (const [index, { name, budget, imports, source }] of CSS_CASES.entries()) {
  const entry = resolve(WORK, `css-${index}.css`)
  writeFileSync(
    entry,
    [
      // `source(none)`: Tailwind would otherwise scan the working directory —
      // this repository, `src/` and all — and find every class whether the
      // stylesheet under test points at them or not.
      `@import 'tailwindcss' source(none);`,
      ...imports.map((file) => `@import '${dist(file)}';`),
      ...(source ? [`@source '${resolve(ROOT, 'dist')}';`] : []),
    ].join('\n'),
  )
  const output = await bundle(`css-${index}`, entry, [tailwindcss()])
  rows.push({ name, kind: 'CSS', size: output.size('.css'), budget })

  const css = output.text('.css')
  const missing = MUST_CONTAIN.filter((selector) => !css.includes(selector))
  if (missing.length > 0) blind.push(`${name} lacks ${missing.join(', ')}`)
}

const over = rows.filter(({ size, budget }) => size / 1024 > budget)

console.log('\nsize, gzip level 9, Vue excluded:\n')
for (const { name, kind, size, budget } of rows) {
  const mark = size / 1024 > budget ? '✗' : '✓'
  console.log(
    `  ${mark} ${kind.padEnd(4)}${name.padEnd(26)}${kb(size).padStart(6)} KB   budget ${budget} KB`,
  )
}
console.log('')

if (blind.length > 0) {
  console.error(`A stylesheet no longer finds the components:\n  ${blind.join('\n  ')}\n`)
  process.exit(1)
}

if (over.length > 0) {
  console.error(
    `Over budget: ${over.map(({ name }) => name).join(', ')}.\n` +
      `If the growth is deliberate, raise the budget in scripts/size.mjs and say why in the commit.\n`,
  )
  process.exit(1)
}
