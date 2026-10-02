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
function rewrite(comment, template) {
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
    ' */',
  ].join('\n')
}

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
    out.push(rewrite(comment, template), lines[i])
    written += 1
  }

  writeFileSync(path, out.join('\n'))
}

console.log(`extract-doc-examples: ${written} exports carry their sample`)
if (missing.length) console.log(`  no sample found for: ${missing.join(', ')}`)
