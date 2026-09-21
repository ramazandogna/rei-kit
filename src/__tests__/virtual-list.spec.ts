import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import VirtualList from '../components/VirtualList.vue'

/**
 * jsdom lays nothing out, so the viewport measures zero and the window is
 * whatever the overscan gives it. That is fine for what is under test here:
 * the arithmetic, and the two attributes that decide whether a windowed
 * list is one list or a different list on every scroll.
 */
const ROWS = Array.from({ length: 1000 }, (_, index) => ({ id: index, name: `Row ${index}` }))

function mountList(items: readonly { id: number; name: string }[], props = {}) {
  return mount(VirtualList, {
    props: { items, rowHeight: 20, label: 'Bütün kayıtlar', ...props },
    slots: { default: '<span>{{ params.item.name }}</span>' },
    attachTo: document.body,
  })
}

const rows = (wrapper: ReturnType<typeof mountList>) => wrapper.findAll('.rk-vlist-row')

const scrollTo = (wrapper: ReturnType<typeof mountList>, index: number) =>
  (wrapper.vm as unknown as { scrollToIndex: (i: number) => void }).scrollToIndex(index)

describe('VirtualList', () => {
  it('renders a window rather than the whole list', () => {
    const wrapper = mountList(ROWS)

    expect(rows(wrapper).length).toBeGreaterThan(0)
    expect(rows(wrapper).length).toBeLessThan(ROWS.length)
  })

  it('tells every row its place in the whole list, not in the window', async () => {
    const wrapper = mountList(ROWS)
    const scroller = wrapper.get('.rk-scroll-viewport')

    scroller.element.scrollTop = 20 * 400
    await scroller.trigger('scroll')
    await nextTick()

    const first = rows(wrapper)[0]!

    // Without these two the list reads as however many rows happen to be
    // rendered, and as a different list after every scroll.
    expect(first.attributes('aria-setsize')).toBe('1000')
    expect(Number(first.attributes('aria-posinset'))).toBeGreaterThan(1)
  })

  it('stands the rows it left out up as height, so the scrollbar is honest', async () => {
    const wrapper = mountList(ROWS)
    const scroller = wrapper.get('.rk-scroll-viewport')

    scroller.element.scrollTop = 20 * 400
    await scroller.trigger('scroll')
    await nextTick()

    const spacers = wrapper.findAll('li[aria-hidden="true"]')
    const total =
      spacers.reduce(
        (sum, li) => sum + Number.parseInt(li.attributes('style')!.match(/\d+/)![0]),
        0,
      ) +
      rows(wrapper).length * 20

    // Every row is accounted for: the ones on screen, plus the empty space
    // standing in for the rest.
    expect(total).toBe(ROWS.length * 20)
  })

  it('is a plain list below the threshold, with no padding at all', () => {
    const wrapper = mountList(ROWS.slice(0, 10))

    expect(rows(wrapper)).toHaveLength(10)
    expect(wrapper.findAll('li[aria-hidden="true"]')).toHaveLength(0)
  })

  it('windows a short list once the app lowers the threshold', () => {
    const wrapper = mountList(ROWS.slice(0, 40), { virtualizeAfter: 5 })

    expect(rows(wrapper).length).toBeLessThan(40)
    expect(wrapper.findAll('li[aria-hidden="true"]').length).toBeGreaterThan(0)
  })

  it('hands the row back typed, with its real index', () => {
    const wrapper = mountList(ROWS.slice(0, 5))

    expect(wrapper.text()).toContain('Row 0')
    expect(rows(wrapper)[4]!.attributes('aria-posinset')).toBe('5')
  })

  it('scrolls a row into view, by the least it can', () => {
    const wrapper = mountList(ROWS)
    const scroller = wrapper.get('.rk-scroll-viewport').element
    // jsdom measures every box at zero, and this one's height is the whole
    // question: "into view" means nothing without it.
    Object.defineProperty(scroller, 'clientHeight', { value: 200, configurable: true })

    scrollTo(wrapper, 500)

    // Row 500 ends at 10020, so the least scroll that shows it puts its
    // bottom edge at the bottom of the box rather than jumping it to the top.
    expect(scroller.scrollTop).toBe(10_020 - 200)
  })

  it('leaves a row alone when it is already on screen', () => {
    const wrapper = mountList(ROWS)
    const scroller = wrapper.get('.rk-scroll-viewport').element
    Object.defineProperty(scroller, 'clientHeight', { value: 200, configurable: true })
    scroller.scrollTop = 100

    scrollTo(wrapper, 6) // 120–140, inside 100–300.

    expect(scroller.scrollTop).toBe(100)
  })

  it('clamps a row index that is off the end rather than scrolling past it', () => {
    const wrapper = mountList(ROWS)
    const scroller = wrapper.get('.rk-scroll-viewport').element
    Object.defineProperty(scroller, 'clientHeight', { value: 200, configurable: true })

    scrollTo(wrapper, 99_999)

    // The bottom of the list, not somewhere past the end of it.
    expect(scroller.scrollTop).toBe(ROWS.length * 20 - 200)
  })

  it('names the list, because a scrolling box of rows is otherwise nothing', () => {
    const wrapper = mountList(ROWS)

    expect(wrapper.get('ul').attributes('aria-label')).toBe('Bütün kayıtlar')
  })
})
