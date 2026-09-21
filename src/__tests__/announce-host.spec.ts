import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import AnnounceHost from '../components/AnnounceHost.vue'
import { announce, useAnnounce } from '../composables/use-announce'

/**
 * Every assertion here is about a way a live region fails silently. None of
 * them show up on screen, and none of them throw.
 */
function mountAnnounceHost() {
  return mount(AnnounceHost, { attachTo: document.body })
}

const politeText = (wrapper: ReturnType<typeof mountAnnounceHost>) =>
  wrapper.get('[aria-live="polite"]').text()
const assertiveText = (wrapper: ReturnType<typeof mountAnnounceHost>) =>
  wrapper.get('[aria-live="assertive"]').text()

afterEach(async () => {
  vi.useRealTimers()
  // Leaves the module-scope store empty for the next test.
  announce('')
  await nextTick()
})

describe('AnnounceHost', () => {
  it('renders both regions empty, before there is anything to say', () => {
    const wrapper = mountAnnounceHost()

    // The region has to exist before the text lands in it. A region inserted
    // together with its first message is usually not announced at all.
    expect(wrapper.get('[aria-live="polite"]').exists()).toBe(true)
    expect(wrapper.get('[aria-live="assertive"]').exists()).toBe(true)
    expect(politeText(wrapper)).toBe('')
  })

  it('says something politely by default', async () => {
    const wrapper = mountAnnounceHost()

    announce('3 sonuç')
    await nextTick()
    await nextTick()

    expect(politeText(wrapper)).toBe('3 sonuç')
    expect(assertiveText(wrapper)).toBe('')
  })

  it('interrupts only when asked', async () => {
    const wrapper = mountAnnounceHost()

    announce('Bağlantı koptu', { assertive: true })
    await nextTick()
    await nextTick()

    expect(assertiveText(wrapper)).toBe('Bağlantı koptu')
    expect(politeText(wrapper)).toBe('')
  })

  it('says the same sentence again, because the second time is not a change', async () => {
    const wrapper = mountAnnounceHost()

    announce('3 sonuç')
    await nextTick()
    await nextTick()

    announce('3 sonuç')
    await nextTick()
    // Cleared first: a reader announces changes, and setting an identical
    // string is not one. Without this the second filter is silence.
    expect(politeText(wrapper)).toBe('')

    await nextTick()
    expect(politeText(wrapper)).toBe('3 sonuç')
  })

  it('does not leave a stale sentence behind for a reader who arrives later', async () => {
    vi.useFakeTimers()
    const wrapper = mountAnnounceHost()

    announce('Kaydedildi')
    await nextTick()
    await nextTick()
    expect(politeText(wrapper)).toBe('Kaydedildi')

    vi.advanceTimersByTime(7001)
    await nextTick()

    expect(politeText(wrapper)).toBe('')
  })

  it('a second message cancels the first one clearing itself', async () => {
    vi.useFakeTimers()
    const wrapper = mountAnnounceHost()

    announce('Bir')
    await nextTick()
    await nextTick()

    vi.advanceTimersByTime(6000)
    announce('İki')
    await nextTick()
    await nextTick()

    // The first message's timer would land here; it must not wipe the second.
    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(politeText(wrapper)).toBe('İki')
  })

  it('switching urgency clears the other region rather than saying both', async () => {
    const wrapper = mountAnnounceHost()

    announce('Kaydedildi')
    await nextTick()
    await nextTick()

    announce('Bağlantı koptu', { assertive: true })
    await nextTick()
    await nextTick()

    expect(assertiveText(wrapper)).toBe('Bağlantı koptu')
    expect(politeText(wrapper)).toBe('')
  })

  it('is one store, so two calls from anywhere reach the one region', async () => {
    const wrapper = mountAnnounceHost()
    const { announce: fromComposable, polite } = useAnnounce()

    fromComposable('Merhaba')
    await nextTick()
    await nextTick()

    expect(politeText(wrapper)).toBe('Merhaba')
    expect(polite.value).toBe('Merhaba')
  })

  it('is never visible, whatever it is saying', async () => {
    const wrapper = mountAnnounceHost()

    announce('Kaydedildi')
    await nextTick()
    await nextTick()

    // Clipped, not `display: none`: a hidden live region is not read at all.
    expect(wrapper.get('div').classes()).toContain('rk-announcer')
    expect(wrapper.get('div').attributes('aria-hidden')).toBeUndefined()
  })
})
