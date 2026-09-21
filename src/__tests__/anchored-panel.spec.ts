import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'

import BaseMenu from '../components/BaseMenu.vue'
import BaseCombobox from '../components/BaseCombobox.vue'
import BasePopover from '../components/BasePopover.vue'
import BaseHoverCard from '../web/BaseHoverCard.vue'

/**
 * Keeping an open panel on screen.
 *
 * `BasePopover` has flipped and slid since it was written and nothing ever
 * checked that it did — jsdom has no layout, so the arithmetic was never
 * given anything to work on. `BaseMenu` did not flip at all: its panel was
 * pinned under the trigger with `top: 100%`, so a menu button near the
 * bottom of a window opened a list that ran off the bottom of the screen.
 * That is the common case rather than the awkward one — a row action, the
 * `…` on a card, anything at all on a phone — and nothing said so. It
 * rendered, it passed axe, and every item was there.
 *
 * jsdom reports every box as zero, so each case below supplies the two
 * rectangles the arithmetic reads and then provokes a re-measure through
 * the resize listener the panel keeps while it is open. What is being
 * checked is the decision, not a layout.
 */
const VIEWPORT = { width: 1024, height: 768 }

function box(rect: Partial<DOMRect>) {
  return () => ({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, ...rect }) as DOMRect
}

/** The two boxes `place()` reads, then the resize that makes it read them. */
async function measure(
  root: HTMLElement,
  anchor: Partial<DOMRect>,
  panel: HTMLElement,
  size: Partial<DOMRect>,
) {
  root.getBoundingClientRect = box(anchor)
  panel.getBoundingClientRect = box(size)

  window.dispatchEvent(new Event('resize'))
  await nextTick()
}

afterEach(() => {
  document.body.innerHTML = ''
})

const menu = () =>
  mount(BaseMenu, {
    props: { label: 'Hesap', modelValue: true },
    slots: { default: () => h('button', { type: 'button', role: 'menuitem' }, 'Çıkış') },
    attachTo: document.body,
  })

const popover = () =>
  mount(BasePopover, {
    props: { label: 'Ayarlar', modelValue: true },
    slots: {
      trigger: () => h('button', { type: 'button' }, 'Aç'),
      default: () => h('p', 'içerik'),
    },
    attachTo: document.body,
  })

const combobox = () =>
  mount(BaseCombobox, {
    props: {
      label: 'Şehir',
      options: [
        { value: 'ist', label: 'İstanbul' },
        { value: 'ank', label: 'Ankara' },
      ],
    },
    attachTo: document.body,
  })

describe('an anchored panel stays on screen', () => {
  it('BaseMenu opens above when there is no room below', async () => {
    const wrapper = menu()
    const panel = wrapper.get('[role="menu"]')

    // The trigger is 40px off the bottom of a 768px window; the panel is 200.
    await measure(wrapper.element as HTMLElement, { top: 700, bottom: 728 }, panel.element, {
      height: 200,
    })

    expect(panel.classes()).toContain('is-top')
  })

  it('BaseMenu stays below when it fits', async () => {
    const wrapper = menu()
    const panel = wrapper.get('[role="menu"]')

    await measure(wrapper.element as HTMLElement, { top: 100, bottom: 128 }, panel.element, {
      height: 200,
    })

    expect(panel.classes()).toContain('is-bottom')
  })

  /*
   * A panel taller than the window fits neither way, and the rule is still
   * "more room wins". `BasePopover` carried a comment claiming it kept the
   * side it asked for in this case. It never did — the arithmetic had
   * never been given a layout to work on, so nothing could disagree with
   * the comment. These two cases are the real rule, from both sides.
   */
  it('takes the roomier side when neither fits', async () => {
    const wrapper = menu()
    const panel = wrapper.get('[role="menu"]')

    // 400 above, 340 below, and 900 of panel: above wins.
    await measure(wrapper.element as HTMLElement, { top: 400, bottom: 428 }, panel.element, {
      height: 900,
    })

    expect(panel.classes()).toContain('is-top')
  })

  it('and stays put when the roomier side is the one it is on', async () => {
    const wrapper = menu()
    const panel = wrapper.get('[role="menu"]')

    // 100 above, 640 below, and 900 of panel: below still wins.
    await measure(wrapper.element as HTMLElement, { top: 100, bottom: 128 }, panel.element, {
      height: 900,
    })

    expect(panel.classes()).toContain('is-bottom')
  })

  it('slides a panel back in from the side of the window', async () => {
    const wrapper = menu()
    const panel = wrapper.get('[role="menu"]')

    // 60px past the right-hand edge, so it comes back 68 with the margin.
    await measure(wrapper.element as HTMLElement, { top: 100, bottom: 128 }, panel.element, {
      left: VIEWPORT.width - 140,
      right: VIEWPORT.width + 60,
      height: 200,
    })

    expect(panel.attributes('style')).toContain('-68px')
  })

  it('leaves a panel that is already on screen alone', async () => {
    const wrapper = menu()
    const panel = wrapper.get('[role="menu"]')

    await measure(wrapper.element as HTMLElement, { top: 100, bottom: 128 }, panel.element, {
      left: 100,
      right: 300,
      height: 200,
    })

    expect(panel.attributes('style')).toBeUndefined()
  })

  /* A combobox is usually the last question before the button, which is
     to say near the bottom of the form. */
  it('BaseCombobox opens its list upwards near the bottom of a form', async () => {
    const wrapper = combobox()

    await wrapper.get('input').trigger('focus')
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' })

    const list = wrapper.get('[role="listbox"]')
    await measure(wrapper.element as HTMLElement, { top: 700, bottom: 728 }, list.element, {
      height: 200,
    })

    expect(list.classes()).toContain('is-top')
  })

  /* Supplementary, so a card that opened off the bottom of the window cost
     nothing anybody could see — which is why it stayed that way. */
  it('BaseHoverCard flips too, and keeps its arrow with it', async () => {
    const wrapper = mount(BaseHoverCard, {
      props: { label: 'Profil' },
      slots: { default: () => h('a', { href: '#' }, 'Ada'), card: () => h('p', 'kart') },
      attachTo: document.body,
    })

    await wrapper.get('.rk-hovercard').trigger('focusin')

    const panel = wrapper.get('[role="group"]')
    await measure(wrapper.element as HTMLElement, { top: 700, bottom: 728 }, panel.element, {
      height: 200,
    })

    // The arrow is drawn off `is-top` / `is-bottom`, so it moves with it.
    expect(panel.classes()).toContain('is-top')
  })

  it('BasePopover flips the same way, which nothing had ever checked', async () => {
    const wrapper = popover()
    const panel = wrapper.get('[role="dialog"]')

    await measure(wrapper.element as HTMLElement, { top: 700, bottom: 728 }, panel.element, {
      height: 200,
    })

    expect(panel.classes()).toContain('is-top')
  })

  /*
   * The resize above is a convenience for the cases; this is the path that
   * actually matters. A panel is measured the moment it opens, and a first
   * measurement that never happened would leave every one of them below
   * its trigger until something else moved.
   */
  it('measures as it opens, without waiting for anything to move', async () => {
    const wrapper = mount(BaseMenu, {
      props: { label: 'Hesap', modelValue: false },
      slots: { default: () => h('button', { type: 'button', role: 'menuitem' }, 'Çıkış') },
      attachTo: document.body,
    })

    const root = wrapper.element as HTMLElement
    root.getBoundingClientRect = box({ top: 700, bottom: 728 })

    /* The panel does not exist until it opens, so its box is supplied to
       every element and the panel is the only one asked for one. */
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      writable: true,
      value: box({ height: 200 }),
    })
    root.getBoundingClientRect = box({ top: 700, bottom: 728 })

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    await nextTick()

    expect(wrapper.get('[role="menu"]').classes()).toContain('is-top')

    delete (HTMLElement.prototype as unknown as Record<string, unknown>)['getBoundingClientRect']
  })

  it('stops listening once it is closed', async () => {
    const off = vi.spyOn(window, 'removeEventListener')
    const wrapper = menu()

    await wrapper.setProps({ modelValue: false })

    /* A closed panel that kept its listeners would re-measure on every
       scroll of every ancestor, for as long as the page is open — and
       there is nothing on screen to notice it doing so. */
    const removed = off.mock.calls.map(([type]) => type)
    expect(removed).toContain('resize')
    expect(removed).toContain('scroll')

    off.mockRestore()
  })
})
