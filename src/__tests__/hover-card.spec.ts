import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import BaseHoverCard from '../web/BaseHoverCard.vue'

/**
 * The delays are the component.
 *
 * Without them this is two CSS rules, and with them wrong it is a card
 * whose contents can never be used — the pointer crosses the gap, the card
 * closes, and nothing inside was ever reachable. So most of this is about
 * timing, which is why it runs on fake timers: a test that waited real
 * milliseconds would be slow and would still pass with the delays removed.
 */
const SLOTS = {
  default:
    '<template #default="{ props }"><button type="button" v-bind="props">@who</button></template>',
  card: '<a href="#somewhere">A link inside</a>',
}

const mountCard = (props: Record<string, unknown> = {}) =>
  mount(BaseHoverCard, {
    props: { label: 'Kart', ...props },
    attachTo: document.body,
    slots: SLOTS,
  })

const panel = () => document.querySelector('.rk-hovercard-panel')

beforeEach(() => vi.useFakeTimers())

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('BaseHoverCard', () => {
  it('waits before opening, rather than firing at a pointer passing over', async () => {
    const wrapper = mountCard({ openDelay: 300 })

    await wrapper.trigger('pointerenter')
    expect(panel()).toBeNull()

    vi.advanceTimersByTime(299)
    await wrapper.vm.$nextTick()
    expect(panel()).toBeNull()

    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()
    expect(panel()).not.toBeNull()
  })

  it('never opens for a pointer that only passed through', async () => {
    const wrapper = mountCard({ openDelay: 300 })

    await wrapper.trigger('pointerenter')
    vi.advanceTimersByTime(100)
    await wrapper.trigger('pointerleave')
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()

    expect(panel()).toBeNull()
  })

  it('survives the pointer leaving, so the card can be reached at all', async () => {
    const wrapper = mountCard({ openDelay: 0, closeDelay: 200 })

    await wrapper.trigger('pointerenter')
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()
    expect(panel()).not.toBeNull()

    await wrapper.trigger('pointerleave')
    vi.advanceTimersByTime(150)
    await wrapper.vm.$nextTick()
    // Still there: this is the window in which the pointer crosses the gap.
    expect(panel()).not.toBeNull()

    await wrapper.trigger('pointerenter')
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    // Coming back cancelled the close rather than queueing behind it.
    expect(panel()).not.toBeNull()
  })

  it('closes once the pointer has really gone', async () => {
    const wrapper = mountCard({ openDelay: 0, closeDelay: 200 })

    await wrapper.trigger('pointerenter')
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    await wrapper.trigger('pointerleave')
    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()
    expect(panel()).toBeNull()
  })

  it('opens on focus with no wait, because that was deliberate', async () => {
    const wrapper = mountCard({ openDelay: 5000 })

    await wrapper.trigger('focusin')
    await wrapper.vm.$nextTick()

    // No timer advanced: waiting suits a pointer sweeping a page and makes
    // no sense for somebody who tabbed onto it.
    expect(panel()).not.toBeNull()
  })

  it('says a popup is there, on the app own element', async () => {
    const wrapper = mountCard({ openDelay: 0 })
    const trigger = wrapper.get('button')

    expect(trigger.attributes('aria-expanded')).toBe('false')

    await wrapper.trigger('focusin')
    await wrapper.vm.$nextTick()

    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(trigger.attributes('aria-controls')).toBe(panel()!.id)
  })

  it('holds a real link, not a description flattened to text', async () => {
    const wrapper = mountCard({ openDelay: 0 })

    await wrapper.trigger('focusin')
    await wrapper.vm.$nextTick()

    // aria-describedby would have made this string and nothing more.
    expect(panel()!.querySelector('a')).not.toBeNull()
    expect(wrapper.get('button').attributes('aria-describedby')).toBeUndefined()
  })

  it('closes on Escape and leaves focus alone', async () => {
    const wrapper = mountCard({ openDelay: 0 })

    await wrapper.trigger('focusin')
    await wrapper.vm.$nextTick()

    const trigger = wrapper.get('button').element
    trigger.focus()
    await wrapper.trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()

    expect(panel()).toBeNull()
    // Moving focus as well would take the reader somewhere they did not ask
    // to go; this only gets a card out of the way.
    expect(document.activeElement).toBe(trigger)
  })

  it('does not fire a timer at a component that has gone', async () => {
    const wrapper = mountCard({ openDelay: 300 })

    await wrapper.trigger('pointerenter')
    expect(vi.getTimerCount()).toBe(1)

    wrapper.unmount()
    // Not "it does not throw": that passes with the cleanup deleted.
    expect(vi.getTimerCount()).toBe(0)
  })
})
