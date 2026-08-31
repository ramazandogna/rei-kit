import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * A peer dependency must be imported by the bundle, never inlined into it.
 *
 * A second copy of a library that communicates through provide/inject is not a
 * redundant copy -- it is a different injection key, so the consumer's provider
 * becomes invisible. vue-router shipped inlined in 0.2.0 exactly this way and
 * every RouterLink in the kit injected a router the app had never provided.
 *
 * Listing externals by hand is what allowed it, so the build now derives them
 * from peerDependencies and this test holds the build to that.
 */

const url = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const read = (path: string) => readFileSync(url(path), 'utf8')

const pkg = JSON.parse(read('../../package.json')) as {
  peerDependencies?: Record<string, string>
}
const peers = Object.keys(pkg.peerDependencies ?? {})

/** Bare module specifiers a bundle imports, ignoring relative chunks. */
const importsOf = (code: string) =>
  new Set([...code.matchAll(/from\s*['"]([^'".][^'"]*)['"]/g)].map(([, specifier]) => specifier!))

const bundles = readdirSync(url('../../dist'))
  .filter((name) => name.endsWith('.js'))
  .map((name) => read(`../../dist/${name}`))

const bundled = importsOf(bundles.join('\n'))

describe('peer dependencies stay external', () => {
  // Peers with no runtime import (tailwindcss is a build-time peer) are skipped:
  // the rule is that a peer the kit *uses* must appear as an import.
  const sources = readdirSync(url('..'), { recursive: true, encoding: 'utf8' })
    .filter((name) => /\.(ts|vue)$/.test(name) && !name.includes('__tests__'))
    .map((name) => read(`../${name}`))
    .join('\n')

  const used = peers.filter((peer) =>
    new RegExp(`from\\s*['"]${peer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|['"])`).test(sources),
  )

  it('uses at least the peers under test', () => {
    expect(used).toContain('vue-router')
    expect(used).toContain('vue')
  })

  it.each(used)('imports %s instead of inlining it', (peer) => {
    const importsIt = [...bundled].some((name) => name === peer || name.startsWith(`${peer}/`))
    expect(importsIt, `dist inlines ${peer} rather than importing it`).toBe(true)
  })
})
