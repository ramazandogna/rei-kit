import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { BaseAvatar, BaseMenu, BaseSheet, BaseSpinner, BaseSwitch, ensureSheetRoot } from '../index'

/**
 * The controls a kit is expected to have.
 *
 * `BaseMenu` was found by the rule: a hand-written dropdown in a file that
 * already imported the kit. It declared `role="menu"` and implemented none of
 * what that role promises, which is the usual shape of the bug — the roles are
 * the part people remember, because they are the part you can see.
 */

describe('BaseSwitch', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(BaseSwitch, { props: { label: 'Daily reminder', ...props } })

  it('is a switch, not a checkbox', () => {
    // A screen reader says "on"/"off" for a switch and "checked"/"unchecked"
    // for a checkbox. Those are different sentences about different things.
    const w = build({ modelValue: true })

    expect(w.find('[role="switch"]').attributes('aria-checked')).toBe('true')
  })

  it('commits on touch, because there is no Save after it', async () => {
    const w = build({ modelValue: false })
    await w.find('[role="switch"]').trigger('click')

    expect(w.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('does nothing while disabled', async () => {
    const w = build({ modelValue: false, disabled: true })
    await w.find('[role="switch"]').trigger('click')

    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('keeps its name when the label is hidden', () => {
    // For a switch in a row that already names it -- dropping the label
    // entirely would leave the control with no accessible name at all.
    const w = build({ labelHidden: true })

    expect(w.find('[role="switch"]').attributes('aria-label')).toBe('Daily reminder')
  })

  it('ties the hint to the control rather than leaving it beside it', () => {
    const w = build({ hint: 'At 21:00' })
    const describedBy = w.find('[role="switch"]').attributes('aria-describedby')

    expect(w.find(`#${describedBy}`).text()).toBe('At 21:00')
  })
})

describe('BaseSpinner', () => {
  it('says what is being waited for', () => {
    // A spinner with no accessible name is a decoration that happens to be the
    // only thing on screen.
    const w = mount(BaseSpinner, { props: { label: 'Loading courses' } })

    expect(w.find('[role="status"]').text()).toBe('Loading courses')
  })

  it('hides the ring itself, which carries nothing', () => {
    const w = mount(BaseSpinner, { props: { label: 'Loading' } })

    expect(w.find('.rk-spin').attributes('aria-hidden')).toBe('true')
  })
})

describe('BaseAvatar', () => {
  it('draws a person rather than an initial by default', () => {
    // An initial in a circle reads as a profile picture that failed to load,
    // and says nothing to somebody seeing an avatar in that spot for the
    // first time.
    const w = mount(BaseAvatar, { props: { name: 'Ramazan Dogan' } })

    expect(w.find('svg').exists()).toBe(true)
    expect(w.text()).toBe('')
  })

  it('uses initials where telling people apart is the job', () => {
    const w = mount(BaseAvatar, { props: { name: 'Ramazan Dogan', fallback: 'initials' } })

    expect(w.text()).toBe('RD')
  })

  it('takes one letter from a single-word name', () => {
    const w = mount(BaseAvatar, { props: { name: 'Ramazan', fallback: 'initials' } })

    expect(w.text()).toBe('R')
  })

  it('cuts between characters rather than through one', () => {
    // A name outside the basic plane is two code units per character; slicing
    // by index would produce half a character.
    const w = mount(BaseAvatar, { props: { name: '日本 太郎', fallback: 'initials' } })

    expect(w.text()).toBe('日太')
  })

  it('falls back when the image fails, rather than showing a broken frame', async () => {
    // A missing avatar is normal; a broken image is an error.
    const w = mount(BaseAvatar, { props: { src: '/nope.png', name: 'R' } })
    expect(w.find('img').exists()).toBe(true)

    await w.find('img').trigger('error')
    expect(w.find('img').exists()).toBe(false)
    expect(w.find('svg').exists()).toBe(true)
  })

  it('is an image with a name, or hidden entirely', () => {
    // Decoration beside a name already on screen should not be announced twice.
    expect(mount(BaseAvatar, { props: { label: 'Your account' } }).attributes('role')).toBe('img')
    expect(mount(BaseAvatar).attributes('aria-hidden')).toBe('true')
  })
})

describe('BaseMenu', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(BaseMenu, {
      props: { label: 'Account', ...props },
      slots: {
        trigger: '<span>avatar</span>',
        default:
          '<a role="menuitem" href="#a">Profile</a><a role="menuitem" href="#b">Notes</a><button role="menuitem">Sign out</button>',
      },
      attachTo: document.body,
    })

  it('tells assistive tech it opens something, and what state it is in', () => {
    const w = build()
    const trigger = w.find('button')

    expect(trigger.attributes('aria-haspopup')).toBe('true')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-label')).toBe('Account')
    w.unmount()
  })

  it('opens from the keyboard with the arrows', async () => {
    // Without this the menu is reachable only by pointer, whatever the role says.
    const w = build()
    await w.find('.rk-menu').trigger('keydown', { key: 'ArrowDown' })

    expect(w.emitted('update:modelValue')?.[0]).toEqual([true])
    w.unmount()
  })

  it('moves focus into the menu when it opens', async () => {
    const w = build({ modelValue: false })
    await w.setProps({ modelValue: true })
    await nextTick()

    expect(document.activeElement?.textContent).toBe('Profile')
    w.unmount()
  })

  it('moves between items with the arrows and wraps at both ends', async () => {
    const w = build({ modelValue: false })
    await w.setProps({ modelValue: true })
    await nextTick()

    const menu = w.find('.rk-menu')
    await menu.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement?.textContent).toBe('Sign out')

    await menu.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement?.textContent).toBe('Profile')
    w.unmount()
  })

  it('jumps to the ends with Home and End', async () => {
    const w = build({ modelValue: false })
    await w.setProps({ modelValue: true })
    await nextTick()

    const menu = w.find('.rk-menu')
    await menu.trigger('keydown', { key: 'End' })
    expect(document.activeElement?.textContent).toBe('Sign out')

    await menu.trigger('keydown', { key: 'Home' })
    expect(document.activeElement?.textContent).toBe('Profile')
    w.unmount()
  })

  it('closes on Escape', async () => {
    const w = build({ modelValue: true })
    await w.find('.rk-menu').trigger('keydown', { key: 'Escape' })

    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([false])
    w.unmount()
  })

  it('lets Tab leave rather than trapping inside it', async () => {
    // The one place a menu differs from a dialog. Getting it backwards traps
    // somebody in a list of links.
    const w = build({ modelValue: true })
    await w.find('.rk-menu').trigger('keydown', { key: 'Tab' })

    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([false])
    w.unmount()
  })

  it('gives focus back to the trigger when it closes', async () => {
    const w = build({ modelValue: false })
    await w.setProps({ modelValue: true })
    await nextTick()
    await w.setProps({ modelValue: false })
    await nextTick()

    expect(document.activeElement).toBe(w.find('button').element)
    w.unmount()
  })

  it('closes when something outside is pressed', async () => {
    const w = build({ modelValue: true })
    await nextTick()

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([false])
    w.unmount()
  })
})

describe('ensureSheetRoot', () => {
  it('makes the mount point rather than requiring the page to declare one', () => {
    // A page without it got a sheet that opened, blocked everything and
    // rendered nothing: Vue warns about the missing teleport target and carries
    // on, so the build is green, the types are fine and the screen is wrong.
    document.getElementById('sheet-root')?.remove()

    expect(ensureSheetRoot()).toBe('#sheet-root')
    expect(document.getElementById('sheet-root')).not.toBeNull()
  })

  it('keeps the one the app already declared', () => {
    document.getElementById('sheet-root')?.remove()
    const mine = document.createElement('div')
    mine.id = 'sheet-root'
    document.body.appendChild(mine)

    ensureSheetRoot()

    expect(document.querySelectorAll('#sheet-root')).toHaveLength(1)
    expect(document.getElementById('sheet-root')).toBe(mine)
  })

  it('lets BaseSheet render on a page that declared nothing', async () => {
    document.getElementById('sheet-root')?.remove()

    const w = mount(BaseSheet, {
      props: { modelValue: true, title: 'Yeni kayıt', closeLabel: 'Kapat' },
      slots: { default: '<p class="body">inside</p>' },
    })
    await nextTick()

    expect(document.querySelector('#sheet-root .body')).not.toBeNull()
    w.unmount()
  })
})
