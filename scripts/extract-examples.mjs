/**
 * Reads every usage example and writes it out twice: as written, in
 * TypeScript, and as the same file in plain JavaScript.
 *
 * The examples are real components in `showcase/examples/`, type-checked with
 * the rest of the showcase, so a prop that is renamed breaks the example that
 * uses it before a reader copies it. The JavaScript version is derived rather
 * than written: Node's own type stripping removes the annotations, and the
 * layout is tidied where they were. Two hand-kept copies would drift; one
 * source and a transform cannot.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DIR = join(ROOT, 'showcase/examples')

/* Stripping is still marked experimental, and says so on every call. The
   output is checked by a test, which is the stability that matters here. */
const emitWarning = process.emitWarning
process.emitWarning = (warning, ...rest) =>
  String(warning).includes('stripTypeScriptTypes') ? undefined : emitWarning(warning, ...rest)

/** The script block without its types, laid out as if they had never been there. */
export function toJavaScript(source) {
  return source.replace(/<script setup lang="ts">\n([\s\S]*?)<\/script>/, (_, script) => {
    // A type-only import has no JavaScript at all, not even its line.
    const stripped = stripTypeScriptTypes(script.replace(/^import type .*\n/gm, ''))
      // Where an annotation was removed, the spaces it occupied remain.
      .replace(/(?<=\S) {2,}(?=[)(,;])/g, '')
      .replace(/(?<=\S) {2,}/g, ' ')
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\n+/, '')

    return `<script setup>\n${stripped}</script>`
  })
}

export function readExamples() {
  return readdirSync(DIR)
    .filter((file) => file.endsWith('.vue'))
    .sort()
    .map((file) => {
      const ts = readFileSync(join(DIR, file), 'utf8')

      return { name: file.replace(/\.vue$/, ''), ts, js: toJavaScript(ts) }
    })
}

/**
 * The guide's samples, which are screens rather than single components.
 *
 * `showcase/guide/` holds real components too, for the same reason: the page
 * used to carry its first-screen sample as a template string, which nothing
 * compiled and nothing checked against the kit's real props. Writing the
 * guide's screen as a component means the code shown beside it is the code
 * running above it, and a renamed prop breaks the build rather than a
 * reader's paste.
 */
export function readGuides() {
  const dir = join(ROOT, 'showcase/guide')

  return readdirSync(dir)
    .filter((file) => file.endsWith('.vue'))
    .sort()
    .map((file) => {
      const ts = readFileSync(join(dir, file), 'utf8')
        /* The component's own reasoning is for whoever maintains the guide,
           not for somebody copying a screen out of it. */
        .replace(/\n\/\*\*[\s\S]*?\*\/\n/, '\n')

      return { name: file.replace(/\.vue$/, ''), ts, js: toJavaScript(ts) }
    })
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const examples = readExamples()
  writeFileSync(join(ROOT, 'showcase/examples.generated.json'), JSON.stringify(examples, null, 2))

  const guides = readGuides()
  writeFileSync(join(ROOT, 'showcase/guide.generated.json'), JSON.stringify(guides, null, 2))

  console.log(
    `extract-examples: ${examples.length} examples and ${guides.length} guide screens, in TypeScript and JavaScript`,
  )
}
