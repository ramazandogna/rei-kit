import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * A peer dependency must be imported by the bundle, never inlined into it.
 *
 * A second copy of a library that communicates through provide/inject is not a
 * redundant copy -- it is a different injection key, so the consumer's provider
 * becomes invisible. vue-router shipped inlined in 0.2.0 exactly this way, and
 * every RouterLink in the kit injected a router the app had never provided.
 *
 * This runs as part of `build-only`, which is what `check` ends with and what
 * `prepublishOnly` invokes, so a bundle that inlines a peer cannot be published.
 */

const url = (path) => fileURLToPath(new URL(path, import.meta.url))
const read = (path) => readFileSync(url(path), 'utf8')

const { peerDependencies = {} } = JSON.parse(read('../package.json'))
const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Bare module specifiers a file imports, ignoring relative chunks. */
const importsOf = (code) =>
  [...code.matchAll(/from\s*['"]([^'".][^'"]*)['"]/g)].map(([, specifier]) => specifier)

const readAll = (dir, match) =>
  readdirSync(url(dir), { recursive: true, encoding: 'utf8' })
    .filter((name) => match.test(name) && !name.includes('__tests__'))
    .map((name) => read(`${dir}/${name}`))
    .join('\n')

const source = readAll('../src', /\.(ts|vue)$/)
const bundled = new Set(importsOf(readAll('../dist', /\.js$/)))

// tailwindcss is a build-time peer with no runtime import, so the rule is
// narrowed to peers the source actually pulls in.
const inlined = Object.keys(peerDependencies)
  .filter((peer) => new RegExp(`from\\s*['"]${escapeRe(peer)}(/|['"])`).test(source))
  .filter((peer) => ![...bundled].some((name) => name === peer || name.startsWith(`${peer}/`)))

if (inlined.length > 0) {
  console.error(
    `\nThe bundle inlines ${inlined.join(', ')} instead of importing it.\n` +
      `Every peer dependency must be external -- check rollupOptions.external in vite.config.ts.\n`,
  )
  process.exit(1)
}

console.log(`verify-bundle: ${[...bundled].sort().join(', ')} stay external`)
