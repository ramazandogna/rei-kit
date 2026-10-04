import { execFileSync } from 'node:child_process'
import { existsSync, globSync, readFileSync, readdirSync } from 'node:fs'
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

/* `AGENTS.md` is kept out of the published repository, so a clone has the
   package without it and these checks have nothing to read. They still run
   where the file is -- the working copy it is maintained in, which is the
   only place it can go stale. */
const agents = existsSync('AGENTS.md') ? readFileSync('AGENTS.md', 'utf8') : null

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

  it.skipIf(!agents)('lists every component in AGENTS.md', () => {
    /* It said "twenty-two components" for thirty-one releases, and told
       assistants to add a DOM node the kit had learned to create itself.
       A file written for tools is read by tools, which do not notice it is
       stale -- they just write the wrong code with confidence. */
    const missing = catalogue
      .map((entry) => entry.name)
      .filter((name) => !agents!.includes(`\`${name}\``))

    expect(missing).toEqual([])
  })

  it('states the component count the package actually has', () => {
    /* "53" was written in five places, and the kit grew past it. A number a
       reader sees on npm, in the README and in a link preview is a claim, so
       it is checked like one. */
    const stated = [
      ['README.md', readFileSync('README.md', 'utf8')],
      ['package.json', readFileSync('package.json', 'utf8')],
      ['showcase/index.html', readFileSync('showcase/index.html', 'utf8')],
      ...(agents ? [['AGENTS.md', agents]] : []),
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
  const nav = readFileSync('showcase/sections.ts', 'utf8')

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

/**
 * The comparison table on the page is a file, not a paragraph.
 *
 * It is the one claim on the site about something other than this kit, so
 * it is the one most worth being unable to fake. `bench/run.mjs` writes
 * `results.json` and `EvidenceSection.vue` reads it, which means the page
 * cannot say a number the benchmark did not produce — and a table typed in
 * by hand is a table that is wrong by the next release. This one silently
 * went from 18.4 KB to 26.1 KB while nobody edited it.
 */
describe('the benchmark the evidence section reads', () => {
  const results = JSON.parse(readFileSync('bench/results.json', 'utf8')) as {
    measured: string
    suites: { id: string; label: string; rows: { name: string; js: number; css: number }[] }[]
  }

  it('holds both cases, and every kit in each', () => {
    /* Two suites on purpose. One case is how a size comparison lies in
       either direction: three components is the case least favourable to a
       flat stylesheet, and ten is where the two shapes separate. */
    expect(results.suites.map((suite) => suite.id).sort()).toEqual(['ten', 'three'])

    for (const suite of results.suites) {
      const dir = suite.id === 'three' ? 'bench/cases' : 'bench/cases-ten'
      const kits = readdirSync(dir)
        .filter((file) => file.endsWith('.js'))
        .map((file) => file.replace('.js', ''))

      expect(kits.length).toBeGreaterThanOrEqual(6)
      for (const kit of kits) {
        expect(suite.rows.some((row) => row.name.startsWith(kit))).toBe(true)
      }
    }
  })

  it('is the same table the README prints', () => {
    /* The showcase reads `results.json`, so the page cannot say a number the
       benchmark did not produce. The README is markdown and reads nothing —
       its two tables were typed in, and nothing compared them to anything.
       That is the failure this benchmark exists to prevent, one level up:
       the numbers most people see are the ones in the README. */
    const readme = readFileSync('README.md', 'utf8')

    for (const suite of results.suites) {
      for (const row of suite.rows) {
        /* Bytes in the file, kibibytes on both pages — the same conversion
           `bench/run.mjs` and `EvidenceSection.vue` do. */
        const total = `${((row.js + row.css) / 1024).toFixed(1)} KB`
        const printed = readme.includes(row.name) && readme.includes(total)

        expect(printed, `${row.name} at ${total} is not in README.md`).toBe(true)
      }
    }
  })

  /* Two numbers in README.md that a reader can check in one command, and
     that had both gone stale: it claimed 1301 tests across 57 files while
     the suite had grown to 1884 across 72. A wrong number a skeptic can
     verify costs more than no number, because it is the evidence section
     that the rest of the page's claims lean on. The version used to be in
     the Status heading too; it is gone rather than guarded, since npm
     prints the real one beside the README anyway. */
  it('counts the test files README.md says it has', () => {
    const files = globSync('{src,showcase,browser}/**/*.spec.ts').length
    const readme = readFileSync('README.md', 'utf8')
    const claimed = /([\d,]+) tests across (\d+) files/.exec(readme)

    expect(claimed, 'README.md no longer states a test count').not.toBeNull()
    expect(Number(claimed![2])).toBe(files)
  })

  it('does not print a version number it has to be reminded to update', () => {
    const readme = readFileSync('README.md', 'utf8')
    const status = readme.slice(readme.indexOf('## Status'), readme.indexOf('## Status') + 400)

    expect(status).not.toMatch(/v\d+\.\d+\.\d+/)
  })

  it('measured the version of this kit that is being published', () => {
    /* A stale row is the failure mode that matters: the page would show a
       number for a build nobody ships. */
    const version = JSON.parse(readFileSync('package.json', 'utf8')).version as string
    for (const suite of results.suites) {
      expect(suite.rows.some((row) => row.name === `rei-kit ${version}`)).toBe(true)
    }
  })
})

/**
 * Every component says what it is where the editor can read it.
 *
 * The reasoning for each part of this kit is in three places a consumer
 * never opens: the component's own source, `AGENTS.md`, and the showcase.
 * The place they *are* looking is the autocomplete list in their editor,
 * and eighty-five of the hundred and five said nothing there — because a
 * doc comment inside `<script setup>` does not survive into the `.d.ts`.
 * Only a comment above the export does.
 *
 * So the summary the catalogue already holds is carried to the export as
 * well, and this keeps them in step. Hovering `BaseTable` should not be
 * the one way of learning about it that fails.
 */
describe('the editor sees what the catalogue knows', () => {
  const ENTRIES = [
    'src/index.ts',
    'src/web/index.ts',
    'src/app/index.ts',
    'src/pwa/index.ts',
    'src/motion/index.ts',
  ]

  /**
   * The sample in the editor is the sample that is type-checked.
   *
   * `showcase/examples/<Name>.vue` is a real file, compiled with the
   * showcase and checked against the component's real props, so an
   * `@example` copied from it is documentation proven to compile. Copied is
   * the operative word: the copy goes stale the moment the sample changes,
   * and a sample that no longer compiles is worse than none because the
   * claim above it is still being made.
   *
   * `scripts/extract-doc-examples.mjs` writes them. This compares rather
   * than regenerating, because the entry files are source rather than a
   * generated artefact and a test should not rewrite them.
   */
  it.each(ENTRIES)('%s carries each sample as it is written', (entry) => {
    const source = readFileSync(entry, 'utf8')
    const stale: string[] = []

    for (const [, name] of source.matchAll(/^export \{ default as (\w+) \}/gm)) {
      const sample = readFileSync(`showcase/examples/${name}.vue`, 'utf8')
      const template = /<template>\n([\s\S]*?)\n<\/template>/.exec(sample)
      if (!template) continue

      const lines = template[1]!.split('\n')
      const strip = Math.min(
        ...lines.filter((line) => line.trim()).map((line) => /^ */.exec(line)![0]!.length),
      )
      const expected = lines
        .map((line) => line.slice(strip))
        .join('\n')
        .trimEnd()

      /* Compared on the text itself rather than on the JSDoc framing, so a
         change in how the comment is laid out does not read as drift. */
      const inComment = source
        .slice(0, source.indexOf(`export { default as ${name} }`))
        .split('/**')
        .pop()!
        .split('\n')
        .map((line) => line.replace(/^\s*\*\s?/, ''))
        .join('\n')

      if (!inComment.includes(expected)) stale.push(name)
    }

    expect(stale).toEqual([])
  })

  /**
   * Every near-neighbour `AGENTS.md` argues about is cross-linked.
   *
   * "Which one to reach for" is the most useful prose here and it is nowhere
   * a consumer looks; the failure it describes — "picking the wrong one
   * compiles and looks almost right" — starts with not knowing the other
   * exists. So the pairing is carried to the export as a `@see` while the
   * argument stays in one place.
   *
   * Skipped in a clone, where `AGENTS.md` is not present and there is
   * nothing to compare the committed lines against.
   */
  it.skipIf(!agents).each(ENTRIES)('%s cross-links the parts it is confused with', (entry) => {
    const section = agents!.slice(
      agents!.indexOf('## Which one to reach for'),
      agents!.indexOf('## Tokens'),
    )
    const known = new Set(catalogue.map((item) => item.name))

    const expected = new Map<string, Set<string>>()
    for (const [, head] of section.matchAll(/\n- \*\*(.+?)\*\*/gs)) {
      const named = [
        ...new Set([...head!.matchAll(/`(\w+)[^`]*`/g)].map(([, name]) => name!)),
      ].filter((name) => known.has(name))
      if (named.length < 2) continue

      for (const name of named) {
        const set = expected.get(name) ?? new Set<string>()
        for (const other of named) if (other !== name) set.add(other)
        expected.set(name, set)
      }
    }

    const source = readFileSync(entry, 'utf8')
    const wrong: string[] = []

    for (const [, name] of source.matchAll(/^export \{ default as (\w+) \}/gm)) {
      const want = expected.get(name!)
      if (!want) continue

      const comment = source
        .slice(0, source.indexOf(`export { default as ${name} }`))
        .split('/**')
        .pop()!

      for (const other of want) {
        if (!comment.includes(`{@link ${other}}`)) wrong.push(`${name} → ${other}`)
      }
    }

    expect(wrong).toEqual([])
  })

  it.each(ENTRIES)('%s documents every component it exports', (entry) => {
    const lines = readFileSync(entry, 'utf8').split('\n')
    const silent: string[] = []

    lines.forEach((line, index) => {
      const match = /^export \{ default as (\w+) \}/.exec(line)
      if (!match) return

      const above = (lines[index - 1] ?? '').trim()
      if (!above.endsWith('*/')) silent.push(match[1]!)
    })

    expect(silent).toEqual([])
  })
})
