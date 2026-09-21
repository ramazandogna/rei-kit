import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { BaseCombobox, BaseSlider, BaseTable } from '../index'

describe('BaseTable', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'amount', label: 'Amount', align: 'end' },
  ] as const
  const rows = [
    { name: 'Coffee', amount: 120 },
    { name: 'Books', amount: 4300 },
  ]

  const build = (props: Record<string, unknown> = {}) =>
    mount(BaseTable, { props: { columns, rows, caption: 'Spending', ...props } })

  it('names itself, or it is a box of numbers', () => {
    // A table with no caption is announced as "table" and nothing else.
    expect(build().find('caption').text()).toBe('Spending')
  })

  it('keeps the name when the page already shows a heading', () => {
    // Off screen rather than removed: a heading above is not attached to
    // anything, so the table still has to carry its own name.
    const w = build({ captionHidden: true })

    expect(w.find('caption').text()).toBe('Spending')
    expect(w.find('caption').classes()).toContain('rk-table-caption-hidden')
  })

  it('aligns the heading with its cells, so a column reads as one column', () => {
    // The bug this locks: the class was on both, but `.rk-table th` sets
    // `text-align: left` and outranked a bare `.is-end`, so a money column
    // rendered as a heading on the left and its figures at the far edge.
    const w = build()

    expect(w.findAll('th')[1]!.classes()).toContain('is-end')
    expect(w.findAll('td')[1]!.classes()).toContain('is-end')
    // Nothing is added to a column that did not ask for an alignment.
    expect(w.findAll('th')[0]!.classes()).not.toContain('is-end')
  })

  it('scopes its headers, so a cell is read with its column', () => {
    const w = build()

    expect(w.findAll('th').every((th) => th.attributes('scope') === 'col')).toBe(true)
  })

  it('scrolls through ScrollArea rather than a scroller of its own', () => {
    const wrapper = build()

    // Third copy of the same four lines in the kit, after CodeBlock and
    // the showcase. It is one component now, and it is the component that
    // knows when the stop is worth having.
    expect(wrapper.find('.rk-table-scroll .rk-scroll-viewport').exists()).toBe(true)
  })

  it('becomes a named focus stop when it overflows and the cells are only text', async () => {
    const wrapper = build()
    const viewport = wrapper.get('.rk-scroll-viewport')

    // jsdom lays nothing out, so the overflow is set by hand — it is the
    // input the decision is made from.
    Object.defineProperty(viewport.element, 'clientWidth', { value: 100, configurable: true })
    Object.defineProperty(viewport.element, 'scrollWidth', { value: 600, configurable: true })
    await viewport.trigger('scroll')

    // A region only a drag can reach is a region a keyboard cannot read at
    // all, and the end of the widest row is simply unreachable.
    expect(viewport.attributes('tabindex')).toBe('0')
    expect(viewport.attributes('role')).toBe('region')
    expect(viewport.attributes('aria-label')).toBe('Spending')
  })

  it('does not take a stop of its own when a cell already takes focus', async () => {
    const wrapper = mount(BaseTable, {
      props: { columns, rows, caption: 'Spending' },
      slots: { name: '<a href="#x">bir bağlantı</a>' },
    })
    const viewport = wrapper.get('.rk-scroll-viewport')

    Object.defineProperty(viewport.element, 'clientWidth', { value: 100, configurable: true })
    Object.defineProperty(viewport.element, 'scrollWidth', { value: 600, configurable: true })
    await viewport.trigger('scroll')

    // Tab already scrolls the next link into view; a stop here would be a
    // press for nothing on every table of links in the app.
    expect(viewport.attributes('tabindex')).toBeUndefined()
  })

  it('spans the empty row across every column', () => {
    const w = build({ rows: [], slots: undefined })

    expect(w.find('.rk-table-empty').attributes('colspan')).toBe('2')
  })

  it('lets a column render itself', () => {
    const w = mount(BaseTable, {
      props: { columns, rows, caption: 'Spending' },
      slots: { amount: '<b class="money">{{ params.value }}</b>' },
    })

    expect(w.findAll('.money')).toHaveLength(2)
  })
})

describe('BaseSlider', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(BaseSlider, { props: { label: 'Session length', modelValue: 45, ...props } })

  it('is a native range, so the keyboard already works', () => {
    expect(build().find('input').attributes('type')).toBe('range')
  })

  it('says what the number means rather than reading it bare', () => {
    // "45" is not an answer to anything.
    const w = build({ format: (n: number) => `${n} minutes` })

    expect(w.find('input').attributes('aria-valuetext')).toBe('45 minutes')
    expect(w.find('output').text()).toBe('45 minutes')
  })

  it('falls back to the number when there is nothing to add', () => {
    expect(build().find('input').attributes('aria-valuetext')).toBe('45')
  })

  it('fills the track to the current value', () => {
    const w = build({ min: 0, max: 90, modelValue: 45 })

    expect(w.find('input').attributes('style')).toContain('50%')
  })

  it('survives a range with no span', () => {
    const w = build({ min: 5, max: 5, modelValue: 5 })

    expect(w.find('input').attributes('style')).toContain('0%')
  })
})

describe('BaseCombobox', () => {
  const options = [
    { value: 'tr', label: 'Türkiye' },
    { value: 'jp', label: 'Japan' },
    { value: 'de', label: 'Germany' },
  ] as const

  const build = (props: Record<string, unknown> = {}) =>
    mount(BaseCombobox, {
      props: { label: 'Country', options, emptyLabel: 'No matches', ...props },
      attachTo: document.body,
    })

  it('puts the role and the state on the input, where they are looked for', () => {
    const w = build()
    const input = w.find('input')

    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(input.attributes('aria-autocomplete')).toBe('list')
    w.unmount()
  })

  it('narrows the list as you type', async () => {
    const w = build()
    await w.find('input').setValue('ja')

    expect(w.findAll('[role="option"]')).toHaveLength(1)
    expect(w.find('[role="option"]').text()).toBe('Japan')
    w.unmount()
  })

  it('says so when nothing matches, rather than showing an empty box', async () => {
    const w = build()
    await w.find('input').setValue('zzz')

    expect(w.findAll('[role="option"]')).toHaveLength(0)
    expect(w.text()).toContain('No matches')
    w.unmount()
  })

  it('moves a highlight without moving focus', async () => {
    // Focus has to stay in the text field or typing stops working, which is the
    // entire point of the control.
    const w = build()
    const input = w.find('input')

    // A real focus, not a synthetic event: the assertion below is about where
    // the browser's focus actually is.
    ;(input.element as HTMLInputElement).focus()
    await nextTick()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(input.attributes('aria-activedescendant')).toBe(
      w.findAll('[role="option"]')[1]!.attributes('id'),
    )
    expect(document.activeElement).toBe(input.element)
    w.unmount()
  })

  it('wraps the highlight at both ends', async () => {
    const w = build()
    const input = w.find('input')

    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowUp' })
    await nextTick()

    expect(input.attributes('aria-activedescendant')).toBe(
      w.findAll('[role="option"]')[2]!.attributes('id'),
    )
    w.unmount()
  })

  it('chooses the highlighted option on Enter', async () => {
    const w = build()
    const input = w.find('input')

    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })

    expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['jp'])
    w.unmount()
  })

  it('closes on the first Escape and clears on the second', async () => {
    // Clearing on the first press throws away what was typed when somebody
    // only wanted the list out of the way.
    const w = build({ modelValue: 'jp' })
    const input = w.find('input')

    await input.trigger('focus')
    expect(input.attributes('aria-expanded')).toBe('true')

    await input.trigger('keydown', { key: 'Escape' })
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(w.emitted('update:modelValue')).toBeUndefined()

    await input.trigger('keydown', { key: 'Escape' })
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([''])
    w.unmount()
  })

  it('shows the chosen label once it is closed', async () => {
    const w = build({ modelValue: 'de' })

    expect((w.find('input').element as HTMLInputElement).value).toBe('Germany')
    w.unmount()
  })

  it('closes when something outside is pressed', async () => {
    const w = build()
    await w.find('input').trigger('focus')
    await nextTick()

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()

    expect(w.find('input').attributes('aria-expanded')).toBe('false')
    w.unmount()
  })
})
