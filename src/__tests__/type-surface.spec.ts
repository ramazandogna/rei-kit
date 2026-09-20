import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * The other half of the public API guard.
 *
 * `public-api.spec.ts` names every runtime export of all six entries. It
 * cannot do the same for types — they are gone by the time a test runs — so
 * `showcase/type-surface.ts` re-exports every one of them and is type-checked
 * twice, by `type-check:showcase` and `type-check:strict`. Remove or rename
 * an exported type and those stop compiling.
 *
 * That leaves one hole, which is this file: a type *added* without being put
 * in the surface would be guarded by nothing, and nobody would notice until
 * it was quietly deleted a year later. So this reads the entry files and
 * asserts every `export type` reaches the list.
 *
 * Source text rather than the module, because that is all there is: an
 * `export type` leaves no trace to import.
 */
const ENTRIES = [
  'src/index.ts',
  'src/web/index.ts',
  'src/app/index.ts',
  'src/pwa/index.ts',
  'src/motion/index.ts',
  'src/supabase/index.ts',
]

const read = (path: string) => readFileSync(path, 'utf8')

/** The names in every `export type { … }` of a file. */
function exportedTypes(source: string): string[] {
  return (
    [...source.matchAll(/export type \{([^}]*)\}/g)]
      .flatMap((match) => match[1]!.split(','))
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      // `export type { X as Y }` publishes Y.
      .map((name) => name.split(/\s+as\s+/).pop()!)
  )
}

describe('the type surface', () => {
  const surface = read('showcase/type-surface.ts')
  const guarded = new Set(exportedTypes(surface))

  it('is not empty, which would make every case below pass', () => {
    expect(guarded.size).toBeGreaterThan(40)
  })

  for (const entry of ENTRIES) {
    const types = exportedTypes(read(entry))
    if (types.length === 0) continue

    it(`covers every type ${entry} exports`, () => {
      const missing = types.filter((name) => !guarded.has(name))

      expect(missing, `add these to showcase/type-surface.ts: ${missing.join(', ')}`).toEqual([])
    })
  }

  it('guards nothing the package no longer exports', () => {
    const published = new Set(ENTRIES.flatMap((entry) => exportedTypes(read(entry))))
    const stale = [...guarded].filter((name) => !published.has(name))

    // A name left here after its type was removed would keep compiling —
    // against the copy in the surface — and quietly stop guarding anything.
    expect(stale).toEqual([])
  })
})
