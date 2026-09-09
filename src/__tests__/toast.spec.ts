import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import { ToastHost, useToast } from '../index'

/**
 * The mechanism three apps did not have.
 *
 * "toast" appeared zero times across all of them — not because they had
 * decided against it, but because there was nothing to reach for, so every
 * save, delete and export finished in silence.
 *
 * What is pinned here is the part that fails quietly: a stack that grows off
 * the screen, a message taken away while it is being read, and a timer that
 * outlives the page.
 */
const host = () => mount(ToastHost, { props: { closeLabel: 'Kapat' } })

afterEach(() => {
  useToast().dismissAll()
  vi.useRealTimers()
})

describe('useToast', () => {
  it('shows what it was given and nothing of its own', () => {
    // The kit never knows a sentence: a component that called a translator
    // would force one on the app.
    const toast = useToast()
    toast.success('Alışkanlık kaydedildi')

    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]!.message).toBe('Alışkanlık kaydedildi')
    expect(toast.toasts.value[0]!.tone).toBe('success')
  })

  it('drops the oldest rather than growing off the screen', () => {
    // An action that produces ten toasts is a loop, and a loop must not be
    // able to cover the app it is running in.
    const toast = useToast()
    for (const n of [1, 2, 3, 4]) toast.info(`bildirim ${n}`)

    expect(toast.toasts.value).toHaveLength(3)
    expect(toast.toasts.value[0]!.message).toBe('bildirim 2')
  })

  it('leaves a failure up longer than a confirmation', () => {
    // A failure is read more slowly, and more often twice.
    const toast = useToast()
    const okId = toast.success('kaydedildi')
    const badId = toast.danger('kaydedilemedi')

    const find = (id: number) => toast.toasts.value.find((t) => t.id === id)!

    expect(find(badId).duration).toBeGreaterThan(find(okId).duration)
  })

  it('stays for good when asked to', () => {
    vi.useFakeTimers()
    const toast = useToast()
    toast.info('dışa aktarılıyor', { duration: 0 })

    vi.advanceTimersByTime(60_000)

    expect(toast.toasts.value).toHaveLength(1)
  })

  it('takes itself away when its time is up', () => {
    vi.useFakeTimers()
    const toast = useToast()
    toast.success('kaydedildi', { duration: 1000 })

    vi.advanceTimersByTime(1001)

    expect(toast.toasts.value).toHaveLength(0)
  })

  it('stops the clock while it is being read, and resumes where it stopped', () => {
    // Somebody pointing at it is reading it, and taking it away mid-sentence
    // is the one thing a notification must not do.
    vi.useFakeTimers()
    const toast = useToast()
    const id = toast.info('kaydedildi', { duration: 1000 })

    vi.advanceTimersByTime(600)
    toast.pause(id)
    vi.advanceTimersByTime(60_000)

    expect(toast.toasts.value).toHaveLength(1)

    toast.resume(id)
    // 400ms left, not a fresh 1000.
    vi.advanceTimersByTime(401)

    expect(toast.toasts.value).toHaveLength(0)
  })
})

describe('ToastHost', () => {
  it('announces politely rather than interrupting', async () => {
    // A toast reports something that already happened. Interrupting a screen
    // reader mid-sentence to say "saved" is ruder than waiting; a failure the
    // reader must act on belongs in a BaseAlert beside what failed.
    const wrapper = host()
    await flushPromises()

    const region = document.querySelector('[role="status"]')

    expect(region?.getAttribute('aria-live')).toBe('polite')
    wrapper.unmount()
  })

  it('gives every dismiss button a name the kit did not invent', async () => {
    const wrapper = host()
    useToast().info('kaydedildi')
    await flushPromises()

    const close = document.querySelector('[aria-label="Kapat"]')

    expect(close).not.toBeNull()
    wrapper.unmount()
  })
})
