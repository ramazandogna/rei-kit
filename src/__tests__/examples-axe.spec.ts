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

/*
 * axe-core in jsdom is slow and, more to the point, variable: it walks the
 * whole document for every one of these, and on a loaded machine a single
 * case can take several seconds. At the default five it fails one case in
 * three runs, and a different one each time — which is what gives it away
 * as patience rather than a fault.
 *
 * This raises the patience and changes no assertion. It was measured
 * across six runs of the suite on this machine, three on the commit before
 * the one that first showed it: the same rate either way, so it is not a
 * regression, it is the suite.
 */
const AXE_TIMEOUT_MS = 30_000

const AXE_OPTIONS: axe.RunOptions = {
  resultTypes: ['violations'],
  rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
}

/*
 * Every axe run in this file goes through here, and they are chained rather
 * than merely awaited.
 *
 * axe-core is a module-level singleton: `axe.run` asserts that no run is in
 * flight, and the flag it checks is cleared by the run finishing, not by
 * whoever was waiting for it walking away. So when a case hits the timeout
 * above, vitest abandons the await while the run itself carries on — and
 * the next case calls `axe.run`, hits the assertion, and fails with "Axe is
 * already running". So does the one after that. One slow case took the
 * whole file down, which is how a suite that had found nothing for weeks
 * could still be the loudest thing in CI.
 *
 * Chaining makes the overlap impossible instead of detecting it: a call
 * that arrives while a run is in flight waits for it, which is exactly what
 * the assertion was asking for. The abandoned run still returns a result
 * for a document its own test no longer owns, but that test has already
 * failed by timeout — what it cannot do any more is fail the next hundred.
 */
let inFlight: Promise<unknown> = Promise.resolve()

function runAxe(): Promise<axe.AxeResults> {
  const next = inFlight.then(() => axe.run(document.body, AXE_OPTIONS))
  /* `.catch` rather than `next` itself, or one rejection breaks the chain
     for every run after it — the failure mode this exists to remove. */
  inFlight = next.catch(() => undefined)
  return next
}

describe('the examples, through axe', () => {
  it('has one example per component to audit', () => {
    expect(NAMES.length).toBeGreaterThan(90)
  })

  it.each(NAMES)(
    '%s renders nothing axe objects to',
    async (name) => {
      const mod = (await import(`../../showcase/examples/${name}.vue`)) as {
        default: Parameters<typeof mount>[0]
      }

      const host = document.createElement('div')
      document.body.append(host)

      const wrapper = mount(mod.default, {
        attachTo: host,
        global: { plugins: [router()] },
      })

      const results = await runAxe()

      const found = results.violations.map(
        (violation) => `${violation.id} (${violation.nodes.length}): ${violation.help}`,
      )

      wrapper.unmount()
      host.remove()

      expect(found).toEqual([])
    },
    AXE_TIMEOUT_MS,
  )
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

  /* Which components actually opened onto something. The skip below is what
     makes this suite fast, and a skip is also how it could quietly stop
     auditing anything at all — so what it did is counted and checked. */
  const audited = new Set<string>()

  it.each(NAMES)(
    '%s opens onto nothing axe objects to',
    async (name) => {
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

          const before = document.body.innerHTML

          if (act === 'arrow') await triggers[index]!.trigger('keydown', { key: 'ArrowDown' })
          else await triggers[index]!.trigger(act)

          await nextTick()
          await new Promise((resolve) => setTimeout(resolve, 0))

          /* Nothing opened, so this tree is the one the closed-state sweep
             above already audited and axe would be asked the same question
             twice. Most of the 12 pokes per component land here — skipping
             them is what keeps this suite inside its timeout, and what a
             timeout being hit costs is not one test: axe-core is a
             module-level singleton, so a run abandoned mid-flight makes
             every test after it fail with "Axe is already running". */
          if (document.body.innerHTML === before) {
            wrapper.unmount()
            continue
          }

          audited.add(name)

          const results = await runAxe()

          for (const violation of results.violations) {
            const line = `${act} on trigger ${index}: ${violation.id} — ${violation.help}`
            if (!found.includes(line)) found.push(line)
          }

          wrapper.unmount()
        }
      }

      document.body.innerHTML = ''
      expect(found).toEqual([])
    },
    // Twelve axe runs per case here rather than one, so this needs the
    // patience even more than the sweep above.
    AXE_TIMEOUT_MS,
  )

  it('audited the components that actually open onto something', () => {
    /* A floor, not the coverage: `BaseCombobox` holds its list with
       `v-show`, so it is audited in both states while adding no nodes to
       notice. If this ever drops, the skip above has started swallowing
       the thing this whole describe exists for. */
    expect(audited.size).toBeGreaterThanOrEqual(13)
  })
})

/**
 * The chaining above, proved by abandoning a run.
 *
 * This is the one fault in this file that has actually been seen in CI, and
 * it is invisible in a green run: everything passes until a machine is slow
 * enough for one case to hit the timeout, and then a hundred cases fail for
 * a reason that has nothing to do with any of them. Take the chain out of
 * `runAxe` and this test is the one that says so.
 */
describe('the axe runs in this file', () => {
  it('cannot be broken by a run whose caller walked away', async () => {
    document.body.innerHTML = '<main><h1>Something for axe to walk</h1></main>'

    /* What a timed-out case leaves behind: a run in flight with nobody
       waiting for it. The `catch` is only so Node does not call the
       rejection unhandled — it is not a wait. */
    void runAxe().catch(() => undefined)

    await expect(runAxe()).resolves.toHaveProperty('violations')

    document.body.innerHTML = ''
  })
})
