import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { BaseCombobox } from '../index'

/**
 * The three things a combobox grows once the list stops being a handful:
 * an answer that comes from a server, more than one answer, and a list too
 * long to put in the DOM.
 *
 * Each of them is a way to get the same control subtly wrong. A debounce that
 * outlives the component fires a request at nothing. A multiple mode that
 * writes the chosen label into the field makes you delete it to search again.
 * A virtual list that reports its window rather than its length tells a
 * screen reader "3 of 12" about four thousand rows.
 */
const OPTIONS = [
  { value: 'tr', label: 'Türkiye' },
  { value: 'jp', label: 'Japan' },
  { value: 'de', label: 'Germany' },
] as const

const build = (props: Record<string, unknown> = {}) =>
  mount(BaseCombobox, {
    props: { label: 'Country', options: OPTIONS, emptyLabel: 'No matches', ...props },
    attachTo: document.body,
  })

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('a list that comes from a server', () => {
  it('says what was typed once, after it settles', async () => {
    vi.useFakeTimers()
    const w = build({ debounce: 200 })

    await w.find('input').setValue('ja')
    await w.find('input').setValue('jap')
    // Nothing yet: the reader is still typing.
    expect(w.emitted('search')).toBeUndefined()

    vi.advanceTimersByTime(200)
    expect(w.emitted('search')).toEqual([['jap']])
  })

  it('never fires at a component that has gone', async () => {
    vi.useFakeTimers()
    const w = build()

    await w.find('input').setValue('ja')
    // A pending timer is the whole point of a debounce.
    expect(vi.getTimerCount()).toBe(1)

    w.unmount()
    // Counted rather than watched for an event: an emit from an unmounted
    // component is swallowed, so the absence of one proves nothing. What
    // matters is that nothing is left armed to fire a request at nothing.
    expect(vi.getTimerCount()).toBe(0)
  })

  it('leaves the list alone when the server has already narrowed it', async () => {
    const w = build({ filter: 'none' })

    await w.find('input').setValue('zzzz')
    // Filtering again here would hide rows that matched for a reason this
    // side cannot see.
    expect(w.findAll('[role="option"]')).toHaveLength(3)
  })

  it('marks the list busy, and reads the label when it was given one', async () => {
    const w = build({ loading: true, loadingLabel: 'Aranıyor…' })
    await w.find('input').trigger('focus')

    expect(w.find('[role="listbox"]').attributes('aria-busy')).toBe('true')
    expect(w.find('.rk-combo-status').text()).toContain('Aranıyor…')
    // "Nothing matches" is wrong while the answer is still on its way.
    expect(w.text()).not.toContain('No matches')
  })
})

describe('more than one answer', () => {
  const multi = (props: Record<string, unknown> = {}) =>
    build({ mode: 'multiple', modelValue: ['tr'], ...props })

  it('keeps the chosen ones beside the field, not in it', async () => {
    const w = multi()

    expect(w.find('.rk-combo-chip').text()).toContain('Türkiye')
    // The field stays empty, or searching for the next one would mean
    // deleting the last one first.
    expect(w.find('input').element.value).toBe('')
  })

  it('adds one without closing, because choosing several means choosing again', async () => {
    const w = multi()
    await w.find('input').trigger('focus')

    await w.findAll('[role="option"]')[1]!.trigger('pointerdown')

    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([['tr', 'jp']])
    expect(w.find('input').attributes('aria-expanded')).toBe('true')
  })

  it('takes one back off by choosing it again', async () => {
    const w = multi()
    await w.find('input').trigger('focus')

    await w.findAll('[role="option"]')[0]!.trigger('pointerdown')

    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([[]])
  })

  it('removes the last one with Backspace, but only on an empty field', async () => {
    const w = multi({ modelValue: ['tr', 'jp'] })

    await w.find('input').setValue('ger')
    await w.find('input').trigger('keydown', { key: 'Backspace' })
    // A letter and a chip must not go with the same press.
    expect(w.emitted('update:modelValue')).toBeUndefined()

    await w.find('input').setValue('')
    await w.find('input').trigger('keydown', { key: 'Backspace' })
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([['tr']])
  })

  it('gives a chip a remove button only when it was given the words for one', async () => {
    const plain = multi()
    expect(plain.find('.rk-combo-chip-x').exists()).toBe(false)

    const named = multi({ removeLabel: (label: string) => `${label} çıkar` })
    const button = named.find('.rk-combo-chip-x')

    expect(button.attributes('aria-label')).toBe('Türkiye çıkar')
    await button.trigger('click')
    expect(named.emitted('update:modelValue')!.at(-1)).toEqual([[]])
  })

  it('says the list takes more than one', async () => {
    const w = multi()
    expect(w.find('[role="listbox"]').attributes('aria-multiselectable')).toBe('true')
  })
})

describe('a list too long to render', () => {
  const many = Array.from({ length: 400 }, (_, index) => ({
    value: `v${index}`,
    label: `Option ${index}`,
  }))

  it('puts a window in the DOM and stands in for the rest', async () => {
    const w = build({ options: many, virtualizeAfter: 50, rowHeight: 36 })
    await w.find('input').trigger('focus')
    await nextTick()

    const rendered = w.findAll('[role="option"]')
    expect(rendered.length).toBeGreaterThan(0)
    expect(rendered.length).toBeLessThan(100)
  })

  it('tells a screen reader the length of the list, not of the window', async () => {
    const w = build({ options: many, virtualizeAfter: 50 })
    await w.find('input').trigger('focus')
    await nextTick()

    const first = w.findAll('[role="option"]')[0]!
    // "1 of 400" -- what somebody listening needs, and the thing a hand-
    // written virtual list always reports as the window instead.
    expect(first.attributes('aria-setsize')).toBe('400')
    expect(first.attributes('aria-posinset')).toBe('1')
  })

  it('renders every row when the list is short enough not to need this', async () => {
    const w = build({ virtualizeAfter: 50 })
    await w.find('input').trigger('focus')

    expect(w.findAll('[role="option"]')).toHaveLength(3)
    // No spacers: a short list is the plain one it always was.
    expect(w.find('[aria-hidden="true"][style]').exists()).toBe(false)
  })

  it('moves the scroller by arithmetic, since the row may not exist yet', async () => {
    const w = build({ options: many, virtualizeAfter: 50, rowHeight: 36 })
    await w.find('input').trigger('focus')
    await nextTick()

    const list = w.find('[role="listbox"]').element as HTMLElement
    // jsdom lays nothing out, so the scroller's own height is 0 and the
    // component falls back to its declared one; what matters is that the
    // highlight moving down moves the scroller at all rather than throwing
    // on an element that was never rendered.
    for (let i = 0; i < 40; i++) {
      await w.find('input').trigger('keydown', { key: 'ArrowDown' })
    }
    await nextTick()

    expect(list.scrollTop).toBeGreaterThan(0)
  })
})
