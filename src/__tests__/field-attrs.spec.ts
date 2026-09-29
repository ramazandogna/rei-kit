import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BaseInput from '../components/BaseInput.vue'
import BaseTextarea from '../components/BaseTextarea.vue'
import PasswordInput from '../components/PasswordInput.vue'

/**
 * Where a caller's `class` lands on the three text fields.
 *
 * These are the only components that set `inheritAttrs: false` and bind the
 * rest of `$attrs` to their inner control, which is what makes `placeholder`
 * and `autocomplete` work at all. `class` used to go along with them, so
 * `class="mt-4"` — which every Vue developer writes meaning "space this
 * field" — put the margin on the input instead, below the label and inside
 * the field's own box. It looked almost right, which is why it survived.
 */

const FIELDS = [
  { name: 'BaseInput', component: BaseInput, control: 'input' },
  { name: 'BaseTextarea', component: BaseTextarea, control: 'textarea' },
  { name: 'PasswordInput', component: PasswordInput, control: 'input' },
] as const

describe.each(FIELDS)('$name', ({ component, control }) => {
  const props = { label: 'Label', toggleLabel: 'Show' }

  it('puts a class on the field, not on the control', () => {
    const wrapper = mount(component, { props, attrs: { class: 'mt-4' } })

    expect(wrapper.classes()).toContain('mt-4')
    expect(wrapper.get(control).classes()).not.toContain('mt-4')
  })

  it('puts a style on the field, not on the control', () => {
    const wrapper = mount(component, { props, attrs: { style: 'margin-top: 4px' } })

    expect(wrapper.attributes('style')).toContain('margin-top')
    expect(wrapper.get(control).attributes('style')).toBeUndefined()
  })

  it('still sends every other attribute to the control', () => {
    const wrapper = mount(component, {
      props,
      attrs: { class: 'mt-4', placeholder: 'Type here' },
    })

    expect(wrapper.get(control).attributes('placeholder')).toBe('Type here')
    expect(wrapper.attributes('placeholder')).toBeUndefined()
  })
})
