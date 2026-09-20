import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import * as kit from '../index'
import * as app from '../app/index'
import * as web from '../web/index'
import * as motion from '../motion/index'

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
    const exported = [
      ...components(kit),
      ...components(app),
      ...components(web),
      ...components(motion),
    ].sort()
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
      ...components(motion),
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

  it('lists every component in AGENTS.md', () => {
    /* It said "twenty-two components" for thirty-one releases, and told
       assistants to add a DOM node the kit had learned to create itself.
       A file written for tools is read by tools, which do not notice it is
       stale -- they just write the wrong code with confidence. */
    const agents = readFileSync('AGENTS.md', 'utf8')
    const missing = catalogue
      .map((entry) => entry.name)
      .filter((name) => !agents.includes(`\`${name}\``))

    expect(missing).toEqual([])
  })

  it('states the component count the package actually has', () => {
    /* "53" was written in five places, and the kit grew past it. A number a
       reader sees on npm, in the README and in a link preview is a claim, so
       it is checked like one. */
    const stated = [
      ['README.md', readFileSync('README.md', 'utf8')],
      ['AGENTS.md', readFileSync('AGENTS.md', 'utf8')],
      ['package.json', readFileSync('package.json', 'utf8')],
      ['showcase/index.html', readFileSync('showcase/index.html', 'utf8')],
    ].flatMap(([file, text]) =>
      [...text!.matchAll(/\b(\d+) (?=accessible|components across)|Components +\| (\d+) \(/g)].map(
        ([, a, b]) => [file, Number(a ?? b)],
      ),
    )

    expect(stated.length).toBeGreaterThan(3)
    const wrong = stated.filter(([, n]) => n !== catalogue.length)
    expect(wrong).toEqual([])
  })

  it('names the entry point each component is imported from', () => {
    const ENTRIES = ['rei-kit', 'rei-kit/app', 'rei-kit/web', 'rei-kit/pwa', 'rei-kit/motion']
    const wrong = catalogue.filter(
      (entry) => !ENTRIES.includes((entry as Entry & { entry: string }).entry),
    )

    expect(wrong).toEqual([])
  })
})

/**
 * The page's part lists have to match the page.
 *
 * Each list is read twice — once to lay out the section, once to build the
 * menu and to point a component's name at its demo. That is what keeps the
 * three in step, and it only holds while the list is true: an id nobody
 * renders is a menu entry that scrolls nowhere, and a label that is not a
 * component name is a link to a demo that does not exist.
 *
 * Both failures are silent in a browser. A dead anchor simply does nothing.
 */
describe('the showcase part lists', () => {
  const lists = [
    { file: 'showcase/basics-parts.ts', section: 'showcase/BasicsSection.vue' },
    { file: 'showcase/form-parts.ts', section: 'showcase/FormSection.vue' },
    { file: 'showcase/motion-parts.ts', section: 'showcase/MotionSection.vue' },
  ]

  const named = new Set(catalogue.map((entry) => entry.name))

  for (const { file, section } of lists) {
    const source = readFileSync(file, 'utf8')
    const markup = readFileSync(section, 'utf8')
    const ids = [...source.matchAll(/^\s*id: '([^']+)'/gm)].map((match) => match[1]!)
    const labels = [...source.matchAll(/^\s*label: '([^']+)'/gm)].map((match) => match[1]!)

    it(`${file} declares parts the section actually renders`, () => {
      expect(ids.length).toBeGreaterThan(0)

      for (const id of ids) {
        // Either as a literal anchor or through the `part('id')` helper.
        expect(markup).toContain(`'${id}'`)
      }
    })

    it(`${file} names components the package ships`, () => {
      // A group heading or an effect is not a component; only the labels
      // that look like one have to resolve, and those are what the menu
      // turns into a link.
      for (const label of labels.filter((one) => /^[A-Z][A-Za-z]+$/.test(one))) {
        expect(named, `${label} in ${file}`).toContain(label)
      }
    })
  }
})

/**
 * Every menu entry has to point at something that exists.
 *
 * The side menu carries a hand-written list of section ids alongside the
 * generated part lists. A typo there, or a section renamed on one side only,
 * is a link that scrolls nowhere — and a dead anchor does nothing at all, so
 * nothing complains. This is the same guard the part lists get, extended to
 * the ids nobody generates.
 */
describe('the showcase menu', () => {
  const nav = readFileSync('showcase/SideNav.vue', 'utf8')

  /** The ids written out in `SECTIONS`, not the ones spread in from a list. */
  const ids = [...nav.matchAll(/\{ id: '([^']+)'/g)].map((match) => match[1]!)

  const markup = readdirSync('showcase')
    .filter((name) => name.endsWith('.vue'))
    .map((name) => readFileSync(`showcase/${name}`, 'utf8'))
    .join('\n')

  it('lists sections the page actually has', () => {
    expect(ids.length).toBeGreaterThan(20)

    const missing = ids.filter(
      (id) => !markup.includes(`id="${id}"`) && !markup.includes(`"${id}"`),
    )

    expect(missing, `no element carries: ${missing.join(', ')}`).toEqual([])
  })
})
