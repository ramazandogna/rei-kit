import { mount } from '@vue/test-utils'
import axe from 'axe-core'
import { readdirSync } from 'node:fs'
import { defineComponent, h } from 'vue'
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
 * it is a claim about structure only. Three things are deliberately out of
 * reach and still need a real browser:
 *
 * - **Contrast**, which needs computed colour, so the rule is off rather
 *   than quietly passing. The palettes are checked by hand instead.
 * - **Focus order and visibility**, which need layout.
 * - **Anything behind an interaction** — an open menu, a combobox with its
 *   list down. Those are each component's own behaviour test.
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
