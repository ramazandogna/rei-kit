import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import BaseDrawer from '../web/BaseDrawer.vue'

/**
 * A drawer is a dialog that happens to arrive from the side.
 *
 * What is worth pinning is the part that is easy to get nearly right, and
 * that a type-check cannot see: that it is announced as a dialog, that
 * Escape is refused when the app said the answer matters, that the page
 * behind goes inert and stops scrolling, and that focus goes back to
 * whatever opened it rather than onto the body.
 */
const mountDrawer = (props: Record<string, unknown> = {}) =>
  mount(BaseDrawer, {
    props: { modelValue: true, title: 'Filtreler', closeLabel: 'Kapat', ...props },
    attachTo: document.body,
    slots: { default: '<button type="button">İçeride</button>' },
  })

/* The drawer teleports to `body`, so the wrapper does not contain it: the
   events have to be sent to the real nodes. */
const scrim = () => document.querySelector('.rk-drawer-scrim')!

const press = async (key: string, shiftKey = false) => {
  scrim().dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }))
  await nextTick()
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('BaseDrawer', () => {
  it('is a dialog with a name, not just a box', () => {
    mountDrawer()
    const panel = document.querySelector('[role="dialog"]')

    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(panel?.getAttribute('aria-label')).toBe('Filtreler')
  })

  it('comes from the end edge unless told otherwise', () => {
    mountDrawer()
    expect(document.querySelector('.rk-drawer-panel')?.classList).toContain('is-end')

    document.body.innerHTML = ''
    mountDrawer({ side: 'start' })
    expect(document.querySelector('.rk-drawer-panel')?.classList).toContain('is-start')
  })

  it('reaches in by its own size, and never by both measures at once', () => {
    mountDrawer({ side: 'end', size: '30rem' })
    const sideways = document.querySelector<HTMLElement>('.rk-drawer-panel')!

    expect(sideways.style.width).toBe('30rem')
    // A drawer that also set a height could not fill the edge it came from.
    expect(sideways.style.height).toBe('')

    document.body.innerHTML = ''
    mountDrawer({ side: 'top', size: '12rem' })
    const upright = document.querySelector<HTMLElement>('.rk-drawer-panel')!

    expect(upright.style.height).toBe('12rem')
    expect(upright.style.width).toBe('')
  })

  it('stops the page behind it scrolling, and gives it back', async () => {
    const wrapper = mount(BaseDrawer, {
      props: { modelValue: false, title: 'Filtreler', closeLabel: 'Kapat' },
      attachTo: document.body,
    })

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ modelValue: false })
    await nextTick()
    expect(document.body.style.overflow).toBe('')
  })

  it('leaves the page usable when it is torn down while open', async () => {
    const wrapper = mount(BaseDrawer, {
      props: { modelValue: false, title: 'Filtreler', closeLabel: 'Kapat' },
      attachTo: document.body,
    })

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    wrapper.unmount()

    // Otherwise the page stays unscrollable with nothing on screen to
    // explain why.
    expect(document.body.style.overflow).toBe('')
  })

  it('refuses Escape when the app said the answer matters', async () => {
    const wrapper = mountDrawer({ dismissible: false })

    await press('Escape')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    // And there is no close button to press instead, which is the point.
    expect(document.querySelector('.rk-drawer-head button')).toBeNull()
  })

  it('closes on Escape, and on the veil, when it is dismissible', async () => {
    const wrapper = mountDrawer()

    await press('Escape')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([false])

    document.body.innerHTML = ''
    const veil = mountDrawer()
    document.querySelector<HTMLElement>('.rk-drawer-veil')!.click()
    await nextTick()
    expect(veil.emitted('update:modelValue')!.at(-1)).toEqual([false])
  })

  it('keeps Tab inside, wrapping at both ends', async () => {
    mountDrawer()
    await nextTick()

    const inside = document.querySelectorAll<HTMLElement>('.rk-drawer-panel button')
    const first = inside[0]!
    const last = inside[inside.length - 1]!

    last.focus()
    await press('Tab')
    expect(document.activeElement).toBe(first)

    first.focus()
    await press('Tab', true)
    expect(document.activeElement).toBe(last)
  })

  it('hands focus back to whatever opened it', async () => {
    const opener = document.createElement('button')
    document.body.append(opener)
    opener.focus()

    const wrapper = mount(BaseDrawer, {
      props: { modelValue: false, title: 'Filtreler', closeLabel: 'Kapat' },
      attachTo: document.body,
    })

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(document.activeElement).not.toBe(opener)

    await wrapper.setProps({ modelValue: false })
    await nextTick()
    // Released before focus is handed back: an inert element cannot take it.
    expect(document.activeElement).toBe(opener)
  })
})
