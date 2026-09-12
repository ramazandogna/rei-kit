import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import * as kit from '../index'
import * as app from '../app/index'
import * as web from '../web/index'

/**
 * The showcase's catalogue has to match the package.
 *
 * A component that ships undocumented is a component nobody finds; a table for
 * a component that no longer exists is worse, because a reader trusts it. The
 * file is generated, so this asserts the generator was run and that it saw
 * everything — which is what stops the page drifting one release at a time.
 */

type Entry = { name: string; summary: string; props: { name: string }[] }

// Regenerated here rather than read from disk alone, so a stale file fails the
// test instead of passing it.
execFileSync('node', ['scripts/extract-props.mjs'], { cwd: process.cwd() })
const catalogue = JSON.parse(readFileSync('showcase/props.generated.json', 'utf8')) as Entry[]

/** Every export that is a component — an object with a render or a setup. */
function components(module: Record<string, unknown>): string[] {
  return Object.entries(module)
    .filter(([name, value]) => {
      if (!/^[A-Z]/.test(name)) return false
      if (typeof value !== 'object' || value === null) return false

      return 'render' in value || 'setup' in value || '__name' in value
    })
    .map(([name]) => name)
}

describe('the showcase catalogue', () => {
  it('covers every component the package exports', () => {
    const exported = [...components(kit), ...components(app), ...components(web)].sort()
    const documented = catalogue.map((entry) => entry.name)
    const missing = exported.filter((name) => !documented.includes(name))

    expect(missing).toEqual([])
  })

  it('documents no component that does not exist', () => {
    // A table for something that shipped and was removed is worse than no
    // table: a reader has no way to tell it is stale.
    const exported = [
      ...components(kit),
      ...components(app),
      ...components(web),
      // The PWA entry reaches for a service worker, so it is not imported here.
      'InstallPrompt',
      'UpdatePrompt',
      'InstallSettings',
    ]

    const extra = catalogue.map((e) => e.name).filter((name) => !exported.includes(name))

    expect(extra).toEqual([])
  })

  it('gives every component a sentence saying what it is for', () => {
    // The name alone tells a reader what exists, not which one to reach for.
    const silent = catalogue.filter((entry) => !entry.summary).map((entry) => entry.name)

    expect(silent).toEqual([])
  })

  it('has a behaviour test that mounts every component', () => {
    /* The 1.0.0 line. Twelve components reached 0.20.0 with none -- all of them
       the oldest parts of the kit, written before there was a habit of testing
       them, and none of them failing loudly enough for anybody to notice.

       Mounting is the bar rather than coverage percentage: a component that has
       never been mounted in a test is a component whose props have never been
       passed, and that is where the silent breakages live. */
    const dir = 'src/__tests__'
    const suites = readdirSync(dir)
      .filter((file) => !['public-api.spec.ts', 'showcase-catalogue.spec.ts'].includes(file))
      .map((file) => readFileSync(`${dir}/${file}`, 'utf8'))
      .join('\n')

    const unmounted = catalogue
      .map((entry) => entry.name)
      .filter((name) => !new RegExp(`mount\\(\\s*${name}[,)\\s]`).test(suites))

    expect(unmounted).toEqual([])
  })

  it('names the entry point each component is imported from', () => {
    const ENTRIES = ['rei-kit', 'rei-kit/app', 'rei-kit/web', 'rei-kit/pwa']
    const wrong = catalogue.filter(
      (entry) => !ENTRIES.includes((entry as Entry & { entry: string }).entry),
    )

    expect(wrong).toEqual([])
  })
})
