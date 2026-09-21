import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'
import tailwindcss from '@tailwindcss/vite'

/**
 * The same components, bundled with each kit and minified the way an app's
 * production build is.
 *
 * Two cases, and the second is the one that matters. **Three** — a button, a
 * text input and a modal — is the smallest real app, and it is the case
 * least favourable to rei-kit: the stylesheet is flat, so three components
 * carry the whole of it. **Ten** adds a select, a checkbox, a switch, tabs,
 * a table, a tooltip and a card, which is a real screen rather than a demo,
 * and it is where the shapes of the two curves show.
 *
 * Reading one case only is how a comparison lies in either direction. What
 * is being measured is the slope: rei-kit's CSS is flat and its JavaScript
 * grows a little per component; the kits that put their styles in the
 * JavaScript have no flat part at all.
 *
 * Each kit is set up the way its own documentation sets it up first, styles
 * included, because a kit whose JavaScript is small and whose stylesheet is
 * not has only moved the cost. Vue is left out: every one of them needs it.
 *
 * Run it yourself: `npm install && npm run bench`. The versions are pinned in
 * package.json so the numbers are about the kits, not about the day.
 */

const here = (path) => fileURLToPath(new URL(path, import.meta.url))
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`
const gzip = (buffer) => gzipSync(buffer, { level: 9 }).length

/* rei-kit's styles come from the app's own Tailwind build, so the case gets
   the stylesheet an app would write — every component's classes included,
   not only the three used here. */
const reiKitCss = {
  name: 'rei-kit-css',
  resolveId: (id) => (id === 'virtual:rei-kit.css' ? here('rei-kit.css') : undefined),
}

const SUITES = [
  { id: 'three', dir: 'cases', label: 'Button + Input + Modal' },
  { id: 'ten', dir: 'cases-ten', label: 'Ten components' },
]

const results = []

for (const suite of SUITES) {
  const cases = readdirSync(here(suite.dir)).map((file) => file.replace(/\.js$/, ''))
  const rows = []

  for (const name of cases) {
    const outDir = here(`out/${suite.id}/${name}`)

    await build({
      logLevel: 'silent',
      configFile: false,
      root: here('.'),
      define: { 'process.env.NODE_ENV': '"production"' },
      plugins: [reiKitCss, tailwindcss()],
      build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: {
          input: here(`${suite.dir}/${name}.js`),
          external: [/^vue$/, /^@vue\//],
          output: { entryFileNames: 'entry.js', assetFileNames: '[name][extname]' },
        },
      },
    })

    const files = readdirSync(outDir, { recursive: true, encoding: 'utf8' })
    const sum = (extension) =>
      files
        .filter((file) => file.endsWith(extension))
        .reduce((total, file) => total + gzip(readFileSync(`${outDir}/${file}`)), 0)

    const version = JSON.parse(
      readFileSync(here(`node_modules/${name}/package.json`), 'utf8'),
    ).version

    rows.push({ name: `${name} ${version}`, js: sum('.js'), css: sum('.css') })
  }

  rows.sort((a, b) => a.js + a.css - (b.js + b.css))
  results.push({ id: suite.id, label: suite.label, rows })
}

for (const suite of results) {
  console.log(`\n${suite.label}, minified + gzip -9, Vue excluded\n`)
  console.log(
    `  ${'kit'.padEnd(24)}${'JS'.padStart(10)}${'CSS'.padStart(10)}${'total'.padStart(10)}`,
  )
  for (const { name, js, css } of suite.rows) {
    console.log(
      `  ${name.padEnd(24)}${kb(js).padStart(10)}${kb(css).padStart(10)}${kb(js + css).padStart(10)}`,
    )
  }
}
console.log('')

/*
 * Written out as well as printed, because the showcase reads it.
 *
 * A comparison table typed into a page by hand is a comparison table that
 * is wrong by the next release — this one went from 18.4 KB to 26.1 KB
 * while nobody edited it. Re-running the bench is now what updates the
 * page, and a test fails if the file is missing or names the wrong version.
 */
writeFileSync(
  here('results.json'),
  `${JSON.stringify({ measured: new Date().toISOString().slice(0, 10), suites: results }, null, 2)}\n`,
)
