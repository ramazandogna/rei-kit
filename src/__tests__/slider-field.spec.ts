import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { SliderField } from '../index'

/**
 * A slider and a number field on one value.
 *
 * What is worth testing is that they really are one value — a pair where
 * dragging moves the slider and typing moves the field, each keeping its own
 * idea of the number, is the bug this component exists to stop apps writing.
 *
 * The field is a `spinbutton` rather than an `input[type="number"]`: see
 * `NumberInput.vue` for why. So it is found by its role, not by its type.
 */
const build = (props: Record<string, unknown> = {}) =>
  mount(SliderField, {
    props: {
      label: 'Opacity',
      decrementLabel: 'Less',
      incrementLabel: 'More',
      modelValue: 40,
      min: 0,
      max: 100,
      ...props,
    },
    attachTo: document.body,
  })

describe('SliderField', () => {
  it('shows the same number in both controls', () => {
    const w = build()

    expect((w.find('input[type="range"]').element as HTMLInputElement).value).toBe('40')
    expect((w.find('[role="spinbutton"]').element as HTMLInputElement).value).toBe('40')
  })

  it('moves together, whichever one was used', async () => {
    const dragged = build()
    await dragged.find('input[type="range"]').setValue('70')
    expect(dragged.emitted('update:modelValue')!.at(-1)).toEqual([70])

    const typed = build()
    const field = typed.find('[role="spinbutton"]')
    await field.setValue('12')
    // The field commits on leaving it: typing is free on the way there.
    await field.trigger('blur')
    expect(typed.emitted('update:modelValue')!.at(-1)).toEqual([12])
  })

  it('gives both controls the same name, because they are one answer', () => {
    const w = build()
    const labels = w.findAll('label').map((one) => one.text())

    // Two controls, one name. Two different names would say they were two
    // settings that happen to sit together.
    expect(labels.filter((text) => text === 'Opacity')).toHaveLength(2)
  })

  it('leaves the reading to the number field', () => {
    // The slider's own readout is off: two copies of the same number, one of
    // them not editable, is one too many.
    expect(build().find('output').exists()).toBe(false)
  })

  it('passes the range to both, so neither can leave it', async () => {
    const w = build({ min: 10, max: 60, step: 5 })
    const range = w.find('input[type="range"]').element as HTMLInputElement
    const field = w.find('[role="spinbutton"]')

    expect([range.min, range.max, range.step]).toEqual(['10', '60', '5'])
    expect(field.attributes('aria-valuemin')).toBe('10')
    expect(field.attributes('aria-valuemax')).toBe('60')

    // And it is a real limit, not only something said out loud.
    await field.setValue('500')
    await field.trigger('blur')
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([60])
  })

  it('keeps the thumb where it was when the field is emptied', async () => {
    const w = build()
    const field = w.find('[role="spinbutton"]')

    await field.setValue('')
    await field.trigger('blur')

    // Halfway through typing a number there is no number, but a slider has
    // no empty state -- the thumb is always somewhere. Dragging it to zero
    // the moment the last digit is deleted is the wrong answer.
    const emitted = w.emitted('update:modelValue')
    expect(emitted?.at(-1)).not.toEqual([undefined])
    expect((w.find('input[type="range"]').element as HTMLInputElement).value).toBe('40')
  })

  it('speaks the value rather than reading a bare number', () => {
    const w = build({ format: (value: number) => `${value} percent` })

    // Without this a screen reader says "40", and a number with no unit is
    // not an answer to anything.
    expect(w.find('input[type="range"]').attributes('aria-valuetext')).toBe('40 percent')
  })

  it('disables both halves at once', () => {
    const w = build({ disabled: true })

    // Half a disabled control is a control that is not disabled.
    expect(w.find('input[type="range"]').attributes('disabled')).toBeDefined()
    expect(w.find('[role="spinbutton"]').attributes('disabled')).toBeDefined()
  })
})
