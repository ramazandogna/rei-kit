import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import PasswordInput from '../components/PasswordInput.vue'

/**
 * A password field's whole subject is a value the person typing it cannot
 * see, so every test here is about the one control that changes that — and
 * about the three ways it is usually built wrong, each of which compiles,
 * renders and looks finished.
 */
function build(props: Record<string, unknown> = {}) {
  return mount(PasswordInput, {
    props: { label: 'Parola', toggleLabel: 'Parolayı göster', ...props },
    attachTo: document.body,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('PasswordInput', () => {
  it('hides the value until it is asked not to', () => {
    const wrapper = build()

    expect(wrapper.get('input').attributes('type')).toBe('password')
  })

  it('shows it, and hides it again', async () => {
    const wrapper = build()
    const toggle = wrapper.get('button')

    await toggle.trigger('click')
    expect(wrapper.get('input').attributes('type')).toBe('text')

    await toggle.trigger('click')
    expect(wrapper.get('input').attributes('type')).toBe('password')
  })

  /*
   * The most expensive of the three, because it looks like it works: inside
   * a form, a `<button>` with no `type` defaults to `submit`, so looking at
   * the password submits the form with the password half typed.
   */
  it('does not submit the form it is in', async () => {
    const form = document.createElement('form')
    document.body.append(form)

    let submitted = false
    form.addEventListener('submit', () => (submitted = true))

    const wrapper = mount(PasswordInput, {
      props: { label: 'Parola', toggleLabel: 'Parolayı göster' },
      attachTo: form,
    })

    expect(wrapper.get('button').attributes('type')).toBe('button')

    await wrapper.get('button').trigger('click')
    expect(submitted).toBe(false)
  })

  /*
   * A toggle button rather than a name that swaps: the state is what a
   * screen reader reads out when the control it is on changes under it, and
   * a name that changes without focus moving is not reliably re-read.
   */
  it('is a toggle button whose name does not change', async () => {
    const wrapper = build()
    const toggle = wrapper.get('button')

    expect(toggle.attributes('aria-pressed')).toBe('false')
    expect(toggle.attributes('aria-label')).toBe('Parolayı göster')

    await toggle.trigger('click')

    expect(toggle.attributes('aria-pressed')).toBe('true')
    expect(toggle.attributes('aria-label')).toBe('Parolayı göster')
  })

  it('keeps focus on the toggle, so a second press is one key away', async () => {
    const wrapper = build()
    const toggle = wrapper.get('button').element as HTMLButtonElement

    toggle.focus()
    await wrapper.get('button').trigger('click')

    expect(document.activeElement).toBe(toggle)
  })

  it('says which way it went', async () => {
    const wrapper = build()

    await wrapper.get('button').trigger('click')
    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('toggle')).toEqual([[true], [false]])
  })

  it('carries the value both ways', async () => {
    const wrapper = build({ modelValue: 'onceki' })
    const input = wrapper.get('input')

    expect((input.element as HTMLInputElement).value).toBe('onceki')

    await input.setValue('yeni')
    expect(wrapper.emitted('update:modelValue')).toEqual([['yeni']])
  })

  it('keeps the value across a reveal', async () => {
    const wrapper = build({ modelValue: 'gizli' })

    await wrapper.get('button').trigger('click')

    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('gizli')
  })

  it('is named by a real label, pointed at the field', () => {
    const wrapper = build()
    const label = wrapper.get('label')

    expect(label.text()).toBe('Parola')
    expect(label.attributes('for')).toBe(wrapper.get('input').attributes('id'))
  })

  it('takes a fieldId, so an ErrorSummary can link to it', () => {
    const wrapper = build({ fieldId: 'password' })

    expect(wrapper.get('input').attributes('id')).toBe('password')
  })

  it('reads its error out with the field rather than beside it', () => {
    const wrapper = build({ error: 'Çok kısa' })
    const input = wrapper.get('input')

    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(`${input.attributes('id')}-error`)
    expect(wrapper.text()).toContain('Çok kısa')
  })

  /* The reason the component takes native attributes at all: without this,
     a browser offers to save the wrong thing, or nothing. */
  it('passes native attributes to the input, not to the wrapper', () => {
    const wrapper = build({ autocomplete: 'new-password' })

    expect(wrapper.get('input').attributes('autocomplete')).toBe('new-password')
    expect(wrapper.element.getAttribute('autocomplete')).toBe(null)
  })

  /* A revealed password is plain text in a text field, which is where a
     phone starts capitalising and underlining it in red. */
  it('does not let the phone tidy up a password it can now see', () => {
    const input = build().get('input')

    expect(input.attributes('autocapitalize')).toBe('none')
    expect(input.attributes('spellcheck')).toBe('false')
  })
})
