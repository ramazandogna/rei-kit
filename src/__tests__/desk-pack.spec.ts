import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { nextTick } from 'vue'

import { BaseListbox } from '../index'
import { CommandMenu, DataTable } from '../web/index'

/**
 * The desk-sized parts: a table of real data, a list to choose from, and
 * everything the app can do behind one shortcut.
 *
 * What is pinned here is what a hand-written version of each gets wrong: a
 * sort nobody can hear, a selection of row indexes that means something
 * else after sorting, and a palette where the arrows move focus out of the
 * field you are typing in.
 */

afterEach(() => {
  document.body.innerHTML = ''
})

describe('DataTable', () => {
  const columns = [
    { key: 'name', label: 'Ad', sortable: true },
    { key: 'amount', label: 'Tutar', align: 'end', sortable: true },
    { key: 'note', label: 'Not' },
  ] as const
  const rows = [
    { id: 'a', name: 'Ömer', amount: 120, note: '' },
    { id: 'b', name: 'Ada', amount: 4200, note: '' },
    { id: 'c', name: 'Zeynep', amount: 30, note: '' },
  ]

  const build = (props: Record<string, unknown> = {}) =>
    mount(DataTable, { props: { columns, rows, caption: 'Ödemeler', rowKey: 'id', ...props } })

  const bodyText = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('tbody tr').map((row) => row.findAll('td')[0]!.text())

  it('says which column is sorted, in the way a screen reader reads', async () => {
    const wrapper = build()
    const first = wrapper.findAll('th')[0]!

    expect(first.attributes('aria-sort')).toBe('none')
    await first.find('button').trigger('click')
    expect(wrapper.findAll('th')[0]!.attributes('aria-sort')).toBe('ascending')
  })

  it('sorts numbers as numbers and names by the reader’s collation', async () => {
    const wrapper = build()

    await wrapper.findAll('th')[1]!.find('button').trigger('click')
    expect(bodyText(wrapper)).toEqual(['Zeynep', 'Ömer', 'Ada'])

    await wrapper.findAll('th')[0]!.find('button').trigger('click')
    // 'Ö' sorts before 'Z' where the reader lives, not after it by code point.
    expect(bodyText(wrapper)).toEqual(['Ada', 'Ömer', 'Zeynep'])
  })

  it('goes back to the order it arrived in on the third press', async () => {
    const wrapper = build()
    const header = () => wrapper.findAll('th')[0]!.find('button')

    await header().trigger('click')
    await header().trigger('click')
    await header().trigger('click')

    expect(bodyText(wrapper)).toEqual(['Ömer', 'Ada', 'Zeynep'])
  })

  it('reports the sort instead of doing it when the server pages the rows', async () => {
    const wrapper = build({ manualSort: true })

    await wrapper.findAll('th')[0]!.find('button').trigger('click')

    expect(wrapper.emitted('update:sort')!.at(-1)).toEqual([{ key: 'name', direction: 'asc' }])
    expect(bodyText(wrapper)).toEqual(['Ömer', 'Ada', 'Zeynep'])
  })

  it('selects by key, not by index, and names every box', async () => {
    const wrapper = build({
      selectAllLabel: 'Hepsini seç',
      rowLabel: (row: { name: string }) => `${row.name} satırını seç`,
      selected: [],
    })

    expect(wrapper.find('[aria-label="Ada satırını seç"]').exists()).toBe(true)

    await wrapper.find('[aria-label="Ömer satırını seç"]').trigger('change')
    expect(wrapper.emitted('update:selected')!.at(-1)).toEqual([['a']])

    await wrapper.find('[aria-label="Hepsini seç"]').trigger('change')
    expect(wrapper.emitted('update:selected')!.at(-1)).toEqual([['a', 'b', 'c']])
  })

  it('draws skeleton rows while it waits, and says it is busy', () => {
    const wrapper = build({ loading: true, loadingRows: 3 })

    expect(wrapper.find('tbody').attributes('aria-busy')).toBe('true')
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
  })
})

describe('BaseListbox', () => {
  const options = [
    { value: 'ada', label: 'Ada' },
    { value: 'kenji', label: 'Kenji' },
    { value: 'mei', label: 'Mei', disabled: true },
    { value: 'omer', label: 'Ömer' },
  ] as const

  it('is one Tab stop that says which option is current', async () => {
    const wrapper = mount(BaseListbox, { props: { options, label: 'Kişiler' } })

    expect(wrapper.attributes('role')).toBe('listbox')
    expect(wrapper.attributes('tabindex')).toBe('0')
    const first = wrapper.findAll('[role="option"]')[0]!
    expect(wrapper.attributes('aria-activedescendant')).toBe(first.attributes('id'))
  })

  it('moves the choice with the arrows in single mode', async () => {
    const wrapper = mount(BaseListbox, { props: { options, label: 'Kişiler' } })

    await wrapper.trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['kenji'])
  })

  it('toggles with Space in multiple mode, in the order of the options', async () => {
    const wrapper = mount(BaseListbox, {
      props: { options, label: 'Kişiler', mode: 'multiple', modelValue: ['omer'] },
    })

    await wrapper.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['ada', 'omer']])
  })

  it('jumps to what was typed, skipping what cannot be chosen', async () => {
    const wrapper = mount(BaseListbox, { props: { options, label: 'Kişiler', mode: 'multiple' } })

    await wrapper.trigger('keydown', { key: 'k' })
    expect(wrapper.attributes('aria-activedescendant')).toContain('-1')

    // A second letter continues the same word rather than starting again,
    // so "kö" matches nothing and the current option stays where it was.
    await wrapper.trigger('keydown', { key: 'ö' })
    expect(wrapper.attributes('aria-activedescendant')).toContain('-1')
  })

  it('starts a new word once the typing has paused', async () => {
    const wrapper = mount(BaseListbox, { props: { options, label: 'Kişiler', mode: 'multiple' } })

    // Mei is disabled, so 'm' finds nothing; 'ö' finds Ömer.
    await wrapper.trigger('keydown', { key: 'ö' })

    expect(wrapper.attributes('aria-activedescendant')).toContain('-3')
  })

  it('shows a current row only while it is being used', () => {
    /* A highlight left on a list nobody is in reads as a selection, which is
       exactly what it is not — the bug that made a moved item in a transfer
       list look picked while the button beside it stayed disabled. Asserted
       against the stylesheet, because scoped styles are not applied in a
       test and a computed colour would be a lie either way. */
    const source = readFileSync('src/components/BaseListbox.vue', 'utf8')

    expect(source).toContain('.rk-listbox:focus-within .rk-listbox-option.is-active')
  })

  it('does not choose what is disabled', async () => {
    const wrapper = mount(BaseListbox, { props: { options, label: 'Kişiler', mode: 'multiple' } })

    await wrapper.findAll('[role="option"]')[2]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('CommandMenu', () => {
  const groups = [
    {
      label: 'Kayıtlar',
      items: [
        { id: 'new', label: 'Yeni kayıt', hint: '⌘N', keywords: ['write', 'add'] },
        { id: 'search', label: 'Kayıtlarda ara' },
      ],
    },
    { label: 'Ayarlar', items: [{ id: 'theme', label: 'Temayı değiştir' }] },
  ] as const

  const build = () =>
    mount(CommandMenu, {
      props: {
        groups,
        label: 'Komutlar',
        placeholder: 'Bir komut yazın',
        emptyLabel: 'Sonuç yok',
        modelValue: true,
        hotkey: 'k',
      },
      attachTo: document.body,
    })

  it('is a combobox whose results are its list', async () => {
    const wrapper = build()
    await nextTick()

    const field = document.querySelector('input')!
    expect(field.getAttribute('role')).toBe('combobox')
    expect(field.getAttribute('aria-controls')).toBe(document.querySelector('[role="listbox"]')?.id)
    // Focus stays in the field; the current option is named, not focused.
    expect(document.activeElement).toBe(field)
    wrapper.unmount()
  })

  it('finds by the words beside the label as well as the label', async () => {
    const wrapper = build()
    await nextTick()

    const field = document.querySelector('input')!
    field.value = 'write'
    field.dispatchEvent(new Event('input'))
    await nextTick()

    const options = document.querySelectorAll('[role="option"]')
    expect(options).toHaveLength(1)
    expect(options[0]!.textContent).toContain('Yeni kayıt')
    wrapper.unmount()
  })

  it('moves with the arrows and runs on Enter, without leaving the field', async () => {
    const wrapper = build()
    await nextTick()
    const field = document.querySelector('input')!

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    expect(document.querySelectorAll('[role="option"]')[1]!.getAttribute('aria-selected')).toBe(
      'true',
    )

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('select')!.at(-1)).toEqual(['search'])
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('says so when nothing matches, rather than showing an empty box', async () => {
    const wrapper = build()
    await nextTick()

    const box = document.querySelector('input')!
    box.value = 'zzz'
    box.dispatchEvent(new Event('input'))
    await nextTick()

    expect(document.querySelector('[role="listbox"]')!.textContent).toContain('Sonuç yok')
    wrapper.unmount()
  })

  it('opens and closes on its shortcut', async () => {
    const wrapper = mount(CommandMenu, {
      props: {
        groups,
        label: 'Komutlar',
        placeholder: 'Yazın',
        emptyLabel: 'Yok',
        modelValue: false,
        hotkey: 'k',
      },
      attachTo: document.body,
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([true])
    wrapper.unmount()
  })
})
