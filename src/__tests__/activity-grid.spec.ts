import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import ActivityGrid from '../components/ActivityGrid.vue'

/**
 * The two things that make this different from a div soup.
 *
 * It is a real table, so the DOM order is the picture's order — weekdays
 * down, weeks across — and it is one tab stop rather than one per day,
 * because a year of presses to get past a picture is not a keyboard story.
 */
const DAYS = Array.from({ length: 30 }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`)

const mountGrid = (props: Record<string, unknown> = {}) =>
  mount(ActivityGrid, {
    props: {
      days: DAYS,
      label: 'Yılın',
      levelFor: () => 'bg-primary',
      dayLabel: (key: string) => `${key} günü`,
      ...props,
    },
    attachTo: document.body,
  })

/*
 * jsdom has no layout, so a scrolling box has no width to be past. The
 * opening scroll position is arithmetic on `scrollWidth`, so `scrollWidth`
 * is what is supplied — the sign of the result is the whole assertion, and
 * the sign does not need a real layout to be wrong.
 */
const SCROLL_WIDTH = 900

function withWidth() {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: () => SCROLL_WIDTH,
  })
}

afterEach(() => {
  delete (HTMLElement.prototype as unknown as Record<string, unknown>)['scrollWidth']
  document.documentElement.removeAttribute('dir')
  document.body.innerHTML = ''
})

describe('ActivityGrid', () => {
  it('opens on the most recent weeks', () => {
    withWidth()

    const viewport = mountGrid().get('.rk-scroll-viewport').element

    expect(viewport.scrollLeft).toBe(SCROLL_WIDTH)
  })

  /*
   * The half that is only ever wrong in the direction nobody runs. A
   * right-to-left box counts `scrollLeft` down from zero, so assigning
   * `scrollWidth` clamps to zero — which is the oldest week, the one thing
   * `startAtEnd` exists to avoid.
   */
  it('opens on the most recent weeks in a right-to-left page too', () => {
    withWidth()
    document.documentElement.setAttribute('dir', 'rtl')

    const viewport = mountGrid().get('.rk-scroll-viewport').element

    expect(viewport.scrollLeft).toBe(-SCROLL_WIDTH)
  })

  it('stays where it is when it is told not to', () => {
    withWidth()

    const viewport = mountGrid({ startAtEnd: false }).get('.rk-scroll-viewport')

    expect(viewport.element.scrollLeft).toBe(0)
  })

  it('lays weekdays down and weeks across, as a table', () => {
    const rows = mountGrid().findAll('tbody tr')

    // Seven rows whatever the range is: a week has seven days.
    expect(rows).toHaveLength(7)
  })

  it('gives every row the same number of cells', () => {
    const counts = mountGrid()
      .findAll('tbody tr')
      .map((row) => row.findAll('td').length)

    // The padding at either end is empty cells rather than missing ones: a
    // row shorter than the one above it stops being a table.
    expect(new Set(counts).size).toBe(1)
  })

  it('draws every day it was given, once', () => {
    const drawn = mountGrid()
      .findAll('[data-day]')
      .map((cell) => cell.attributes('data-day'))

    expect(drawn).toHaveLength(DAYS.length)
    expect(new Set(drawn).size).toBe(DAYS.length)
  })

  it('is one stop in the tab order, not three hundred and sixty-five', () => {
    const wrapper = mountGrid()

    expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1)
    expect(wrapper.findAll('[tabindex="-1"]').length).toBe(DAYS.length - 1)
  })

  it('moves a day at a time down the week, and a week at a time across', async () => {
    const wrapper = mountGrid()
    const here = () => wrapper.get('[tabindex="0"]').attributes('data-day')

    const first = here()!
    await wrapper.get('table').trigger('keydown', { key: 'ArrowDown' })
    expect(here()).not.toBe(first)

    // Right is the same weekday, seven days on.
    const second = here()!
    await wrapper.get('table').trigger('keydown', { key: 'ArrowRight' })
    const third = here()!

    expect(Number(third.slice(-2)) - Number(second.slice(-2))).toBe(7)
  })

  it('goes to the ends with Home and End', async () => {
    const wrapper = mountGrid()

    await wrapper.get('table').trigger('keydown', { key: 'End' })
    expect(wrapper.get('[tabindex="0"]').attributes('data-day')).toBe(DAYS.at(-1))

    await wrapper.get('table').trigger('keydown', { key: 'Home' })
    expect(wrapper.get('[tabindex="0"]').attributes('data-day')).toBe(DAYS[0])
  })

  it('says what a day was, in the app words', () => {
    const cell = mountGrid().get(`[data-day="${DAYS[0]}"]`)

    expect(cell.attributes('aria-label')).toBe(`${DAYS[0]} günü`)
    expect(cell.classes()).toContain('bg-primary')
  })

  it('is a picture and nothing else until the app says which days lead somewhere', async () => {
    const wrapper = mountGrid()

    await wrapper.get(`[data-day="${DAYS[3]}"]`).trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('chooses a day by pointer and by Enter, but only a selectable one', async () => {
    const wrapper = mountGrid({ isSelectable: (key: string) => key === DAYS[3] })

    await wrapper.get(`[data-day="${DAYS[4]}"]`).trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()

    await wrapper.get(`[data-day="${DAYS[3]}"]`).trigger('click')
    expect(wrapper.emitted('select')!.at(-1)).toEqual([DAYS[3]])

    await wrapper.get('table').trigger('keydown', { key: 'Enter' })
    // The pointer moved the keyboard too, so Enter lands on the same day.
    expect(wrapper.emitted('select')!.at(-1)).toEqual([DAYS[3]])
  })
})
