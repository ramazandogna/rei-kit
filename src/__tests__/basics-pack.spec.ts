import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import {
  AvatarStack,
  BaseChip,
  BaseKbd,
  BaseLink,
  BaseRating,
  BaseSeparator,
  BaseSkeleton,
  CopyButton,
  FileDrop,
  TagsInput,
} from '../index'

/**
 * The parts every kit has and this one did not: a rule, a grey box, a key,
 * a chip, a stack of faces, a link, a copy button, a score, a drop zone and
 * a field full of tags.
 *
 * Small components, and the mistakes in them are small too and all of the
 * same kind: a control that cannot be reached with a keyboard, a button
 * whose only name is "×", a score that costs five Tab presses to walk past.
 */

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('BaseSeparator', () => {
  it('is a separator when it only divides', () => {
    const wrapper = mount(BaseSeparator, { props: { orientation: 'vertical' } })

    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
  })

  it('says nothing at all when it carries a word', () => {
    // The text is the point; the lines either side are decoration.
    const wrapper = mount(BaseSeparator, { props: { label: 'or' } })

    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toBe('or')
  })
})

describe('BaseSkeleton', () => {
  it('takes lengths rather than classes, and hides from assistive tech', () => {
    const wrapper = mount(BaseSkeleton, { props: { width: '12rem', height: '2rem' } })

    expect(wrapper.attributes('style')).toContain('width: 12rem')
    expect(wrapper.attributes('style')).toContain('height: 2rem')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('squares a circle to its height', () => {
    const wrapper = mount(BaseSkeleton, { props: { shape: 'circle', height: '3rem' } })

    expect(wrapper.attributes('style')).toContain('width: 3rem')
  })
})

describe('BaseKbd', () => {
  it('draws a chord as separate keys, in the element browsers know', () => {
    const wrapper = mount(BaseKbd, { props: { keys: ['⌘', 'K'], joiner: '+' } })

    expect(wrapper.findAll('kbd').map((key) => key.text())).toEqual(['⌘', 'K'])
    expect(wrapper.find('.rk-kbd-joiner').attributes('aria-hidden')).toBe('true')
  })
})

describe('BaseChip', () => {
  it('is a plain label until it is given something to do', () => {
    const wrapper = mount(BaseChip, { props: { label: 'design' } })

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('names its remove button with a word the kit did not invent', async () => {
    const wrapper = mount(BaseChip, {
      props: { label: 'design', removeLabel: 'design etiketini kaldır' },
    })

    await wrapper.find('[aria-label="design etiketini kaldır"]').trigger('click')

    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('becomes a toggle when it is given a state', async () => {
    const wrapper = mount(BaseChip, { props: { label: 'unpaid', selected: true } })
    const toggle = wrapper.find('button')

    expect(toggle.attributes('aria-pressed')).toBe('true')

    await toggle.trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('keeps its two buttons side by side, never one inside the other', async () => {
    const wrapper = mount(BaseChip, {
      props: { label: 'unpaid', selected: false, removeLabel: 'unpaid filtresini kaldır' },
    })
    const buttons = wrapper.findAll('button')

    expect(buttons).toHaveLength(2)
    // A button nested in a button is not a control a browser can make sense of.
    expect(buttons[1]!.element.closest('button')).toBe(buttons[1]!.element)

    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
    expect(wrapper.emitted('select')).toBeUndefined()
  })
})

describe('AvatarStack', () => {
  it('stops drawing faces and counts the rest', () => {
    const people = ['Aiko', 'Kenji', 'Mei', 'Ravi', 'Sara', 'Tom'].map((name) => ({ name }))
    const wrapper = mount(AvatarStack, { props: { people, label: '6 kişiyle paylaşıldı', max: 4 } })

    expect(wrapper.attributes('aria-label')).toBe('6 kişiyle paylaşıldı')
    expect(wrapper.find('.rk-stack-rest').text()).toBe('+2')
  })
})

describe('BaseLink', () => {
  it('marks a link that leaves, and closes the door behind it', () => {
    const wrapper = mount(BaseLink, {
      props: { href: 'https://example.com', external: true },
      slots: { default: 'Docs' },
    })

    expect(wrapper.attributes('target')).toBe('_blank')
    // Without `noopener` the page that opens can reach back through window.opener.
    expect(wrapper.attributes('rel')).toContain('noopener')
    expect(wrapper.find('.rk-link-mark').exists()).toBe(true)
  })
})

describe('CopyButton', () => {
  const clipboard = (writeText: () => Promise<void>) =>
    vi.stubGlobal('navigator', { clipboard: { writeText } })

  it('copies, says so, and goes back to itself', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    clipboard(writeText)

    const wrapper = mount(CopyButton, {
      props: { text: 'sk-123', copyLabel: 'Anahtarı kopyala', copiedLabel: 'Kopyalandı' },
    })

    await wrapper.trigger('click')
    await nextTick()
    expect(writeText).toHaveBeenCalledWith('sk-123')
    expect(wrapper.attributes('aria-label')).toBe('Kopyalandı')
    expect(wrapper.find('[role="status"]').text()).toBe('Kopyalandı')

    vi.advanceTimersByTime(2100)
    await nextTick()
    expect(wrapper.attributes('aria-label')).toBe('Anahtarı kopyala')
    vi.useRealTimers()
  })

  it('reports a refusal instead of failing silently', async () => {
    clipboard(vi.fn<() => Promise<void>>().mockRejectedValue(new Error('denied')))
    const wrapper = mount(CopyButton, {
      props: {
        text: 'sk-123',
        copyLabel: 'Kopyala',
        copiedLabel: 'Kopyalandı',
        errorLabel: 'Kopyalanamadı',
      },
    })

    await wrapper.trigger('click')
    await nextTick()

    expect(wrapper.emitted('failed')).toHaveLength(1)
    expect(wrapper.find('[role="status"]').text()).toBe('Kopyalanamadı')
  })
})

describe('BaseRating', () => {
  const valueLabel = (value: number, max: number) => `${max} üzerinden ${value}`

  it('is one control with the arrows, not five Tab stops', async () => {
    const wrapper = mount(BaseRating, {
      props: { label: 'Puanınız', valueLabel, modelValue: 3 },
    })

    expect(wrapper.attributes('role')).toBe('slider')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('aria-valuetext')).toBe('5 üzerinden 3')
    expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1)

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([4])

    await wrapper.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([5])
  })

  it('is an image with nothing to press when it only shows a score', () => {
    const wrapper = mount(BaseRating, {
      props: { label: 'Zorluk', valueLabel, modelValue: 4, readonly: true },
    })

    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('lets go of the score it already has', async () => {
    const wrapper = mount(BaseRating, { props: { label: 'Puanınız', valueLabel, modelValue: 3 } })

    await wrapper.findAll('button')[2]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([0])
  })
})

describe('FileDrop', () => {
  const props = {
    label: 'Dosyayı buraya bırakın',
    browseLabel: 'Gözat',
    removeLabel: 'Kaldır',
  }
  const file = (name: string, size: number) =>
    new File(['x'.repeat(size)], name, { type: 'text/plain' })

  it('is a real file input inside a label, so a keyboard can open it', () => {
    const wrapper = mount(FileDrop, { props })
    const input = wrapper.find('input[type="file"]')

    expect(input.exists()).toBe(true)
    expect(wrapper.find('label').attributes('for')).toBe(input.attributes('id'))
  })

  it('takes what is dropped, and refuses what is too large', async () => {
    const wrapper = mount(FileDrop, {
      props: { ...props, multiple: true, maxSize: 10, tooLargeLabel: 'Dosya çok büyük' },
    })

    const dropped = [file('small.txt', 4), file('huge.txt', 40)]
    await wrapper.find('label').trigger('drop', { dataTransfer: { files: dropped } })

    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toHaveLength(1)
    expect(wrapper.emitted('rejected')!.at(-1)![0]).toHaveLength(1)
    expect(wrapper.find('[role="alert"]').text()).toBe('Dosya çok büyük')
  })

  it('names each remove button after its own file', async () => {
    const wrapper = mount(FileDrop, {
      props: { ...props, modelValue: [file('receipt.pdf', 2048)] },
    })

    expect(wrapper.find('[aria-label="Kaldır: receipt.pdf"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('2 KB')

    await wrapper.find('[aria-label="Kaldır: receipt.pdf"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[]])
  })
})

describe('TagsInput', () => {
  const props = { label: 'Etiketler', removeLabel: (tag: string) => `${tag} etiketini kaldır` }

  it('commits on Enter and on a comma, and refuses the same tag twice', async () => {
    const wrapper = mount(TagsInput, { props: { ...props, modelValue: [] } })
    const field = wrapper.find('input')

    await field.setValue('design')
    await field.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['design']])

    await wrapper.setProps({ modelValue: ['design'] })
    await field.setValue('design')
    await field.trigger('keydown', { key: ',' })
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['design']])
  })

  it('takes the last one back on Backspace in an empty field', async () => {
    const wrapper = mount(TagsInput, { props: { ...props, modelValue: ['design', 'vue'] } })

    await wrapper.find('input').trigger('keydown', { key: 'Backspace' })

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['design']])
  })

  it('splits a pasted list into one tag each', async () => {
    const wrapper = mount(TagsInput, { props: { ...props, modelValue: [] } })

    const paste = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => 'vue, html\ncss' } })
    wrapper.find('input').element.dispatchEvent(paste)
    await nextTick()

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['vue', 'html', 'css']])
  })

  it('leaves a pasted single word in the field, caret and all', async () => {
    const wrapper = mount(TagsInput, { props: { ...props, modelValue: [] } })

    const paste = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => 'vue' } })
    wrapper.find('input').element.dispatchEvent(paste)
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('stops at the limit, and names every chip’s remove button', async () => {
    const wrapper = mount(TagsInput, { props: { ...props, modelValue: ['a', 'b'], max: 2 } })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-label="a etiketini kaldır"]').exists()).toBe(true)
  })
})
