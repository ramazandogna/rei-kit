import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import {
  BasePopover,
  BaseStepper,
  CircularProgress,
  NumberInput,
  PinInput,
  ToggleGroup,
} from '../index'

/**
 * The first wave of parts the kit was missing: a popover, a toggle group, a
 * number field, a code field, a ring and a stepper.
 *
 * Each is held to the keyboard pattern it claims, because that is the part
 * that compiles, renders and is wrong: a toggle group that takes twelve Tabs
 * to cross, a number field that settles on 0.30000000000000004, a code field
 * that fires "complete" twice.
 */

afterEach(() => {
  document.body.innerHTML = ''
})

describe('BasePopover', () => {
  const build = () =>
    mount(BasePopover, {
      props: { label: 'Filtreler' },
      attachTo: document.body,
      slots: {
        trigger: `<template #trigger="{ props }"><button class="opener" v-bind="props">Aç</button></template>`,
        default: `<template #default="{ close }"><input class="inside" /><button class="done" @click="close">Tamam</button></template>`,
      },
    })

  it('hands its trigger the attributes that describe it', async () => {
    const wrapper = build()
    const opener = wrapper.find('.opener')

    expect(opener.attributes('aria-expanded')).toBe('false')
    expect(opener.attributes('aria-haspopup')).toBe('dialog')

    await opener.trigger('click')
    expect(opener.attributes('aria-expanded')).toBe('true')
    const panel = wrapper.find('[role="dialog"]')
    expect(panel.attributes('aria-label')).toBe('Filtreler')
    expect(opener.attributes('aria-controls')).toBe(panel.attributes('id'))
    wrapper.unmount()
  })

  it('moves focus in on open, and back to the trigger on Escape', async () => {
    const wrapper = build()
    await wrapper.find('.opener').trigger('click')
    await nextTick()

    expect(document.activeElement).toBe(wrapper.find('.inside').element)

    await wrapper.find('.inside').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(wrapper.find('.opener').element)
    wrapper.unmount()
  })

  it('closes on a click outside, and from inside through `close`', async () => {
    const wrapper = build()
    await wrapper.find('.opener').trigger('click')
    await nextTick()

    await wrapper.find('.done').trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    await wrapper.find('.opener').trigger('click')
    await nextTick()
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('ToggleGroup', () => {
  const options = [
    { value: 'bold', label: 'Kalın' },
    { value: 'italic', label: 'İtalik' },
    { value: 'strike', label: 'Üstü çizili', disabled: true },
    { value: 'code', label: 'Kod' },
  ] as const

  it('presses one at a time, and lets go of the pressed one', async () => {
    const wrapper = mount(ToggleGroup, {
      props: { options, label: 'Biçim', modelValue: undefined },
    })
    const buttons = wrapper.findAll('button')

    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['bold'])

    await wrapper.setProps({ modelValue: 'bold' })
    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([undefined])
  })

  it('holds the last one down when required', async () => {
    const wrapper = mount(ToggleGroup, {
      props: { options, label: 'Biçim', modelValue: 'bold', required: true },
    })

    await wrapper.findAll('button')[0]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('keeps several down in multiple mode, in the order of the options', async () => {
    const wrapper = mount(ToggleGroup, {
      props: { options, label: 'Biçim', mode: 'multiple', modelValue: ['code'] },
    })

    await wrapper.findAll('button')[0]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['bold', 'code']])
  })

  it('is one Tab stop, crossed with the arrows, skipping what is disabled', async () => {
    const wrapper = mount(ToggleGroup, {
      props: { options, label: 'Biçim', modelValue: 'italic' },
      attachTo: document.body,
    })
    const buttons = wrapper.findAll('button')

    expect(buttons.map((b) => b.attributes('tabindex'))).toEqual(['-1', '0', '-1', '-1'])
    expect(buttons[1]!.attributes('aria-pressed')).toBe('true')

    await buttons[1]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[3]!.element)

    await buttons[3]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[0]!.element)
    wrapper.unmount()
  })
})

describe('NumberInput', () => {
  const labels = { label: 'Adet', decrementLabel: 'Azalt', incrementLabel: 'Artır' }

  function harness(initial: number | undefined, props: Record<string, unknown> = {}) {
    const value = ref(initial)
    const wrapper = mount(
      defineComponent(
        () => () =>
          h(NumberInput, {
            ...labels,
            ...props,
            modelValue: value.value,
            'onUpdate:modelValue': (next: number | undefined) => (value.value = next),
          }),
      ),
    )

    return { value, wrapper, field: wrapper.find('input') }
  }

  it('is a spin button with its limits stated', () => {
    const { field } = harness(3, { min: 0, max: 10 })

    expect(field.attributes('role')).toBe('spinbutton')
    expect(field.attributes('aria-valuenow')).toBe('3')
    expect(field.attributes('aria-valuemin')).toBe('0')
    expect(field.attributes('aria-valuemax')).toBe('10')
  })

  it('steps with the arrows and pages, and stops at the limits', async () => {
    const { value, field } = harness(3, { min: 0, max: 10 })

    await field.trigger('keydown', { key: 'ArrowUp' })
    expect(value.value).toBe(4)
    await field.trigger('keydown', { key: 'PageUp' })
    expect(value.value).toBe(10)
    await field.trigger('keydown', { key: 'Home' })
    expect(value.value).toBe(0)
  })

  it('rounds to the step, so 0.1 and 0.2 make 0.3', async () => {
    const { value, field } = harness(0.1, { step: 0.1 })

    await field.trigger('keydown', { key: 'ArrowUp' })

    expect(value.value).toBe(0.2)
    await field.trigger('keydown', { key: 'ArrowUp' })
    expect(value.value).toBe(0.3)
  })

  it('lets a number be half typed, and settles it on leaving', async () => {
    const { value, field } = harness(undefined, { min: 1, max: 99 })

    await field.setValue('1,5')
    expect(value.value).toBe(1.5)

    await field.setValue('250')
    await field.trigger('blur')
    expect(value.value).toBe(99)
    expect((field.element as HTMLInputElement).value).toBe('99')

    await field.setValue('')
    expect(value.value).toBeUndefined()
  })

  it('names its buttons with the words it was given, and disables them at the limits', () => {
    const wrapper = mount(NumberInput, { props: { ...labels, modelValue: 10, max: 10 } })
    const plus = wrapper.find('[aria-label="Artır"]')

    expect(plus.attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-label="Azalt"]').attributes('disabled')).toBeUndefined()
  })
})

describe('PinInput', () => {
  const props = {
    label: 'Doğrulama kodu',
    length: 4,
    cellLabel: (n: number, total: number) => `${n}. hane, ${total} haneden`,
  }

  function harness() {
    const code = ref('')
    const completed: string[] = []
    const wrapper = mount(
      defineComponent(
        () => () =>
          h(PinInput, {
            ...props,
            modelValue: code.value,
            'onUpdate:modelValue': (next: string) => (code.value = next),
            onComplete: (value: string) => completed.push(value),
          }),
      ),
      { attachTo: document.body },
    )

    return { code, completed, wrapper, cells: () => wrapper.findAll('input') }
  }

  it('names every box, and lets a phone fill the first one', () => {
    const wrapper = mount(PinInput, { props })
    const cells = () => wrapper.findAll('input')

    expect(cells()).toHaveLength(4)
    expect(cells()[2]!.attributes('aria-label')).toBe('3. hane, 4 haneden')
    expect(cells()[0]!.attributes('autocomplete')).toBe('one-time-code')
    expect(cells()[0]!.attributes('maxlength')).toBeUndefined()
  })

  it('moves on as it is typed into, and ignores what is not a digit', async () => {
    const { code, cells } = harness()

    await cells()[0]!.setValue('4')
    await cells()[1]!.setValue('x')
    expect(code.value).toBe('4')
    expect(document.activeElement).toBe(cells()[1]!.element)
  })

  it('takes a pasted code whole, and says so once', async () => {
    const { code, completed, cells } = harness()

    const paste = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '48 29' } })
    cells()[0]!.element.dispatchEvent(paste)
    await nextTick()

    expect(code.value).toBe('4829')
    expect(completed).toEqual(['4829'])

    // Changing a digit of a complete code does not complete it again.
    await cells()[3]!.setValue('1')
    expect(completed).toEqual(['4829'])
  })

  it('goes back on Backspace', async () => {
    const { code, cells } = harness()
    await cells()[0]!.setValue('4')
    await cells()[1]!.setValue('8')

    await cells()[2]!.trigger('keydown', { key: 'Backspace' })

    expect(code.value).toBe('4')
    expect(document.activeElement).toBe(cells()[1]!.element)
  })
})

describe('CircularProgress', () => {
  it('states how far, clamped, as a percentage', () => {
    const wrapper = mount(CircularProgress, {
      props: { value: 150, max: 100, label: 'Yükleme', showValue: true },
    })
    const ring = wrapper.find('[role="progressbar"]')

    expect(ring.attributes('aria-valuenow')).toBe('100')
    expect(ring.attributes('aria-label')).toBe('Yükleme')
    expect(wrapper.text()).toBe('100%')
  })

  it('claims no amount while it has none', () => {
    const wrapper = mount(CircularProgress, { props: { label: 'Yükleniyor', showValue: true } })
    const ring = wrapper.find('[role="progressbar"]')

    expect(ring.attributes('aria-valuenow')).toBeUndefined()
    expect(ring.classes()).toContain('is-indeterminate')
    expect(wrapper.text()).toBe('')
  })
})

describe('BaseStepper', () => {
  const steps = [
    { key: 'account', label: 'Hesap' },
    { key: 'plan', label: 'Plan' },
    { key: 'pay', label: 'Ödeme' },
  ] as const

  it('marks the current step, and says what the done ones are in the words given', () => {
    const wrapper = mount(BaseStepper, {
      props: {
        steps,
        label: 'Kayıt',
        modelValue: 'plan',
        stateLabels: { complete: 'tamamlandı', error: 'düzeltilmeli' },
      },
    })
    const items = wrapper.findAll('li')

    expect(wrapper.find('nav').attributes('aria-label')).toBe('Kayıt')
    expect(items[1]!.attributes('aria-current')).toBe('step')
    expect(items[0]!.find('.sr-only').text()).toContain('tamamlandı')
  })

  it('goes back to a finished step when interactive, never ahead', async () => {
    const wrapper = mount(BaseStepper, {
      props: { steps, label: 'Kayıt', modelValue: 'plan', interactive: true },
    })

    expect(wrapper.findAll('button')).toHaveLength(1)
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['account']])
  })
})
