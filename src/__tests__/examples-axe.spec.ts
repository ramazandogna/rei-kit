import { mount } from '@vue/test-utils'
import axe from 'axe-core'
import { readdirSync } from 'node:fs'
import { defineComponent, h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'

/**
 * Every usage example, run through axe.
 *
 * The kit already has rules that read the source — a `focus-ring` on every
 * hand-drawn control, no colour of a component's own — but reading source
 * cannot tell you what the rendered tree says. A `role="listbox"` whose
 * children lost their `role="option"` still has the class on it, and an
 * `aria-labelledby` pointing at an id that no longer exists is a perfectly
 * ordinary string. Those are what this catches.
 *
 * The examples are the right input: they are the code a reader copies, they
 * are type-checked, and there is one per component, so nothing is audited in
 * a shape no one actually uses.
 *
 * ## What this does not cover
 *
 * jsdom has no layout, so this is not a claim that the kit is accessible —
 * it is a claim about structure only. Two things are deliberately out of
 * reach and still need a real browser:
 *
 * - **Contrast**, which needs computed colour, so the rule is off rather
 *   than quietly passing. The palettes are checked by hand instead.
 * - **Focus order and visibility**, which need layout.
 *
 * `region` is off because an example is a fragment, not a page, so its
 * content is landmark-less by construction.
 */
const EXAMPLES = `${process.cwd()}/showcase/examples`

const NAMES = readdirSync(EXAMPLES)
  .filter((file) => file.endsWith('.vue'))
  .map((file) => file.replace('.vue', ''))
  .sort()

const Blank = defineComponent({ render: () => h('div') })

/*
 * A real router rather than a stubbed `RouterLink`: `TabShell` renders a
 * `RouterView`, which a stub cannot stand in for, and a link's `href` is
 * part of what is being audited.
 */
const router = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:rest(.*)*', component: Blank }],
  })

describe('the examples, through axe', () => {
  it('has one example per component to audit', () => {
    expect(NAMES.length).toBeGreaterThan(90)
  })

  it.each(NAMES)('%s renders nothing axe objects to', async (name) => {
    const mod = (await import(`../../showcase/examples/${name}.vue`)) as {
      default: Parameters<typeof mount>[0]
    }

    const host = document.createElement('div')
    document.body.append(host)

    const wrapper = mount(mod.default, {
      attachTo: host,
      global: { plugins: [router()] },
    })

    const results = await axe.run(document.body, {
      resultTypes: ['violations'],
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    })

    const found = results.violations.map(
      (violation) => `${violation.id} (${violation.nodes.length}): ${violation.help}`,
    )

    wrapper.unmount()
    host.remove()

    expect(found).toEqual([])
  })
})

/**
 * The same audit, with each component opened.
 *
 * A closed tree says almost nothing about an open one: a menu, a dialog and
 * a combobox list are exactly where the ARIA lives, and they are absent
 * from the audit above. So every trigger is poked four ways — pressed,
 * focused, hovered, and sent an arrow — each on its own fresh mount,
 * because chaining them closes what the one before opened. That is not a
 * guess: chained, `BaseMenu` dropped out of the sweep, because the arrow
 * opened it and the press that followed shut it again.
 *
 * Thirteen components are known to add nodes this way — the menus, the
 * dialogs, the sheets, the pickers, the command menu, the toast. That
 * number is a floor rather than the coverage: `BaseCombobox` holds its
 * list with `v-show`, so the list is in the tree either way and is audited
 * in both states while adding nothing to count.
 */
describe('the examples, through axe, with things open', () => {
  const TRIGGERS = 'button, input, [role="combobox"], summary, [aria-expanded], [aria-haspopup]'

  it.each(NAMES)('%s opens onto nothing axe objects to', async (name) => {
    const mod = (await import(`../../showcase/examples/${name}.vue`)) as {
      default: Parameters<typeof mount>[0]
    }

    const found: string[] = []

    for (const act of ['click', 'focus', 'pointerenter', 'arrow'] as const) {
      for (let index = 0; index < 3; index += 1) {
        document.body.innerHTML = ''
        const host = document.createElement('div')
        document.body.append(host)

        const wrapper = mount(mod.default, {
          attachTo: host,
          global: { plugins: [router()] },
        })

        const triggers = wrapper.findAll(TRIGGERS)
        if (index >= triggers.length) {
          wrapper.unmount()
          break
        }

        if (act === 'arrow') await triggers[index]!.trigger('keydown', { key: 'ArrowDown' })
        else await triggers[index]!.trigger(act)

        await nextTick()
        await new Promise((resolve) => setTimeout(resolve, 0))

        const results = await axe.run(document.body, {
          resultTypes: ['violations'],
          rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
        })

        for (const violation of results.violations) {
          const line = `${act} on trigger ${index}: ${violation.id} — ${violation.help}`
          if (!found.includes(line)) found.push(line)
        }

        wrapper.unmount()
      }
    }

    document.body.innerHTML = ''
    expect(found).toEqual([])
  })
})
