import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import BaseContextMenu from '../web/BaseContextMenu.vue'

/**
 * A right-click menu is easy to ship broken, because the half that breaks
 * has no mouse in it.
 *
 * So the keyboard half is what most of this pins: Shift+F10 and the Menu
 * key open it, the arrows move, Escape closes, and Tab leaves rather than
 * cycling. A menu missing those is a set of actions that simply do not
 * exist for some readers, and nothing on screen says so.
 */
const ITEMS = `
  <button type="button" role="menuitem">Rename</button>
  <button type="button" role="menuitem">Duplicate</button>
  <button type="button" role="menuitem">Delete</button>
`

/* Unmounted properly rather than by clearing `body`: the panel is
   teleported, and wiping the body out from under a mounted component takes
   Vue's own anchors with it. The next render then dies on `insertBefore`,
   in a different test, which reads as that test being broken. */
const mounted: ReturnType<typeof mount>[] = []

const mountMenu = (props: Record<string, unknown> = {}) => {
  const wrapper = mount(BaseContextMenu, {
    props: { label: 'Satır işlemleri', ...props },
    attachTo: document.body,
    slots: { default: '<div id="row" tabindex="0">Satır</div>', items: ITEMS },
  })
  mounted.push(wrapper)

  return wrapper
}

const panel = () => document.querySelector('.rk-ctx-panel')
const menuItems = () => Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'))

const rightClick = async (wrapper: ReturnType<typeof mountMenu>, x = 10, y = 10) => {
  await wrapper.find('.rk-ctx-area').trigger('contextmenu', { clientX: x, clientY: y })
  // Twice: the panel renders on the first, and the focus it takes is set
  // after that, once its items exist to be focused.
  await nextTick()
  await nextTick()
}

const pressOnPanel = async (key: string, shiftKey = false) => {
  panel()!.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }))
  await nextTick()
  await nextTick()
}

afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount()
  document.body.innerHTML = ''
})

describe('BaseContextMenu', () => {
  it('stays out of the way until it is asked for', () => {
    mountMenu()
    expect(panel()).toBeNull()
  })

  it('opens where the pointer was, as a named menu', async () => {
    const wrapper = mountMenu()
    await rightClick(wrapper, 40, 60)

    expect(panel()?.getAttribute('role')).toBe('menu')
    expect(panel()?.getAttribute('aria-label')).toBe('Satır işlemleri')
    expect((panel() as HTMLElement).style.left).toBe('40px')
    expect((panel() as HTMLElement).style.top).toBe('60px')
  })

  it('opens on Shift+F10 and on the Menu key, which is the half with no mouse', async () => {
    const wrapper = mountMenu()

    await wrapper.find('#row').trigger('keydown', { key: 'F10', shiftKey: true })
    await nextTick()
    expect(panel()).not.toBeNull()

    wrapper.unmount()
    const second = mountMenu()
    await second.find('#row').trigger('keydown', { key: 'ContextMenu' })
    await nextTick()
    expect(panel()).not.toBeNull()
  })

  it('ignores a bare F10, which belongs to the browser', async () => {
    const wrapper = mountMenu()

    await wrapper.find('#row').trigger('keydown', { key: 'F10' })
    await nextTick()
    expect(panel()).toBeNull()
  })

  it('puts focus on the first action, so the keyboard is already inside', async () => {
    const wrapper = mountMenu()
    await rightClick(wrapper)

    expect(document.activeElement).toBe(menuItems()[0])
  })

  it('moves with the arrows and wraps at the ends', async () => {
    const wrapper = mountMenu()
    await rightClick(wrapper)

    await pressOnPanel('ArrowDown')
    expect(document.activeElement).toBe(menuItems()[1])

    await pressOnPanel('End')
    expect(document.activeElement).toBe(menuItems()[2])

    // A list with no edges is faster than one you fall off.
    await pressOnPanel('ArrowDown')
    expect(document.activeElement).toBe(menuItems()[0])
  })

  it('closes on Escape', async () => {
    const wrapper = mountMenu()
    await rightClick(wrapper)

    await pressOnPanel('Escape')
    expect(panel()).toBeNull()
  })

  it('lets Tab leave, which is the one place a menu is not a dialog', async () => {
    const wrapper = mountMenu()
    await rightClick(wrapper)

    await pressOnPanel('Tab')
    // Trapping Tab here would strand somebody inside a list of actions.
    expect(panel()).toBeNull()
  })

  it('leaves the browser its own menu when told to', async () => {
    const wrapper = mountMenu({ disabled: true })
    await rightClick(wrapper)

    expect(panel()).toBeNull()
    expect(wrapper.find('.rk-ctx-area').attributes('aria-haspopup')).toBeUndefined()
  })

  it('moves to the new point when right-clicked again, rather than shutting', async () => {
    const wrapper = mountMenu()
    await rightClick(wrapper, 10, 10)
    await rightClick(wrapper, 30, 40)

    // The document-level listener that closes it has to let our own area
    // through, or the second press opens and shuts in one gesture.
    expect(panel()).not.toBeNull()
    expect((panel() as HTMLElement).style.left).toBe('30px')
  })

  it('flips rather than running off the right edge', async () => {
    const wrapper = mountMenu()
    await rightClick(wrapper, 10, 10)

    /* jsdom gives every box a width of zero, so the flip could never be
       observed without one: the panel is told how wide it is, and then
       asked to place itself where it would not fit. */
    Object.defineProperty(panel()!, 'offsetWidth', { value: 300, configurable: true })

    const near = window.innerWidth - 20
    await wrapper.find('.rk-ctx-area').trigger('contextmenu', { clientX: near, clientY: 10 })
    await nextTick()

    // Flipped to the other side of the pointer rather than clamped to the
    // edge, which would slide it over the thing being acted on.
    expect(Number.parseInt((panel() as HTMLElement).style.left, 10)).toBe(near - 300)
  })
})
