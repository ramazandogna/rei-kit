import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { compileScript, parse } from 'vue/compiler-sfc'
import { describe, expect, it } from 'vitest'

/**
 * The usage examples a reader copies.
 *
 * An example is a promise that pasting it works. The examples are real
 * components, so the showcase type-check already fails on a wrong value or a
 * missing import. That check lets two things through, and this file catches
 * them: a prop the component does not have, which Vue passes on as an
 * attribute without complaint, and a JavaScript version that still has a
 * type in it.
 */

type Prop = { name: string; required: boolean }
type Entry = { name: string; entry: string; props: Prop[] }
type Example = { name: string; ts: string; js: string }

execFileSync('node', ['scripts/extract-props.mjs'], { cwd: process.cwd() })
execFileSync('node', ['scripts/extract-examples.mjs'], { cwd: process.cwd() })

const catalogue = JSON.parse(readFileSync('showcase/props.generated.json', 'utf8')) as Entry[]
const examples = JSON.parse(readFileSync('showcase/examples.generated.json', 'utf8')) as Example[]
const byName = new Map(catalogue.map((entry) => [entry.name, entry]))

/** Where each component's source is, to read what the catalogue does not hold. */
const sources = new Map(
  ['components', 'web', 'app', 'pwa', 'motion'].flatMap((dir) =>
    readdirSync(`src/${dir}`)
      .filter((file) => file.endsWith('.vue'))
      .map((file) => [file.replace('.vue', ''), readFileSync(`src/${dir}/${file}`, 'utf8')]),
  ),
)

/** `v-model` targets: `modelValue` for the unnamed one. */
function models(source: string) {
  return [...source.matchAll(/defineModel<[^(]*\(\s*(?:'([\w-]+)')?[^)]*\)/g)].map(
    ([call, name]) => ({
      name: name ?? 'modelValue',
      required: /required:\s*true/.test(call),
    }),
  )
}

function emits(source: string) {
  const block = /defineEmits<\{([\s\S]*?)\}>/.exec(source)?.[1] ?? ''

  return [...block.matchAll(/'?([\w:-]+)'?\s*:/g)].map(([, name]) => name!)
}

const camel = (name: string) => name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

/** Attributes any component takes through fallthrough, and every element takes. */
const FALLTHROUGH = /^(class|style|key|id|ref|role|title|lang|tabindex|aria-.+|data-.+)$/

/*
 * Attributes a component may take because it said so.
 *
 * `BaseInput`, `BaseButton` and `PasswordInput` intersect their props with a
 * native element's and pass them through `$attrs`, which is the whole reason
 * an app can put `autocomplete` on a password field without the kit
 * declaring a prop for every attribute an input has. Those pass-throughs are
 * written `/* @vue-ignore *\/`, so the type checker is looking away — this
 * list is the only thing between the examples and a plausible-looking
 * attribute that does nothing, so it is spelled out rather than opened up,
 * and it applies only to the components that opted in.
 */
const NATIVE_ATTRS =
  /^(autocomplete|placeholder|inputmode|required|disabled|readonly|name|maxlength|minlength|pattern|autofocus|form)$/
const NATIVE_EVENTS = new Set(['click'])

type Node = {
  type: number
  tag?: string
  props?: { type: number; name: string; arg?: { content?: string } }[]
  children?: Node[]
}

function elements(node: Node): Node[] {
  return [node, ...(node.children ?? []).flatMap(elements)]
}

describe('usage examples', () => {
  it('exist for every component', () => {
    const missing = catalogue
      .map((c) => c.name)
      .filter((name) => !examples.some((e) => e.name === name))

    expect(missing).toEqual([])
  })

  it('import each component from the entry it ships in', () => {
    // An example that imports from the wrong entry fails for the reader, not
    // here: the showcase resolves every entry to the same source tree.
    const wrong = examples
      .filter((example) => byName.has(example.name))
      .filter((example) => {
        const { entry } = byName.get(example.name)!
        const line = new RegExp(`import \\{[^}]*\\b${example.name}\\b[^}]*\\} from '${entry}'`)

        return !line.test(example.ts)
      })
      .map((example) => example.name)

    expect(wrong).toEqual([])
  })

  it('compile as plain JavaScript once the types are stripped', () => {
    const broken = examples.filter((example) => {
      const { descriptor, errors } = parse(example.js, { filename: `${example.name}.vue` })
      if (errors.length > 0 || descriptor.scriptSetup?.lang) return true
      try {
        compileScript(descriptor, { id: example.name })
        return false
      } catch {
        return true
      }
    })

    expect(broken.map((example) => example.name)).toEqual([])
  })

  it('pass only props, models and events the component has, and every required one', () => {
    const problems: string[] = []

    for (const example of examples) {
      const { descriptor } = parse(example.ts, { filename: `${example.name}.vue` })
      const root = descriptor.template!.ast as unknown as Node

      for (const element of elements(root)) {
        const component = element.tag && byName.get(element.tag)
        if (!component) continue

        const source = sources.get(component.name) ?? ''
        const known = new Set(component.props.map((p) => p.name))
        const takesNativeAttrs = /HTMLAttributes/.test(source)
        const modelNames = models(source)
        const eventNames = new Set([...emits(source), ...NATIVE_EVENTS])
        const given = new Set<string>()

        /* A declared prop first: some components take `title` or `id` as a
           prop, and only an undeclared one falls through to the element. */
        const check = (name: string, written: string) => {
          if (known.has(camel(name))) given.add(camel(name))
          else if (!FALLTHROUGH.test(name) && !(takesNativeAttrs && NATIVE_ATTRS.test(name))) {
            problems.push(`${example.name}: <${component.name} ${written}>`)
          }
        }

        for (const prop of element.props ?? []) {
          // 6 is a plain attribute, 7 a directive.
          if (prop.type === 6) {
            check(prop.name, prop.name)
            continue
          }

          const arg = prop.arg?.content
          if (prop.name === 'bind' && arg) check(arg, `:${arg}`)
          if (prop.name === 'on' && arg && !eventNames.has(arg)) {
            problems.push(`${example.name}: <${component.name} @${arg}>`)
          }
          if (prop.name === 'model') {
            const target = arg ?? 'modelValue'
            given.add(target)
            // A model is either defineModel or a declared prop with its
            // `update:` event, written by hand.
            if (!modelNames.some((m) => m.name === target) && !known.has(target)) {
              problems.push(`${example.name}: <${component.name} v-model:${target}>`)
            }
          }
        }

        const required = [
          ...component.props.filter((p) => p.required).map((p) => p.name),
          ...modelNames.filter((m) => m.required).map((m) => m.name),
        ]
        for (const name of required) {
          if (!given.has(name))
            problems.push(`${example.name}: <${component.name}> without ${name}`)
        }
      }
    }

    expect(problems).toEqual([])
  })
})
