import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import {
  BaseMarquee,
  BaseReveal,
  CountUp,
  NumberTicker,
  TextRotate,
  TypeWriter,
} from '../motion/index'

/**
 * rei-kit/motion.
 *
 * Each part is tested twice over: moving, and still. jsdom has no
 * `matchMedia`, which the parts read as "do not move" — the same answer a
 * server gets — so a bare mount is the still case, and `allowMotion` stubs a
 * reader who has not asked for less.
 */

function allowMotion() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

/** Hands the test the callback an IntersectionObserver would call. */
function stubVisibility() {
  type Callback = (entries: { isIntersecting: boolean }[]) => void
  const seen = new Set<Callback>()

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      callback: Callback
      constructor(callback: Callback) {
        this.callback = callback
      }
      observe() {
        seen.add(this.callback)
      }
      disconnect() {
        seen.delete(this.callback)
      }
    },
  )

  return (isIntersecting: boolean) => {
    for (const callback of seen) callback([{ isIntersecting }])
  }
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
    ],
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const digits = (wrapper: ReturnType<typeof mount>) =>
  wrapper
    .findAll('.rk-ticker-strip')
    .map(
      (strip) =>
        Math.abs(Number(/translateY\((-?\d+)%\)/.exec(strip.attributes('style') ?? '')![1])) / 10,
    )

describe('NumberTicker', () => {
  it('rolls each digit to its place, and reads the value once', () => {
    const wrapper = mount(NumberTicker, { props: { value: 1234, locale: 'en-GB' } })

    expect(digits(wrapper)).toEqual([1, 2, 3, 4])
    expect(wrapper.find('.sr-only').text()).toBe('1,234')
    expect(wrapper.find('.rk-ticker-track').attributes('aria-hidden')).toBe('true')
  })

  it('keeps the units column the units column when a digit is added', async () => {
    const wrapper = mount(NumberTicker, { props: { value: 999, locale: 'en-GB' } })
    const units = wrapper.findAll('.rk-ticker-strip').at(-1)!.element

    await wrapper.setProps({ value: 1000 })

    // The same element, moved: that is what lets it roll instead of appear.
    expect(wrapper.findAll('.rk-ticker-strip').at(-1)!.element).toBe(units)
    expect(digits(wrapper)).toEqual([1, 0, 0, 0])
  })

  it('formats in the locale it is given', () => {
    const wrapper = mount(NumberTicker, {
      props: {
        value: 48200,
        locale: 'tr-TR',
        format: { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 },
      },
    })

    expect(wrapper.find('.sr-only').text()).toBe('₺48.200')
    expect(wrapper.findAll('.rk-ticker-char').map((c) => c.text())).toEqual(['₺', '.'])
  })

  it('starts from `from` and rolls to the value after it has painted', async () => {
    const wrapper = mount(NumberTicker, { props: { value: 42, from: 0, locale: 'en-GB' } })
    expect(digits(wrapper)).toEqual([0])

    vi.advanceTimersByTime(40)
    await nextTick()

    expect(digits(wrapper)).toEqual([4, 2])
    expect(wrapper.find('.sr-only').text()).toBe('42')
  })
})

describe('CountUp', () => {
  it('is the value at once for a reader who asked for less motion', () => {
    const wrapper = mount(CountUp, { props: { value: 1500, locale: 'en-GB' } })

    expect(wrapper.find('[aria-hidden="true"]').text()).toBe('1,500')
  })

  it('counts from `from` once it is on screen, and eases to the value', async () => {
    allowMotion()
    const show = stubVisibility()
    const wrapper = mount(CountUp, {
      props: { value: 100, from: 0, duration: 1000, locale: 'en-GB' },
    })
    const shown = () => wrapper.find('[aria-hidden="true"]').text()

    await nextTick()
    expect(shown()).toBe('0')

    // Off screen, nothing moves.
    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(shown()).toBe('0')

    show(true)
    vi.advanceTimersByTime(500)
    await nextTick()
    // A whole number counts in whole numbers: no "71.843" on the way to 100.
    expect(shown()).toMatch(/^\d+$/)
    const halfway = Number(shown())
    // Ease-out: well past the halfway value at the halfway time.
    expect(halfway).toBeGreaterThan(70)
    expect(halfway).toBeLessThan(100)

    vi.advanceTimersByTime(600)
    await nextTick()
    expect(shown()).toBe('100')
    expect(wrapper.find('.sr-only').text()).toBe('100')
  })
})

describe('CountUp, in decimals', () => {
  it('counts with as many decimals as the value has', async () => {
    allowMotion()
    const show = stubVisibility()
    const wrapper = mount(CountUp, { props: { value: 99.9, duration: 1000, locale: 'en-GB' } })
    const shown = () => wrapper.find('[aria-hidden="true"]').text()

    show(true)
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(shown()).toMatch(/^\d+\.\d$|^\d+$/)
  })
})

describe('TextRotate', () => {
  const words = ['glass', 'brutal', 'soft']

  it('keeps the first word for a reader who asked for less motion', async () => {
    const wrapper = mount(TextRotate, { props: { words } })

    vi.advanceTimersByTime(10_000)
    await nextTick()

    expect(wrapper.text()).toBe('glass')
  })

  it('moves to the next word each interval, and wraps', async () => {
    allowMotion()
    const wrapper = mount(TextRotate, { props: { words, interval: 1000 } })

    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(wrapper.text()).toBe('brutal')

    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(wrapper.text()).toBe('glass')
  })

  it('stops while hovered, and when paused', async () => {
    allowMotion()
    const wrapper = mount(TextRotate, { props: { words, interval: 1000 } })

    await wrapper.trigger('mouseenter')
    vi.advanceTimersByTime(3000)
    await nextTick()
    expect(wrapper.text()).toBe('glass')

    await wrapper.trigger('mouseleave')
    await wrapper.setProps({ paused: true })
    vi.advanceTimersByTime(3000)
    await nextTick()
    expect(wrapper.text()).toBe('glass')
  })
})

describe('TypeWriter', () => {
  it('is the whole first line for a reader who asked for less motion', () => {
    const wrapper = mount(TypeWriter, { props: { text: ['Build it once.', 'Ship it.'] } })

    expect(wrapper.find('[aria-hidden="true"]').text()).toBe('Build it once.')
  })

  it('types, holds, deletes and types the next line', async () => {
    allowMotion()
    const wrapper = mount(TypeWriter, {
      props: { text: ['Hi', 'Yo'], speed: 100, deleteSpeed: 50, hold: 500, cursor: false },
    })
    const typed = () => wrapper.find('[aria-hidden="true"]').text()

    await nextTick()
    expect(typed()).toBe('')

    vi.advanceTimersByTime(100)
    await nextTick()
    expect(typed()).toBe('H')
    // A screen reader hears the line, not the half of it on screen.
    expect(wrapper.find('.sr-only').text()).toBe('Hi')

    vi.advanceTimersByTime(100 + 100 + 500 + 50 + 50 + 50)
    await nextTick()
    expect(typed()).toBe('')

    vi.advanceTimersByTime(100 + 100)
    await nextTick()
    expect(typed()).toBe('Yo')
  })

  it('types a single line once and stays', async () => {
    allowMotion()
    const wrapper = mount(TypeWriter, { props: { text: 'Done', speed: 10 } })

    vi.advanceTimersByTime(10_000)
    await nextTick()

    expect(wrapper.find('[aria-hidden="true"]').text()).toBe('Done')
    expect(wrapper.find('.rk-type-cursor').exists()).toBe(true)
  })
})

describe('BaseReveal', () => {
  it('is never hidden for a reader who asked for less motion', async () => {
    stubVisibility()
    const wrapper = mount(BaseReveal, { slots: { default: 'Hello' } })
    await nextTick()

    expect(wrapper.classes()).not.toContain('is-hidden')
  })

  it('hides below the fold and arrives when scrolled to', async () => {
    allowMotion()
    const show = stubVisibility()
    const wrapper = mount(BaseReveal, {
      props: { effect: 'scale', delay: 120, as: 'li' },
      slots: { default: 'Hello' },
    })

    show(false)
    await nextTick()
    expect(wrapper.element.tagName).toBe('LI')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['rk-reveal-scale', 'is-hidden']))
    expect(wrapper.attributes('style')).toContain('--rk-reveal-delay: 120ms')

    show(true)
    vi.advanceTimersByTime(20)
    await nextTick()
    expect(wrapper.classes()).not.toContain('is-hidden')

    // Once, by default: leaving again does not hide it.
    show(false)
    await nextTick()
    expect(wrapper.classes()).not.toContain('is-hidden')
  })

  it('arrives even when it mounts already on screen', async () => {
    // A re-mounted list — a replay — used to show at once, as if nothing
    // had happened. It is hidden for a painted frame, then revealed.
    allowMotion()
    const show = stubVisibility()
    const wrapper = mount(BaseReveal, { slots: { default: 'Hello' } })
    await nextTick()
    expect(wrapper.classes()).toContain('is-hidden')

    show(true)
    await nextTick()
    expect(wrapper.classes()).toContain('is-hidden')

    vi.advanceTimersByTime(20)
    await nextTick()
    expect(wrapper.classes()).not.toContain('is-hidden')
  })
})

describe('BaseMarquee', () => {
  it('renders its items twice, the second copy out of reach', () => {
    const wrapper = mount(BaseMarquee, {
      props: { duration: 12, gap: '3rem', paused: true },
      slots: { default: '<a href="/a">A</a>' },
    })
    const groups = wrapper.findAll('.rk-marquee-group')

    expect(groups).toHaveLength(2)
    expect(groups[0]!.attributes('aria-hidden')).toBeUndefined()
    expect(groups[1]!.attributes('aria-hidden')).toBe('true')
    expect(groups[1]!.attributes()).toHaveProperty('inert')
    expect(wrapper.classes()).toContain('is-paused')
    expect(wrapper.attributes('style')).toContain('--rk-marquee-duration: 12s')
    expect(wrapper.attributes('style')).toContain('--rk-marquee-gap: 3rem')
  })
})
