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

  it('scopes its headers, so a cell is read with its column', () => {
    const w = build()

    expect(w.findAll('th').every((th) => th.attributes('scope') === 'col')).toBe(true)
  })

  it('makes its own scroller reachable by keyboard', () => {
    // A region you can only reach by dragging is a region a keyboard cannot
    // read at all -- one line of markup, and the line everyone forgets.
    const scroller = build().find('.rk-table-scroll')

    expect(scroller.attributes('tabindex')).toBe('0')
    expect(scroller.attributes('role')).toBe('region')
    expect(scroller.attributes('aria-label')).toBe('Spending')
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
