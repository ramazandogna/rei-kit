import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import { BaseInput, BaseRadioGroup, BaseTextarea } from '../index'

/**
 * The three fields whose `v-model` is written by hand (`use-bound-value.ts`),
 * because `defineModel` could not both accept `undefined` and emit only what
 * a field produces. These hold them to what `defineModel` did.
 */
describe('a hand-written v-model', () => {
  it('keeps its own value when nothing is bound', async () => {
    const wrapper = mount(BaseTextarea, { props: { label: 'Not' } })
    const field = wrapper.find('textarea')

    await field.setValue('bugün')

    expect((field.element as HTMLTextAreaElement).value).toBe('bugün')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['bugün'])
  })

  it('follows what the parent binds, including undefined', async () => {
    const value = ref<string | undefined>(undefined)
    const wrapper = mount(
      defineComponent(
        () => () =>
          h(BaseInput, {
            label: 'Ad',
            modelValue: value.value,
            'onUpdate:modelValue': (next: string) => (value.value = next),
          }),
      ),
    )
    const field = wrapper.find('input')

    await field.setValue('Aiko')
    expect(value.value).toBe('Aiko')

    value.value = 'Kenji'
    await nextTick()
    expect((field.element as HTMLInputElement).value).toBe('Kenji')
  })

  it('still honours .trim, which Vue applies to the event', async () => {
    const value = ref('')
    const wrapper = mount(
      defineComponent(
        () => () =>
          h(BaseInput, {
            label: 'Ad',
            modelValue: value.value,
            modelModifiers: { trim: true },
            'onUpdate:modelValue': (next: string) => (value.value = next),
          }),
      ),
    )

    await wrapper.find('input').setValue('  Aiko  ')

    expect(value.value).toBe('Aiko')
  })

  it('emits the chosen option from a radio group', async () => {
    const wrapper = mount(BaseRadioGroup, {
      props: {
        legend: 'Plan',
        options: [
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ],
      },
    })

    await wrapper.findAll('input')[1]!.setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['yearly'])
  })
})
