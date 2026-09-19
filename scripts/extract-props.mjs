/**
 * Reads every component's `defineProps` out of the source and writes a table.
 *
 * Generated rather than hand-written, and that is the whole point: a prop table
 * maintained by hand is a prop table that is wrong by the second release. This
 * runs before the showcase builds, so the page a reader sees is produced from
 * the same text the compiler reads.
 *
 * It parses rather than type-checks, which is a deliberate limit. Anything
 * clever — a mapped type, an imported alias — comes out as written rather than
 * resolved, and that is still the truth about what the prop accepts.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname

function vueFiles(dir) {
  const out = []
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...vueFiles(join(dir, entry.name)))
    else if (entry.name.endsWith('.vue')) out.push(join(dir, entry.name))
  }
  return out
}

/** The block between `defineProps<{` and its matching `}>()`. */
function propsBlock(source) {
  const start = source.indexOf('defineProps<{')
  if (start === -1) return null

  let depth = 0
  for (let i = start + 'defineProps<'.length; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) return source.slice(source.indexOf('{', start) + 1, i)
    }
  }
  return null
}

/** Defaults come from the destructuring, which is where Vue puts them. */
function defaults(source) {
  const match = source.match(/const\s*\{([^}]*)\}\s*=\s*defineProps</s)
  if (!match) return {}

  const out = {}
  for (const part of match[1].split(',')) {
    const [name, value] = part.split('=').map((s) => s.trim())
    if (name && value) out[name] = value
  }
  return out
}

/**
 * Splits a props block into entries, keeping the comment above each one.
 *
 * Brace and paren depth are tracked so a prop whose type is an object or a
 * function signature is not cut in half at its first comma.
 */
function entries(block) {
  const lines = block.split('\n').map((l) => l.trim())
  const out = []
  let comment = []
  let buffer = ''
  let depth = 0

  /** The next line that is not blank, for deciding whether a type continues. */
  const peek = (from) => {
    for (let j = from; j < lines.length; j++) if (lines[j] !== '') return lines[j]
    return ''
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === '') continue

    if (buffer === '' && (line.startsWith('/*') || line.startsWith('*') || line.startsWith('//'))) {
      const text = line.replace(/^\/\*\*?|^\*\/?|^\/\//, '').replace(/\*\/$/, '').trim()
      if (text) comment.push(text)
      continue
    }

    buffer += (buffer ? ' ' : '') + line
    for (const ch of line) {
      if (ch === '{' || ch === '(' || ch === '<') depth++
      else if (ch === '}' || ch === ')' || ch === '>') depth--
    }

    if (depth > 0) continue

    /* A union written one member per line starts on the line *after* the name,
       so "variant?:" alone is not a finished prop, and neither is any line
       followed by one beginning with "|". Missing this dropped BaseButton's
       `variant` -- its most important prop -- from the published docs. */
    if (/:\s*$/.test(buffer) || peek(i + 1).startsWith('|')) continue

    const match = buffer.match(/^(\w+)(\?)?:\s*(.+?)$/)
    if (match) {
      out.push({
        name: match[1],
        required: !match[2],
        type: match[3]
          .replace(/^\|\s*/, '')
          .replace(/\s*\|\s*undefined\s*$/, '')
          .replace(/\s+/g, ' ')
          .trim(),
        description: comment.join(' '),
      })
    }
    comment = []
    buffer = ''
  }

  return out
}

/** The component's own doc comment — the paragraph above `defineProps`. */
function summary(source) {
  const blocks = [...source.matchAll(/\/\*\*([\s\S]*?)\*\//g)]
  for (const block of blocks) {
    const after = source.slice(block.index + block[0].length, block.index + block[0].length + 200)
    if (!/^\s*(const|define)/.test(after)) continue

    const text = block[1]
      .split('\n')
      .map((l) => l.replace(/^\s*\*\s?/, '').trim())
      .join('\n')
      .trim()

    // The first paragraph only: the rest is the argument, and a table is not
    // the place for it.
    return text.split('\n\n')[0].replace(/\s+/g, ' ').trim()
  }
  return ''
}

const components = []
for (const file of ['src/components', 'src/app', 'src/web', 'src/pwa', 'src/motion'].flatMap(vueFiles)) {
  const source = readFileSync(join(ROOT, file), 'utf8')
  const block = propsBlock(source)
  const name = file.split('/').pop().replace('.vue', '')
  const entry = relative('src', file).split('/')[0]

  components.push({
    name,
    entry: entry === 'components' ? 'rei-kit' : `rei-kit/${entry}`,
    summary: summary(source),
    props: block ? entries(block).map((p) => ({ ...p, default: defaults(source)[p.name] ?? '' })) : [],
  })
}

components.sort((a, b) => a.name.localeCompare(b.name))
writeFileSync(join(ROOT, 'showcase/props.generated.json'), JSON.stringify(components, null, 2))
console.log(`extract-props: ${components.length} components, ${components.reduce((n, c) => n + c.props.length, 0)} props`)
