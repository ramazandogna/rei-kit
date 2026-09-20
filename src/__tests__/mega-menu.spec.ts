import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import { MegaMenu } from '../web/index'

/**
 * A wide site's navigation, where a section holds more than a row can.
 *
 * The thing worth testing is what it is *not*. `role="menu"` is for an
 * application's actions, and using it for a set of links tells somebody
 * listening that Tab will not work and the arrows will — both untrue, and
 * both stated confidently. This is a disclosure: buttons that open panels of
 * ordinary links.
 */
const ITEMS = [
  {
    key: 'products',
    label: 'Products',
    columns: [
      {
        key: 'apps',
        title: 'Apps',
        links: [
          { key: 'hibi', to: '/hibi', label: 'Hibi', description: 'A journal' },
          { key: 'kakei', to: '/kakei', label: 'Kakei' },
        ],
      },
      {
        key: 'tools',
        links: [{ key: 'kit', to: '/kit', label: 'rei-kit' }],
      },
    ],
  },
  { key: 'pricing', label: 'Pricing', to: '/pricing' },
] as const

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/:rest(.*)', component: { template: '<div />' } }],
})

const build = (props: Record<string, unknown> = {}) =>
  mount(MegaMenu, {
    props: { items: ITEMS, label: 'Main', ...props },
    global: { plugins: [router] },
    attachTo: document.body,
  })

afterEach(() => {
  document.body.innerHTML = ''
})

describe('MegaMenu', () => {
  it('is a navigation landmark with a name', () => {
    const w = build()

    expect(w.element.tagName).toBe('NAV')
    expect(w.attributes('aria-label')).toBe('Main')
  })

  it('discloses a panel rather than opening a menu', async () => {
    const w = build()

    // Nothing here claims to be a menu: that would promise a keyboard
    // contract these links do not have.
    expect(w.find('[role="menu"]').exists()).toBe(false)
    expect(w.find('[role="menuitem"]').exists()).toBe(false)

    const button = w.find('button')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('aria-controls')).toBe(w.find('.rk-mega-panel').attributes('id'))
  })

  it('opens on a press and closes on the next one', async () => {
    const w = build()
    const button = w.find('button')

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(w.find('.rk-mega-panel').attributes('hidden')).toBeUndefined()

    await button.trigger('click')
    expect(w.find('.rk-mega-panel').attributes('hidden')).toBeDefined()
  })

  it('opens on hover too, and only where there is something to open', async () => {
    const w = build()
    const items = w.findAll('.rk-mega-item')

    await items[0]!.trigger('pointerenter')
    expect(w.find('button').attributes('aria-expanded')).toBe('true')

    // The second item is a plain link; hovering it opens nothing and, more
    // to the point, does not close what is open by accident.
    await items[1]!.trigger('pointerenter')
    expect(w.find('button').attributes('aria-expanded')).toBe('true')
  })

  it('does not let the pointer do both halves of a toggle', async () => {
    // The bug this locks: moving onto the button opened the panel, and the
    // click that followed -- the one press a reader thinks of as opening it
    // -- closed it again. In a browser you could not open it by clicking at
    // all, which is exactly what happened the first time this shipped.
    const w = build()
    const item = w.findAll('.rk-mega-item')[0]!
    const button = w.find('button')

    await item.trigger('pointerenter')
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')

    // Pinned now: the pointer leaving no longer closes it.
    await item.trigger('pointerleave')
    expect(button.attributes('aria-expanded')).toBe('true')

    // And the next press does.
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('false')
  })

  it('leaves hover alone when it was told to', async () => {
    const w = build({ openOnHover: false })

    await w.findAll('.rk-mega-item')[0]!.trigger('pointerenter')
    expect(w.find('button').attributes('aria-expanded')).toBe('false')
  })

  it('closes on Escape and gives focus back to what opened it', async () => {
    const w = build()
    const button = w.find('button')

    await button.trigger('click')
    await w.trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(button.attributes('aria-expanded')).toBe('false')
    // Without this the next Tab starts at the top of the page again.
    expect(document.activeElement).toBe(button.element)
  })

  it('holds the panel open long enough to reach it', async () => {
    const w = build({ hoverDelay: 120 })

    await w.findAll('.rk-mega-item')[0]!.trigger('pointerenter')
    await w.findAll('.rk-mega-item')[0]!.trigger('pointerleave')

    // Still open: the pointer has to cross the gap between the button and
    // the panel, and that gap is over neither of them.
    expect(w.find('button').attributes('aria-expanded')).toBe('true')
  })

  it('renders the links as links, with their columns and notes', async () => {
    const w = build()
    await w.find('button').trigger('click')

    const links = w.findAll('.rk-mega-link')
    expect(links).toHaveLength(3)
    expect(links[0]!.attributes('href')).toBe('/hibi')
    expect(links[0]!.text()).toContain('A journal')

    expect(w.find('.rk-mega-column-title').text()).toBe('Apps')
    // A column with no title renders none rather than an empty heading.
    expect(w.findAll('.rk-mega-column-title')).toHaveLength(1)
  })

  it('says which section is current, once', async () => {
    const w = build({ active: 'pricing' })
    const current = w.findAll('[aria-current="page"]')

    expect(current).toHaveLength(1)
    expect(current[0]!.text()).toBe('Pricing')
  })

  it('makes an item with nothing under it a plain link', () => {
    const w = build()
    const tops = w.findAll('.rk-mega-top')

    // A button that does nothing when pressed is worse than a link.
    expect(tops[1]!.element.tagName).toBe('A')
    expect(tops[1]!.attributes('href')).toBe('/pricing')
  })
})
