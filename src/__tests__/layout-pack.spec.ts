import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'

import { BaseSplitter, BaseToolbar, BaseTree, TransferList } from '../web/index'

/**
 * The shapes a desk-sized screen is arranged with: a tree, a splitter, a
 * toolbar and a transfer list.
 *
 * Every one of them is a keyboard problem first. A tree whose arrows do
 * nothing is nested lists; a handle that only answers to a drag is a layout
 * a keyboard cannot change; a toolbar without roving tabindex is twelve Tab
 * presses on the way past it.
 */

afterEach(() => {
  document.body.innerHTML = ''
})

describe('BaseTree', () => {
  const nodes = [
    {
      key: 'src',
      label: 'src',
      children: [
        { key: 'index', label: 'index.ts' },
        { key: 'components', label: 'components', children: [{ key: 'button', label: 'Button' }] },
      ],
    },
    { key: 'readme', label: 'README.md' },
  ] as const

  const build = (props: Record<string, unknown> = {}) =>
    mount(BaseTree, { props: { nodes, label: 'Dosyalar', ...props }, attachTo: document.body })

  const labels = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('[role="treeitem"]').map((row) => row.text())

  it('says where each row is in a shape nobody can see', () => {
    const wrapper = build({ expanded: ['src'] })
    const rows = wrapper.findAll('[role="treeitem"]')

    expect(wrapper.attributes('role')).toBe('tree')
    expect(rows[0]!.attributes('aria-level')).toBe('1')
    expect(rows[0]!.attributes('aria-expanded')).toBe('true')
    expect(rows[1]!.attributes('aria-level')).toBe('2')
    expect(rows[1]!.attributes('aria-posinset')).toBe('1')
    expect(rows[1]!.attributes('aria-setsize')).toBe('2')
    // A leaf is not expandable, and says nothing rather than "collapsed".
    expect(rows[1]!.attributes('aria-expanded')).toBeUndefined()
  })

  it('shows only what is open', async () => {
    const wrapper = build()
    expect(labels(wrapper)).toEqual(['src', 'README.md'])

    await wrapper.setProps({ expanded: ['src'] })
    expect(labels(wrapper)).toEqual(['src', 'index.ts', 'components', 'README.md'])
  })

  it('opens with Right, steps in on the second press, and closes with Left', async () => {
    const wrapper = build()

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:expanded')!.at(-1)).toEqual([['src']])

    await wrapper.setProps({ expanded: ['src'] })
    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.trigger('keydown', { key: 'Enter' })
    // Stepped into the branch: the chosen row is its first child.
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['index'])

    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    // A leaf's Left goes out to the parent rather than closing anything.
    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:expanded')!.at(-1)).toEqual([[]])
  })

  it('keeps several chosen in multiple mode', async () => {
    const wrapper = build({ mode: 'multiple', modelValue: ['readme'], expanded: [] })

    await wrapper.trigger('keydown', { key: 'End' })
    await wrapper.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[]])
  })
})

describe('BaseSplitter', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(BaseSplitter, {
      props: { label: 'Listeyi yeniden boyutlandır', modelValue: 50, ...props },
      slots: { start: '<p>list</p>', end: '<p>preview</p>' },
    })

  it('is a separator with a value, so it can be moved without a pointer', async () => {
    const wrapper = build()
    const handle = wrapper.find('[role="separator"]')

    expect(handle.attributes('tabindex')).toBe('0')
    expect(handle.attributes('aria-valuenow')).toBe('50')
    expect(handle.attributes('aria-valuemin')).toBe('15')

    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([52])
  })

  it('stops at its limits, and Enter puts it back where it started', async () => {
    const wrapper = build({ modelValue: 16 })
    const handle = wrapper.find('[role="separator"]')

    await handle.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([15])

    await handle.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([16])
  })

  it('gives the first pane the split as a width', () => {
    const wrapper = build({ modelValue: 30 })

    expect(wrapper.attributes('style')).toContain('--rk-split: 30%')
  })
})

describe('BaseToolbar', () => {
  const build = () =>
    mount(BaseToolbar, {
      props: { label: 'Biçim' },
      slots: {
        default: () => [
          h('button', { type: 'button' }, 'B'),
          h('button', { type: 'button' }, 'I'),
          h('button', { type: 'button', disabled: true }, 'S'),
          h('button', { type: 'button' }, 'U'),
        ],
      },
      attachTo: document.body,
    })

  it('is one Tab stop, whatever it was given', async () => {
    const wrapper = build()
    await nextTick()

    // A disabled button is out of the tab order whatever its tabindex says,
    // so only the ones that can take focus are counted.
    const reachable = wrapper.findAll('button:not([disabled])')
    expect(wrapper.attributes('role')).toBe('toolbar')
    expect(reachable.map((b) => b.element.tabIndex)).toEqual([0, -1, -1])
  })

  it('moves with the arrows, skipping what is disabled, and wraps', async () => {
    const wrapper = build()
    await nextTick()
    const buttons = wrapper.findAll('button')

    buttons[0]!.element.focus()
    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[1]!.element)

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    // The disabled one is not a stop.
    expect(document.activeElement).toBe(buttons[3]!.element)

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[0]!.element)
  })

  it('remembers where it was left', async () => {
    const wrapper = build()
    await nextTick()
    const buttons = wrapper.findAll('button')

    await buttons[1]!.trigger('focusin')

    const reachable = wrapper.findAll('button:not([disabled])')
    expect(reachable.map((b) => b.element.tabIndex)).toEqual([-1, 0, -1])
  })
})

describe('TransferList', () => {
  const options = [
    { value: 'read', label: 'Okuma' },
    { value: 'write', label: 'Yazma' },
    { value: 'admin', label: 'Yönetim' },
  ] as const

  const build = (props: Record<string, unknown> = {}) =>
    mount(TransferList, {
      props: {
        options,
        availableLabel: 'Verilebilir',
        chosenLabel: 'Verilmiş',
        addLabel: 'Seçilenleri ekle',
        removeLabel: 'Seçilenleri çıkar',
        modelValue: [],
        ...props,
      },
    })

  it('shows on the left only what is not already on the right', () => {
    const wrapper = build({ modelValue: ['write'] })
    const lists = wrapper.findAll('[role="listbox"]')

    expect(lists[0]!.text()).not.toContain('Yazma')
    expect(lists[1]!.text()).toBe('Yazma')
  })

  it('moves what was marked, and keeps nothing to move disabled', async () => {
    const wrapper = build()
    const add = wrapper.find('[aria-label="Seçilenleri ekle"]')

    expect(add.attributes('disabled')).toBeDefined()

    await wrapper.findAll('[role="option"]')[0]!.trigger('click')
    await wrapper.find('[aria-label="Seçilenleri ekle"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['read']])
  })

  it('takes back what was marked on the right', async () => {
    const wrapper = build({ modelValue: ['read', 'admin'] })
    const chosen = wrapper.findAll('[role="listbox"]')[1]!

    await chosen.findAll('[role="option"]')[1]!.trigger('click')
    await wrapper.find('[aria-label="Seçilenleri çıkar"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['read']])
  })
})
