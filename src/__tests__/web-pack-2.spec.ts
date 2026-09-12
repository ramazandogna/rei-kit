import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { BaseBreadcrumb, BaseDisclosure, BasePagination, BaseTabs, BaseTooltip } from '../web/index'

/**
 * The rest of the wide-site pack.
 *
 * Shipped without waiting for a consumer to need them, which is the rule this
 * kit is written under: somebody installing it should not have to hand-write a
 * pagination control because today's apps do not paginate.
 */

describe('BaseTooltip', () => {
  const build = () =>
    mount(BaseTooltip, {
      props: { label: 'Copy to clipboard' },
      slots: { default: '<button>copy</button>' },
    })

  it('describes the control rather than floating beside it', () => {
    // A screen reader reads it as a description of the button, not as stray
    // text that happens to be nearby.
    const w = build()
    const bubble = w.find('[role="tooltip"]')

    expect(bubble.exists()).toBe(true)
    expect(bubble.attributes('id')).toBeTruthy()
  })

  it('hands the id to the trigger so the caller can point at it', () => {
    const w = mount(BaseTooltip, {
      props: { label: 'Copy' },
      slots: { default: '<button :aria-describedby="params.describedBy">copy</button>' },
    })

    expect(w.find('button').attributes('aria-describedby')).toBe(
      w.find('[role="tooltip"]').attributes('id'),
    )
  })

  it('needs no JavaScript to appear', () => {
    // The bubble is in the markup and shown by :hover and :focus-within, so it
    // works in a prerendered page and with scripting off. If this ever becomes
    // a v-if, that promise is gone.
    expect(build().find('[role="tooltip"]').text()).toBe('Copy to clipboard')
  })
})

describe('BaseBreadcrumb', () => {
  const items = [
    { label: 'Courses', to: '/kurslar' },
    { label: 'N5', to: '/kurslar/n5' },
    { label: 'Day 3' },
  ]

  const build = () =>
    mount(BaseBreadcrumb, {
      props: { items, label: 'Breadcrumb' },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })

  it('does not link the page to itself', () => {
    const w = build()

    expect(w.findAll('a')).toHaveLength(2)
    expect(w.find('[aria-current="page"]').text()).toBe('Day 3')
  })

  it('hides the separators, which carry no information', () => {
    // The list and the reader's position in it already say what the slashes say.
    const w = build()
    const seps = w.findAll('[aria-hidden="true"]')

    expect(seps).toHaveLength(items.length - 1)
  })

  it('is an ordered list, because the order is the meaning', () => {
    expect(build().find('nav > ol').exists()).toBe(true)
  })
})

describe('BaseTabs', () => {
  const items = [
    { key: 'a', label: 'First' },
    { key: 'b', label: 'Second' },
    { key: 'c', label: 'Third' },
  ] as const

  const build = (modelValue: string = 'a') =>
    mount(BaseTabs, {
      props: { items, modelValue, label: 'Sections' },
      slots: { default: '<p>panel</p>' },
    })

  it('lets Tab in once and out once', async () => {
    // Roving tabindex. Without it a keyboard user presses Tab past every tab to
    // reach the content, which is the way hand-written tabs usually go wrong.
    const w = build('b')
    const tabs = w.findAll('[role="tab"]')

    expect(tabs.map((t) => t.attributes('tabindex'))).toEqual(['-1', '0', '-1'])
  })

  it('moves with the arrow keys and wraps at both ends', async () => {
    const w = build('a')
    const list = w.find('[role="tablist"]')

    await list.trigger('keydown', { key: 'ArrowLeft' })
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['c'])

    await w.setProps({ modelValue: 'c' })
    await list.trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['a'])
  })

  it('jumps to the ends with Home and End', async () => {
    const w = build('b')
    const list = w.find('[role="tablist"]')

    await list.trigger('keydown', { key: 'Home' })
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['a'])

    await list.trigger('keydown', { key: 'End' })
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['c'])
  })

  it('leaves other keys to the browser', async () => {
    const w = build('a')

    await w.find('[role="tablist"]').trigger('keydown', { key: 'Tab' })
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('ties every tab to its panel in both directions', () => {
    const w = build('a')
    const tab = w.findAll('[role="tab"]')[0]!
    const panel = w.findAll('[role="tabpanel"]')[0]!

    expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'))
    expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))
    expect(tab.attributes('aria-selected')).toBe('true')
  })

  it('keeps every panel in the markup, so the page keeps its height', () => {
    expect(build('a').findAll('[role="tabpanel"]')).toHaveLength(3)
  })
})

describe('BasePagination', () => {
  const build = (page: number, pages: number) =>
    mount(BasePagination, {
      props: { page, pages, previousLabel: 'Previous', nextLabel: 'Next' },
    })

  const numbers = (w: ReturnType<typeof build>) =>
    w.findAll('.rk-pager-page, .rk-pager-gap').map((n) => n.text())

  it('shows everything while everything fits', () => {
    expect(numbers(build(1, 5))).toEqual(['1', '2', '3', '4', '5'])
  })

  it('cuts the middle out of a long list', () => {
    expect(numbers(build(20, 40))).toEqual(['1', '…', '19', '20', '21', '…', '40'])
  })

  it('never replaces a single page with an ellipsis', () => {
    // A gap standing in for one page is longer than the page it replaces.
    expect(numbers(build(3, 40))).toEqual(['1', '2', '3', '4', '…', '40'])
  })

  it('keeps its width as you move through it', () => {
    // A row of numbers that reflows under the pointer is a row you have to
    // re-aim at.
    expect(numbers(build(20, 40))).toHaveLength(numbers(build(21, 40)).length)
  })

  it('stops at the ends rather than emitting a page that is not there', async () => {
    const first = build(1, 5)
    await first.findAll('.rk-pager-step')[0]!.trigger('click')
    expect(first.emitted('change')).toBeUndefined()

    const last = build(5, 5)
    await last.findAll('.rk-pager-step')[1]!.trigger('click')
    expect(last.emitted('change')).toBeUndefined()
  })

  it('emits the number rather than navigating, because it cannot know how', async () => {
    const w = build(2, 5)
    await w.findAll('.rk-pager-page')[0]!.trigger('click')

    expect(w.emitted('change')?.[0]).toEqual([1])
  })

  it('does not re-emit the page you are already on', async () => {
    const w = build(2, 5)
    await w.findAll('.rk-pager-page')[1]!.trigger('click')

    expect(w.emitted('change')).toBeUndefined()
  })

  it('names the arrows, which are glyphs and not words', () => {
    const steps = build(2, 5).findAll('.rk-pager-step')

    expect(steps[0]!.attributes('aria-label')).toBe('Previous')
    expect(steps[1]!.attributes('aria-label')).toBe('Next')
  })

  it('marks the current page for a screen reader', () => {
    const w = build(3, 5)

    expect(w.find('[aria-current="page"]').text()).toBe('3')
  })
})

describe('BaseDisclosure', () => {
  const build = (modelValue = false) =>
    mount(BaseDisclosure, {
      props: { title: 'Can I cancel?', modelValue },
      slots: { default: '<p>Any time.</p>' },
    })

  it('keeps the answer in the markup while it is shut', () => {
    // What a crawler and a reader without JavaScript get, and the reason this
    // is not <details>.
    expect(build().find('p').exists()).toBe(true)
  })

  it('says it is shut, and means it', () => {
    expect(build().find('button').attributes('aria-expanded')).toBe('false')
    expect(build(true).find('button').attributes('aria-expanded')).toBe('true')
  })

  it('points the control at the panel', () => {
    const w = build()
    const controls = w.find('button').attributes('aria-controls')

    expect(w.find(`#${controls}`).exists()).toBe(true)
  })

  it('puts the control in a heading, at the level the page needs', () => {
    expect(build().find('h3 button').exists()).toBe(true)
    expect(
      mount(BaseDisclosure, {
        props: { title: 'x', headingLevel: 2 },
        slots: { default: 'y' },
      })
        .find('h2 button')
        .exists(),
    ).toBe(true)
  })

  it("is the app's to open, so a list can decide what only-one-at-a-time means", async () => {
    const w = build()
    await w.find('button').trigger('click')

    expect(w.emitted('update:modelValue')?.[0]).toEqual([true])
  })
})
