/**
 * Colour for the code on this page, in about a hundred lines and with no
 * dependency.
 *
 * A highlighter is normally a megabyte of grammar, and the samples here are
 * six languages' worth of the same handful of shapes: a comment, a string, a
 * tag, an attribute, a keyword, a number. Tokenising those is enough to tell
 * markup from code from text, which is the whole job — and it means the
 * colours can come from the palette's own roles, so the code changes colour
 * with everything else on the page.
 *
 * Every piece of the input is escaped before it is wrapped, and the wrapping
 * is the only HTML this produces, so the result is safe to render.
 */
export type CodeLang = 'vue' | 'html' | 'ts' | 'js' | 'css' | 'sh'

type Kind = 'comment' | 'string' | 'tag' | 'attr' | 'keyword' | 'number' | 'punct' | 'text'

interface Rule {
  kind: Kind
  pattern: RegExp
}

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* Anchored, like every other rule here. Unanchored, it matched a keyword
   further along the text and the scanner then cut that many characters off
   the front — which turned the samples into soup. */
const KEYWORDS =
  /^(?:import|from|export|default|const|let|var|function|return|await|async|new|typeof|as|if|else|for|of|in|interface|type|class|extends|true|false|null|undefined|this|void)\b/

/* Order matters: a comment wins over a string, and a string over everything
   inside it. Each rule is anchored, and the scanner walks the text once. */
const MARKUP: Rule[] = [
  { kind: 'comment', pattern: /^<!--[\s\S]*?-->/ },
  { kind: 'comment', pattern: /^\/\*[\s\S]*?\*\// },
  { kind: 'comment', pattern: /^\/\/[^\n]*/ },
  { kind: 'string', pattern: /^"[^"\n]*"|^'[^'\n]*'|^`[^`]*`/ },
  // A tag's name, opening or closing, with the bracket.
  { kind: 'tag', pattern: /^<\/?[A-Za-z][\w.:-]*/ },
  { kind: 'tag', pattern: /^\/?>/ },
  // An attribute is a name followed by `=`, including Vue's `:`, `@` and `v-`.
  { kind: 'attr', pattern: /^[@:#]?[A-Za-z][\w.:-]*(?==)/ },
  { kind: 'attr', pattern: /^v-[\w.:-]+/ },
  { kind: 'keyword', pattern: KEYWORDS },
  { kind: 'number', pattern: /^\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms)?\b/ },
  { kind: 'punct', pattern: /^[{}()[\];,.]/ },
]

const CSS_RULES: Rule[] = [
  { kind: 'comment', pattern: /^\/\*[\s\S]*?\*\// },
  { kind: 'string', pattern: /^"[^"\n]*"|^'[^'\n]*'/ },
  { kind: 'keyword', pattern: /^@[\w-]+/ },
  // A property, including a custom one, up to its colon.
  { kind: 'attr', pattern: /^--?[\w-]+(?=\s*:)/ },
  { kind: 'attr', pattern: /^[a-z-]+(?=\s*:)/ },
  { kind: 'tag', pattern: /^[.#][\w-]+/ },
  { kind: 'number', pattern: /^\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|ch|vh|vw)?\b/ },
  { kind: 'punct', pattern: /^[{}();,]/ },
]

const SHELL_RULES: Rule[] = [
  { kind: 'comment', pattern: /^#[^\n]*/ },
  { kind: 'string', pattern: /^"[^"\n]*"|^'[^'\n]*'/ },
  { kind: 'keyword', pattern: /^\b(?:pnpm|npm|yarn|bun|npx)\b/ },
  { kind: 'attr', pattern: /^--?[\w-]+/ },
]

function rulesFor(lang: CodeLang): Rule[] {
  if (lang === 'css') return CSS_RULES
  if (lang === 'sh') return SHELL_RULES

  return MARKUP
}

/** The code as HTML: every token wrapped, everything else escaped. */
export function highlight(code: string, lang: CodeLang = 'vue'): string {
  const rules = rulesFor(lang)
  let rest = code
  let plain = ''
  let out = ''

  const flush = () => {
    if (plain) out += escape(plain)
    plain = ''
  }

  while (rest.length > 0) {
    /* Only a match at the very start counts: a rule that fires further along
       would take the text in front of it with it. */
    let hit: Rule | undefined
    let match: string | undefined

    for (const rule of rules) {
      const found = rule.pattern.exec(rest)
      if (found && found.index === 0) {
        hit = rule
        match = found[0]
        break
      }
    }

    if (!hit || !match) {
      // Nothing matched here: keep the character and move on, so unknown
      // syntax stays readable instead of disappearing.
      plain += rest[0]
      rest = rest.slice(1)
      continue
    }

    flush()
    out += `<span class="tok-${hit.kind}">${escape(match)}</span>`
    rest = rest.slice(match.length)
  }

  flush()

  return out
}
