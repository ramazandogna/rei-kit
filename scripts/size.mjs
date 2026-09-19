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
    budget: 28,
    code: ['index', 'web', 'app', 'pwa']
      .map((entry) => `import * as ${entry} from '${dist(`${entry}.js`)}'\nconsole.log(${entry})`)
      .join('\n'),
  },
]

const CSS_CASES = [
  {
    name: 'styles, all components',
    budget: 14,
    imports: ['tokens.css', 'shell/mobile.css', 'styles.css'],
  },
  {
    name: '+ materials + palettes',
    budget: 17,
    imports: ['tokens.css', 'shell/mobile.css', 'materials.css', 'palettes.css', 'styles.css'],
  },
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

  return (extension) =>
    files
      .filter((file) => file.endsWith(extension))
      .reduce((sum, file) => sum + gzip(readFileSync(resolve(outDir, file))), 0)
}

rmSync(WORK, { recursive: true, force: true })
mkdirSync(WORK, { recursive: true })

const rows = []

for (const [index, { name, budget, code }] of JS_CASES.entries()) {
  const entry = resolve(WORK, `js-${index}.js`)
  writeFileSync(entry, code)
  const size = (await bundle(`js-${index}`, entry))('.js')
  rows.push({ name, kind: 'JS', size, budget })
}

for (const [index, { name, budget, imports }] of CSS_CASES.entries()) {
  const entry = resolve(WORK, `css-${index}.css`)
  writeFileSync(
    entry,
    [
      `@import 'tailwindcss';`,
      ...imports.map((file) => `@import '${dist(file)}';`),
      `@source '${resolve(ROOT, 'dist')}';`,
    ].join('\n'),
  )
  const size = (await bundle(`css-${index}`, entry, [tailwindcss()]))('.css')
  rows.push({ name, kind: 'CSS', size, budget })
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

if (over.length > 0) {
  console.error(
    `Over budget: ${over.map(({ name }) => name).join(', ')}.\n` +
      `If the growth is deliberate, raise the budget in scripts/size.mjs and say why in the commit.\n`,
  )
  process.exit(1)
}
