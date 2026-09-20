import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { BaseCalendar, BaseDatePicker, setFormatLocale } from '../index'

/**
 * The calendar, and the field that opens one.
 *
 * Dates are date keys throughout — `YYYY-MM-DD`, local — and the names a
 * reader hears come from `Intl`. The locale is pinned here so the assertions
 * are about the component rather than about the machine running them.
 */
const LABELS = { previousLabel: 'Önceki ay', nextLabel: 'Sonraki ay' }

beforeAll(() => setFormatLocale('en-GB'))
afterAll(() => setFormatLocale('en'))

afterEach(() => {
  document.body.innerHTML = ''
})

const days = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('[role="gridcell"] button')
const dayNamed = (wrapper: ReturnType<typeof mount>, name: string) =>
  days(wrapper).find((day) => day.attributes('aria-label') === name)!

describe('BaseCalendar', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(BaseCalendar, {
      props: { ...LABELS, today: '2026-09-17', ...props },
      attachTo: document.body,
    })

  it('always shows six weeks, so paging it does not change its height', () => {
    const wrapper = build()

    expect(wrapper.findAll('[role="row"]')).toHaveLength(6)
    expect(days(wrapper)).toHaveLength(42)
  })

  it('names the month, the weekdays and every day in the reader’s language', () => {
    const wrapper = build()

    expect(wrapper.find('.rk-cal-title').text()).toBe('September 2026')
    expect(wrapper.find('.rk-cal-weekdays').text()).toContain('Mon')
    expect(dayNamed(wrapper, 'Thursday, 17 September 2026').exists()).toBe(true)
  })

  it('marks today, and starts the week where it is told', () => {
    const wrapper = build({ weekStartsOn: 0 })

    expect(wrapper.find('.rk-cal-weekdays span').text()).toBe('Sun')
    expect(wrapper.find('[aria-current="date"]').text()).toBe('17')
  })

  it('moves a day, a week and a month with the keyboard', async () => {
    const wrapper = build()
    const grid = wrapper.find('[role="grid"]')

    await dayNamed(wrapper, 'Thursday, 17 September 2026').trigger('focus')
    await grid.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Friday, 18 September 2026')

    await grid.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Friday, 25 September 2026')

    await grid.trigger('keydown', { key: 'PageDown' })
    await nextTick()
    expect(wrapper.find('.rk-cal-title').text()).toBe('October 2026')

    await grid.trigger('keydown', { key: 'PageUp', shiftKey: true })
    await nextTick()
    expect(wrapper.find('.rk-cal-title').text()).toBe('October 2025')
  })

  it('is one Tab stop: only the day the keyboard is on can be reached', () => {
    const wrapper = build({ modelValue: '2026-09-04' })

    const reachable = days(wrapper).filter((day) => day.attributes('tabindex') === '0')
    expect(reachable).toHaveLength(1)
    expect(reachable[0]!.attributes('aria-label')).toBe('Friday, 4 September 2026')
  })

  it('hands back a date key, never a Date', async () => {
    const wrapper = build()

    await dayNamed(wrapper, 'Thursday, 17 September 2026').trigger('click')

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['2026-09-17'])
  })

  it('rules out what is out of range or ruled out by the app', () => {
    const wrapper = build({
      min: '2026-09-10',
      max: '2026-09-20',
      // No Sundays.
      isDisabled: (key: string) => new Date(`${key}T00:00:00`).getDay() === 0,
    })

    expect(dayNamed(wrapper, 'Wednesday, 9 September 2026').attributes('disabled')).toBeDefined()
    expect(dayNamed(wrapper, 'Sunday, 13 September 2026').attributes('disabled')).toBeDefined()
    expect(dayNamed(wrapper, 'Monday, 14 September 2026').attributes('disabled')).toBeUndefined()
  })

  it('takes a range in two clicks, in either order', async () => {
    const wrapper = build({ mode: 'range' })

    await dayNamed(wrapper, 'Friday, 18 September 2026').trigger('click')
    // Nothing is reported from half a range.
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await dayNamed(wrapper, 'Monday, 14 September 2026').trigger('click')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([
      { start: '2026-09-14', end: '2026-09-18' },
    ])
  })

  it('paints the days inside a chosen range', () => {
    const wrapper = build({ mode: 'range', modelValue: { start: '2026-09-14', end: '2026-09-16' } })

    expect(dayNamed(wrapper, 'Monday, 14 September 2026').classes()).toContain('is-selected')
    expect(dayNamed(wrapper, 'Tuesday, 15 September 2026').classes()).toContain('is-inside')
    expect(dayNamed(wrapper, 'Wednesday, 16 September 2026').classes()).toContain('is-selected')
  })

  it('offers months and years, so a date two years out is two clicks away', async () => {
    const wrapper = build()

    await wrapper.find('.rk-cal-title').trigger('click')
    expect(wrapper.findAll('.rk-cal-block')).toHaveLength(12)
    expect(wrapper.find('.rk-cal-block').text()).toBe('Jan')

    await wrapper.find('.rk-cal-title').trigger('click')
    expect(wrapper.find('.rk-cal-title').text()).toContain('–')

    await wrapper.findAll('.rk-cal-block')[0]!.trigger('click')
    await nextTick()
    // A year lands on the months of that year, and a month on its days.
    expect(wrapper.findAll('.rk-cal-block')[8]!.text()).toBe('Sept')
    await wrapper.findAll('.rk-cal-block')[8]!.trigger('click')
    await nextTick()
    expect(wrapper.find('[role="grid"]').exists()).toBe(true)
  })
})

describe('BaseDatePicker', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(BaseDatePicker, {
      props: {
        ...LABELS,
        label: 'Tarih',
        placeholder: 'Bir gün seçin',
        today: '2026-09-17',
        ...props,
      },
      attachTo: document.body,
    })

  it('shows the placeholder, then the date in the reader’s language', async () => {
    const wrapper = build()
    expect(wrapper.find('.rk-date-field').text()).toBe('Bir gün seçin')

    await wrapper.setProps({ modelValue: '2026-09-17' })
    expect(wrapper.find('.rk-date-field').text()).toBe('17 Sept 2026')
  })

  it('reads a range as a span', async () => {
    const wrapper = build({ mode: 'range', modelValue: { start: '2026-09-14', end: '2026-09-18' } })

    expect(wrapper.find('.rk-date-field').text()).toContain('–')
  })

  it('opens a calendar, and closes once a day is chosen', async () => {
    const wrapper = build()
    await wrapper.find('.rk-date-field').trigger('click')
    await nextTick()

    expect(wrapper.find('[role="grid"]').exists()).toBe(true)
    await dayNamed(wrapper, 'Thursday, 17 September 2026').trigger('click')

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['2026-09-17'])
    expect(wrapper.find('[role="grid"]').exists()).toBe(false)
  })

  it('takes a preset in one press, built when it is pressed', async () => {
    const wrapper = build({
      mode: 'range',
      presets: [{ label: 'Son 7 gün', value: () => ({ start: '2026-09-11', end: '2026-09-17' }) }],
    })
    await wrapper.find('.rk-date-field').trigger('click')
    await nextTick()

    await wrapper.find('.rk-date-preset').trigger('click')

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([
      { start: '2026-09-11', end: '2026-09-17' },
    ])
    expect(wrapper.find('[role="grid"]').exists()).toBe(false)
  })

  it('empties itself from a button that is beside the field, not inside it', async () => {
    const wrapper = build({ modelValue: '2026-09-17', clearLabel: 'Temizle' })
    const clear = wrapper.find('[aria-label="Temizle"]')

    // A button inside a button is not a control a browser can make sense of.
    expect(clear.element.closest('button')).toBe(clear.element)

    await clear.trigger('click')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([undefined])
  })
})
