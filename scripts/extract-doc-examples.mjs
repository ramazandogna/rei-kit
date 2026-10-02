import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * Carries each component's usage sample into the doc comment above its
 * export, where an editor can read it.
 *
 * `showcase/examples/<Name>.vue` already exists for all 105, is type-checked
 * with the showcase, and is validated against the component's real props by
 * `examples.spec.ts`. So an `@example` generated from it is documentation
 * proven to compile — which is the whole point, and the reason nothing here
 * truncates: a shortened sample is a sample that does not compile, and a
 * promise this would then be breaking.
 *
 * The summary above each export stays as it is; this only replaces the
 * `@example` section under it. `showcase-catalogue.spec.ts` runs this and
 * fails if the committed entry files differ, the same way it does for the
 * prop catalogue.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The near-neighbours of each component, derived from the one place the
 * distinctions are argued.
 *
 * `AGENTS.md`'s "which one to reach for" is the most useful prose in this
 * project and it is nowhere a consumer looks. The prose itself is too long
 * for a tooltip — 68 words to the bullet — and copying a shortened version
 * into every export would put the same editorial claim in two places that
 * can then disagree. What a reader is actually missing is smaller: that the
 * neighbour exists at all. `AGENTS.md` says as much — "picking the wrong one
 * compiles and looks almost right" — so this carries the pairing and leaves
 * the argument where it is.
 *
 * Returns null when `AGENTS.md` is not in the working copy, which is the
 * case in a fresh clone; the generated `@see` lines are committed, so they
 * survive the file they came from being absent.
 */
function neighbours() {
  let agents
  try {
    agents = readFileSync(join(ROOT, 'AGENTS.md'), 'utf8')
  } catch {
    return null
  }

  const section = agents.slice(
    agents.indexOf('## Which one to reach for'),
    agents.indexOf('## Tokens'),
  )
  const known = new Set(
    JSON.parse(readFileSync(join(ROOT, 'showcase/props.generated.json'), 'utf8')).map((c) => c.name),
  )

  const map = new Map()
  for (const [, head] of section.matchAll(/\n- \*\*(.+?)\*\*/gs)) {
    /* The first word inside each backtick span, so a heading written as
       `BaseCombobox mode="multiple"` still names its component. */
    const named = [...new Set([...head.matchAll(/`(\w+)[^`]*`/g)].map(([, name]) => name))].filter(
      (name) => known.has(name),
    )
    if (named.length < 2) continue

    for (const name of named) {
      const rest = named.filter((other) => other !== name)
      map.set(name, [...new Set([...(map.get(name) ?? []), ...rest])].sort())
    }
  }

  return map
}

const ENTRIES = [
  'src/index.ts',
  'src/web/index.ts',
  'src/app/index.ts',
  'src/pwa/index.ts',
  'src/motion/index.ts',
]

/** The sample's template, dedented, with its surrounding tags dropped. */
function templateOf(name) {
  let source
  try {
    source = readFileSync(join(ROOT, `showcase/examples/${name}.vue`), 'utf8')
  } catch {
    return null
  }

  const match = /<template>\n([\s\S]*?)\n<\/template>/.exec(source)
  if (!match) return null

  const lines = match[1].split('\n')
  const indents = lines.filter((line) => line.trim()).map((line) => /^ */.exec(line)[0].length)
  const strip = Math.min(...indents)

  return lines.map((line) => line.slice(strip)).join('\n').trimEnd()
}

/** The comment as it should read: the summary it already has, plus the sample. */
function rewrite(comment, template, near) {
  const body = comment
    .replace(/^\/\*\*/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*ures?\s?/, '').replace(/^\s*\*\s?/, ''))
    .join('\n')

  /* Everything before the first tag is the prose; an `@example` already
     there is this script's own previous output. */
  const prose = body.split(/\n\s*@/)[0].trim()

  const sample = template
    .split('\n')
    .map((line) => (line ? ` * ${line}` : ' *'))
    .join('\n')

  return [
    '/**',
    ...prose.split('\n').map((line) => (line ? ` * ${line}` : ' *')),
    ' *',
    ' * @example',
    ' * ```vue',
    sample,
    ' * ```',
    ...(near?.length
      ? [
          ' *',
          ` * @see ${near.map((name) => `{@link ${name}}`).join(', ')} — ${
            near.length === 1 ? 'the near-neighbour' : 'the near-neighbours'
          } this is mistaken for`,
        ]
      : []),
    ' */',
  ].join('\n')
}

const near = neighbours()
let written = 0
let missing = []

for (const entry of ENTRIES) {
  const path = join(ROOT, entry)
  const lines = readFileSync(path, 'utf8').split('\n')
  const out = []

  for (let i = 0; i < lines.length; i += 1) {
    const match = /^export \{ default as (\w+) \}/.exec(lines[i])

    if (!match) {
      out.push(lines[i])
      continue
    }

    const name = match[1]
    const template = templateOf(name)

    if (!template) {
      missing.push(name)
      out.push(lines[i])
      continue
    }

    /* Walk back over the comment block that belongs to this export, so the
       rewrite replaces it rather than stacking on top of it. */
    let start = out.length
    if (out[start - 1]?.trim().endsWith('*/')) {
      while (start > 0 && !out[start - 1].trim().startsWith('/**')) start -= 1
      start -= 1
    }

    const comment = out.slice(start, out.length).join('\n')
    out.length = start
    out.push(rewrite(comment, template, near?.get(name)), lines[i])
    written += 1
  }

  writeFileSync(path, out.join('\n'))
}

console.log(`extract-doc-examples: ${written} exports carry their sample`)
if (!near) console.log('  AGENTS.md is absent, so no @see lines were written')
if (missing.length) console.log(`  no sample found for: ${missing.join(', ')}`)
