import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'

import ActivityGrid from '../components/ActivityGrid.vue'
import BaseCalendar from '../components/BaseCalendar.vue'
import BaseRating from '../components/BaseRating.vue'
import PinInput from '../components/PinInput.vue'
import ToggleGroup from '../components/ToggleGroup.vue'
import BaseSplitter from '../web/BaseSplitter.vue'
import BaseTabs from '../web/BaseTabs.vue'
import BaseToolbar from '../web/BaseToolbar.vue'
import BaseTree from '../web/BaseTree.vue'
import TourShell from '../app/TourShell.vue'

/**
 * `ArrowLeft` means "the previous one" only where the language runs left to
 * right.
 *
 * 2.22.0 set `dir` on the document and found sixty-one physical CSS
 * declarations behind it. This is the half of that fault a stylesheet
 * scanner cannot see: the arrows. A row of tabs in Arabic runs right to
 * left, so the tab to the left of the current one is the *next* one, and
 * every roving-tabindex control in the kit was walking backwards through
 * itself. WAI-ARIA says so in as many words, and nothing else here catches
 * it — the code type-checks, the styles are all logical, and the keys are
 * the same keys.
 *
 * Each case below presses `ArrowLeft` in a right-to-left document and
 * asserts it went *forward*. The mirror of each is already covered by the
 * component's own spec, which runs left to right, so a fix that simply
 * swapped the two everywhere would fail there instead.
 */
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.body.innerHTML = ''
})

function rtl() {
  document.documentElement.setAttribute('dir', 'rtl')
}

const attach = { attachTo: document.body }

describe('the arrow keys, right to left', () => {
  it('ToggleGroup: ArrowLeft moves on to the next button', async () => {
    rtl()
    const wrapper = mount(ToggleGroup, {
      props: {
        label: 'Hizalama',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ],
      },
      ...attach,
    })

    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('keydown', { key: 'ArrowLeft' })

    expect(document.activeElement).toBe(buttons[1]!.element)
  })

  it('BaseTabs: ArrowLeft selects the next tab', async () => {
    rtl()
    const wrapper = mount(BaseTabs, {
      props: {
        /* Three, not two: with two items the list wraps onto itself and
           both directions land on the same tab, so the test passed with the
           mirroring removed. */
        items: [
          { key: 'one', label: 'Bir' },
          { key: 'two', label: 'İki' },
          { key: 'three', label: 'Üç' },
        ],
        modelValue: 'one',
      },
      ...attach,
    })

    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['two'])
  })

  it('BaseToolbar: ArrowLeft moves on to the next control', async () => {
    rtl()
    const wrapper = mount(BaseToolbar, {
      props: { label: 'Biçim' },
      slots: {
        /* Three for the same reason as the tabs above: two controls wrap
           onto each other and hide the direction entirely. */
        default: () => [
          h('button', { type: 'button' }, 'Bir'),
          h('button', { type: 'button' }, 'İki'),
          h('button', { type: 'button' }, 'Üç'),
        ],
      },
      ...attach,
    })

    const buttons = wrapper.findAll('button')
    buttons[0]!.element.focus()
    await wrapper.get('[role="toolbar"]').trigger('keydown', { key: 'ArrowLeft' })

    expect(document.activeElement).toBe(buttons[1]!.element)
  })

  it('BaseCalendar: ArrowLeft moves on to tomorrow', async () => {
    rtl()
    const wrapper = mount(BaseCalendar, {
      props: {
        previousLabel: 'Önceki',
        nextLabel: 'Sonraki',
        modelValue: '2026-03-10',
      },
      ...attach,
    })

    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'ArrowLeft' })

    // The focused day is the one carrying the roving tabindex.
    expect(wrapper.get('[tabindex="0"].rk-cal-day').text()).toBe('11')
  })

  it('BaseRating: ArrowLeft is one more star', async () => {
    rtl()
    const wrapper = mount(BaseRating, {
      props: {
        label: 'Puan',
        valueLabel: (value: number, max: number) => `${value}/${max}`,
        modelValue: 2,
      },
      ...attach,
    })

    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([3])
  })

  it('PinInput: ArrowLeft moves on to the next box', async () => {
    rtl()
    const wrapper = mount(PinInput, {
      props: {
        label: 'Kod',
        cellLabel: (position: number, total: number) => `${position}/${total}`,
      },
      ...attach,
    })

    const boxes = wrapper.findAll('input')
    await boxes[0]!.trigger('keydown', { key: 'ArrowLeft' })

    expect(document.activeElement).toBe(boxes[1]!.element)
  })

  it('BaseTree: ArrowLeft is the way in, not the way out', async () => {
    rtl()
    const wrapper = mount(BaseTree, {
      props: {
        label: 'Ağaç',
        nodes: [{ key: 'root', label: 'Kök', children: [{ key: 'leaf', label: 'Yaprak' }] }],
      },
      ...attach,
    })

    await wrapper.get('[role="tree"]').trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.get('[role="treeitem"]').attributes('aria-expanded')).toBe('true')
  })

  it('BaseSplitter: ArrowLeft grows the first pane', async () => {
    rtl()
    const wrapper = mount(BaseSplitter, {
      props: { label: 'Bölücü', modelValue: 50 },
      ...attach,
    })

    await wrapper.get('[role="separator"]').trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toBeGreaterThan(50)
  })

  it('TourShell: ArrowLeft is the next step', async () => {
    rtl()
    const wrapper = mount(TourShell, {
      props: {
        modelValue: true,
        index: 0,
        total: 3,
        dialogLabel: 'Tur',
        skipLabel: 'Geç',
        backLabel: 'Geri',
        nextLabel: 'İleri',
        lastLabel: 'Bitti',
        stepLabel: (position: number) => `${position}. adım`,
      },
      ...attach,
    })

    /* It teleports, so the dialog is not inside the wrapper's own tree. */
    const dialog = document.querySelector('[role="dialog"]')!
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))

    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(wrapper.emitted('back')).toBeUndefined()
  })

  it('ActivityGrid: ArrowLeft moves on to the following week', async () => {
    rtl()
    const days = Array.from({ length: 30 }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`)
    const wrapper = mount(ActivityGrid, {
      props: {
        days,
        label: 'Yıl',
        levelFor: () => 'bg-primary',
        dayLabel: (key: string) => key,
        startAtEnd: false,
      },
      ...attach,
    })

    const table = wrapper.get('table')
    await table.trigger('keydown', { key: 'ArrowLeft' })

    // A column is a week, so one step along is seven days later.
    expect(wrapper.get('[tabindex="0"][data-day]').attributes('data-day')).toBe('2026-01-08')
  })
})
