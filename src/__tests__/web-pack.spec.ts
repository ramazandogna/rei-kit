import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { BaseAccordion, BaseModal, NavLinks } from '../web/index'

/**
 * The wide-site pack.
 *
 * `Modal` is the reason this release exists. The one wide consumer had written
 * a dialog twice, and every part of a dialog that matters is a part nothing
 * shows you is missing: focus that never moved, a Tab that walks out of it, a
 * page that scrolled underneath.
 */

const modal = (props: Record<string, unknown> = {}) =>
  mount(BaseModal, {
    props: { title: 'Are you sure?', closeLabel: 'Close', modelValue: true, ...props },
    slots: { default: '<button class="inner">one</button><button class="inner">two</button>' },
    attachTo: document.body,
  })

afterEach(() => {
  document.body.style.overflow = ''
  document.body.innerHTML = ''
})

describe('BaseModal', () => {
  it('names itself, or it is just a box', () => {
    const w = modal()
    const dialog = document.querySelector('[role="dialog"]')

    expect(dialog?.getAttribute('aria-label')).toBe('Are you sure?')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    w.unmount()
  })

  it('is an alertdialog when it interrupts', () => {
    const w = modal({ tone: 'alert' })

    expect(document.querySelector('[role="alertdialog"]')).not.toBeNull()
    w.unmount()
  })

  it('moves focus into the dialog', async () => {
    // Opening without this leaves a keyboard user behind the dialog, operating
    // a page they cannot see.
    const w = modal({ modelValue: false })
    await w.setProps({ modelValue: true })
    await nextTick()

    // Inside the panel is the requirement; which control is first is the DOM's
    // business, and here it is the close button.
    const panel = document.querySelector('.rk-modal-panel')!
    expect(panel.contains(document.activeElement)).toBe(true)
    w.unmount()
  })

  it('focuses the first real control when there is no close button', async () => {
    const w = modal({ modelValue: false, dismissible: false })
    await w.setProps({ modelValue: true })
    await nextTick()

    expect(document.activeElement?.classList.contains('inner')).toBe(true)
    w.unmount()
  })

  it('gives focus back when it closes', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()

    const w = modal({ modelValue: false })
    await w.setProps({ modelValue: true })
    await nextTick()
    await w.setProps({ modelValue: false })
    await nextTick()

    expect(document.activeElement).toBe(opener)
    w.unmount()
  })

  it('wraps Tab rather than letting it walk out', async () => {
    // A dialog you can Tab out of is modal only to somebody using a mouse.
    const w = modal({ modelValue: false })
    await w.setProps({ modelValue: true })
    await nextTick()

    const buttons = document.querySelectorAll<HTMLElement>('.rk-modal-panel button')
    const last = buttons[buttons.length - 1]!
    last.focus()

    const scrim = document.querySelector('.rk-modal-scrim')!
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    scrim.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(buttons[0])
    w.unmount()
  })

  it('closes on Escape, and does not when it must be answered', async () => {
    const w = modal()
    const scrim = () => document.querySelector('.rk-modal-scrim')!

    scrim().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([false])
    w.unmount()

    const locked = modal({ dismissible: false })
    scrim().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(locked.emitted('update:modelValue')).toBeUndefined()
    locked.unmount()
  })

  it('has no close button when it must be answered', () => {
    const w = modal({ dismissible: false })

    expect(document.querySelector('.rk-modal-close')).toBeNull()
    w.unmount()
  })

  it('stops the page underneath from scrolling', async () => {
    // Otherwise dismissing the dialog returns you somewhere else.
    const w = modal({ modelValue: false })
    await w.setProps({ modelValue: true })

    expect(document.body.style.overflow).toBe('hidden')

    await w.setProps({ modelValue: false })
    expect(document.body.style.overflow).toBe('')
    w.unmount()
  })

  it('unlocks the page even if it is torn out while open', async () => {
    // Otherwise the page is left unscrollable with nothing on screen to say why.
    const w = modal({ modelValue: false })
    await w.setProps({ modelValue: true })
    w.unmount()

    expect(document.body.style.overflow).toBe('')
  })
})

describe('BaseAccordion', () => {
  const items = [
    { key: 'a', title: 'First' },
    { key: 'b', title: 'Second' },
  ] as const

  const build = (props: Record<string, unknown> = {}) =>
    mount(BaseAccordion, {
      props: { items, ...props },
      slots: { default: '<p>answer</p>' },
    })

  it('keeps every answer in the markup, closed or not', () => {
    // This is what a crawler and a reader without JavaScript get, and it is
    // the reason this is not <details>.
    const w = build()

    expect(w.findAll('p')).toHaveLength(2)
  })

  it('says it is shut, and means it', () => {
    const w = build()

    expect(w.findAll('button').every((b) => b.attributes('aria-expanded') === 'false')).toBe(true)
  })

  it('opens one and closes the other', async () => {
    const w = build()
    const buttons = w.findAll('button')

    await buttons[0]!.trigger('click')
    expect(buttons[0]!.attributes('aria-expanded')).toBe('true')

    await buttons[1]!.trigger('click')
    expect(buttons[0]!.attributes('aria-expanded')).toBe('false')
    expect(buttons[1]!.attributes('aria-expanded')).toBe('true')
  })

  it('keeps both open when told to', async () => {
    const w = build({ multiple: true })
    const buttons = w.findAll('button')

    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')

    expect(buttons.every((b) => b.attributes('aria-expanded') === 'true')).toBe(true)
  })

  it('closes what is already open', async () => {
    const w = build()
    const button = w.findAll('button')[0]!

    await button.trigger('click')
    await button.trigger('click')

    expect(button.attributes('aria-expanded')).toBe('false')
  })

  it('points the control at the panel it controls', () => {
    const w = build()
    const controls = w.findAll('button')[0]!.attributes('aria-controls')

    expect(w.find(`#${controls}`).exists()).toBe(true)
  })

  it('puts the control in a heading, at the level the page needs', () => {
    // A heading is how somebody moves between sections without opening any.
    expect(build().find('h3 button').exists()).toBe(true)
    expect(build({ headingLevel: 2 }).find('h2 button').exists()).toBe(true)
  })
})

describe('NavLinks', () => {
  const items = [
    { key: 'courses', to: '/kurslar', label: 'Courses' },
    { key: 'blog', to: '/blog', label: 'Blog' },
  ] as const

  const build = (active?: string) =>
    mount(NavLinks, {
      props: { items, active, label: 'Primary' },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })

  it('marks the current page for a screen reader, not only with the rule', () => {
    const w = build('blog')
    const links = w.findAll('a')

    expect(links[1]!.attributes('aria-current')).toBe('page')
    expect(links[0]!.attributes('aria-current')).toBeUndefined()
  })

  it('names the landmark', () => {
    expect(build().find('nav').attributes('aria-label')).toBe('Primary')
  })

  it('hides the rule from assistive tech, since aria-current already said it', () => {
    expect(build('blog').find('.rk-nav-rule').attributes('aria-hidden')).toBe('true')
  })
})
