import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'
import tailwindcss from '@tailwindcss/vite'

/**
 * Button, text input and modal dialog — the three parts every product has —
 * bundled with each kit and minified the way an app's production build is.
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

const cases = readdirSync(here('cases')).map((file) => file.replace(/\.js$/, ''))
const rows = []

for (const name of cases) {
  const outDir = here(`out/${name}`)

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
        input: here(`cases/${name}.js`),
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

  const version = JSON.parse(readFileSync(here(`node_modules/${name}/package.json`), 'utf8')).version
  rows.push({ name: `${name} ${version}`, js: sum('.js'), css: sum('.css') })
}

rows.sort((a, b) => a.js + a.css - (b.js + b.css))

console.log('\nButton + Input + Modal, minified + gzip -9, Vue excluded\n')
console.log(`  ${'kit'.padEnd(24)}${'JS'.padStart(10)}${'CSS'.padStart(10)}${'total'.padStart(10)}`)
for (const { name, js, css } of rows) {
  console.log(
    `  ${name.padEnd(24)}${kb(js).padStart(10)}${kb(css).padStart(10)}${kb(js + css).padStart(10)}`,
  )
}
console.log('')
