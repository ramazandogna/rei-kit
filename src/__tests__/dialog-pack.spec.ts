import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { BasePopconfirm, DescriptionList, TimePicker, setFormatLocale } from '../index'
import { ResponsiveDialog } from '../web/index'

/**
 * Asking, and saying: a dialog that changes shape with the screen, a
 * confirmation beside the button that needs it, a time of day, and pairs of
 * what-it-is and what-it-says.
 */

/** jsdom has no matchMedia; this is the only way to have a screen width. */
function screenIs(wide: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: wide,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

beforeAll(() => setFormatLocale('en-GB'))
afterAll(() => setFormatLocale('en'))

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('ResponsiveDialog', () => {
  const props = { title: 'Kaydı sil', closeLabel: 'Kapat', modelValue: true }

  it('is a modal where there is room for one', async () => {
    screenIs(true)
    const wrapper = mount(ResponsiveDialog, { props, attachTo: document.body })
    await nextTick()
    await nextTick()

    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.querySelector('#sheet-root .shell-frame')).toBeNull()
    wrapper.unmount()
  })

  it('is a sheet on a phone, and while the width is still unknown', async () => {
    // A server has no screen. The narrow answer is the safe first render,
    // because the narrow one fits on both.
    screenIs(false)
    const wrapper = mount(ResponsiveDialog, { props, attachTo: document.body })
    await nextTick()
    await nextTick()

    expect(document.querySelector('#sheet-root')?.textContent).toContain('Kaydı sil')
    wrapper.unmount()
  })
})

describe('BasePopconfirm', () => {
  const build = () =>
    mount(BasePopconfirm, {
      props: {
        message: 'Bu kayıt silinsin mi?',
        confirmLabel: 'Sil',
        cancelLabel: 'Vazgeç',
        modelValue: true,
      },
      slots: {
        trigger: `<template #trigger="{ props }"><button class="opener" v-bind="props">Sil</button></template>`,
      },
      attachTo: document.body,
    })

  it('asks beside the button, in the words it was given', async () => {
    const wrapper = build()
    await nextTick()

    const panel = wrapper.find('[role="dialog"]')
    expect(panel.text()).toContain('Bu kayıt silinsin mi?')
    expect(panel.text()).toContain('Vazgeç')
    wrapper.unmount()
  })

  it('answers once and closes itself, either way', async () => {
    const wrapper = build()
    await nextTick()

    const buttons = wrapper.findAll('[role="dialog"] button')
    await buttons.at(-1)!.trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([false])
    wrapper.unmount()
  })
})

describe('TimePicker', () => {
  const props = {
    label: 'Saat',
    hoursLabel: 'Saat',
    minutesLabel: 'Dakika',
    placeholder: 'Bir saat seçin',
  }

  const build = (extra: Record<string, unknown> = {}) =>
    mount(TimePicker, { props: { ...props, ...extra }, attachTo: document.body })

  it('shows the placeholder, then the time in the reader’s clock', async () => {
    const wrapper = build()
    expect(wrapper.find('.rk-time-field').text()).toBe('Bir saat seçin')

    await wrapper.setProps({ modelValue: '14:30' })
    expect(wrapper.find('.rk-time-field').text()).toBe('14:30')
    wrapper.unmount()
  })

  it('offers minutes at the step it was given', async () => {
    const wrapper = build({ step: 30 })
    await wrapper.find('.rk-time-field').trigger('click')
    await nextTick()

    const columns = wrapper.findAll('[role="listbox"]')
    expect(columns[0]!.findAll('[role="option"]')).toHaveLength(24)
    expect(columns[1]!.findAll('[role="option"]').map((one) => one.text())).toEqual(['00', '30'])
    wrapper.unmount()
  })

  it('hands back HH:mm, whatever it showed', async () => {
    const wrapper = build({ modelValue: '09:00' })
    await wrapper.find('.rk-time-field').trigger('click')
    await nextTick()

    const minutes = wrapper.findAll('[role="listbox"]')[1]!
    await minutes.findAll('[role="option"]')[3]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['09:45'])
    wrapper.unmount()
  })

  it('rules out what is outside its limits', async () => {
    const wrapper = build({ min: '09:00', max: '17:00' })
    await wrapper.find('.rk-time-field').trigger('click')
    await nextTick()

    const hours = wrapper.findAll('[role="listbox"]')[0]!.findAll('[role="option"]')
    // 09 is the first hour any minute of which is inside the range.
    expect(hours[9]!.attributes('aria-disabled')).toBeUndefined()
    expect(hours[8]!.attributes('aria-disabled')).toBe('true')
    expect(hours[20]!.attributes('aria-disabled')).toBe('true')
    wrapper.unmount()
  })
})

describe('DescriptionList', () => {
  const items = [
    { key: 'status', term: 'Durum', description: 'Ödendi' },
    { term: 'Oluşturuldu', description: '12 Eylül' },
  ]

  it('is a description list, so each value is heard with its own name', () => {
    const wrapper = mount(DescriptionList, { props: { items } })

    expect(wrapper.element.tagName).toBe('DL')
    expect(wrapper.findAll('dt').map((one) => one.text())).toEqual(['Durum', 'Oluşturuldu'])
    expect(wrapper.findAll('dd')[0]!.text()).toBe('Ödendi')
  })

  it('lets a value be something other than text', () => {
    const wrapper = mount(DescriptionList, {
      props: { items },
      slots: { status: '<span class="badge">Ödendi</span>' },
    })

    expect(wrapper.find('.badge').exists()).toBe(true)
  })
})
