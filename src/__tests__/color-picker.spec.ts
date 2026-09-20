import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { ColorPicker } from '../index'

/**
 * A colour, as a hex value.
 *
 * Two things are worth holding down. One is the contract: `#abc` and
 * `#AABBCC` are the same colour spelled differently, and an app that has to
 * compare two spellings has been handed a problem rather than a value. The
 * other is that typing is allowed to be wrong on the way — rewriting the
 * field on every keystroke makes the third character impossible to type,
 * which is the bug every hand-written hex field has.
 */
const SWATCHES = [
  { value: '#6b4de6', label: 'Purple' },
  { value: '#2FA36B', label: 'Green' },
] as const

const build = (props: Record<string, unknown> = {}) =>
  mount(ColorPicker, {
    props: { label: 'Brand colour', modelValue: '#6b4de6', ...props },
    attachTo: document.body,
  })

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ColorPicker', () => {
  it('is the platform’s own picker, painted', () => {
    const w = build()
    const native = w.find('input[type="color"]')

    // Not a hand-built colour wheel: the native one has the eyedropper, the
    // keyboard and, on a phone, a full-screen control no page matches.
    expect(native.exists()).toBe(true)
    expect((native.element as HTMLInputElement).value).toBe('#6b4de6')
  })

  it('hands back one spelling, whatever it was given', async () => {
    const w = build({ modelValue: '#ABC' })
    const native = w.find('input[type="color"]')

    // Short hex and capitals both mean the same colour; the value is always
    // the long lowercase one, the way a date is always YYYY-MM-DD.
    expect((native.element as HTMLInputElement).value).toBe('#aabbcc')

    await native.setValue('#2FA36B')
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['#2fa36b'])
  })

  it('has no hex field until it is told what to call one', () => {
    expect(build().find('input[type="text"]').exists()).toBe(false)

    const named = build({ hexLabel: 'Hex' })
    expect(named.find('input[type="text"]').attributes('aria-label')).toBe('Hex')
  })

  it('lets the hex field be wrong while it is being typed in', async () => {
    const w = build({ hexLabel: 'Hex' })
    const hex = w.find('input[type="text"]')

    await hex.setValue('#ab')
    // Halfway through a colour there is no colour. Rewriting the field here
    // is what makes the third character impossible to type.
    expect(w.emitted('update:modelValue')).toBeUndefined()
    expect((hex.element as HTMLInputElement).value).toBe('#ab')

    await hex.setValue('#abc')
    await hex.trigger('blur')
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['#aabbcc'])
  })

  it('puts back the real colour when the field is left unreadable', async () => {
    const w = build({ hexLabel: 'Hex' })
    const hex = w.find('input[type="text"]')

    await hex.setValue('not a colour')
    await hex.trigger('blur')

    // A field that says one thing while the colour is another is worse than
    // a field that corrects itself.
    expect((hex.element as HTMLInputElement).value).toBe('#6b4de6')
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('offers the app’s swatches, by the app’s names', async () => {
    const w = build({ swatches: SWATCHES })
    const buttons = w.findAll('.rk-color-swatch')

    // The kit ships no colours of its own: a row of them would be a product
    // decision, and unnamed ones would be buttons a screen reader reads as
    // nothing at all.
    expect(buttons.map((one) => one.attributes('aria-label'))).toEqual(['Purple', 'Green'])

    await buttons[1]!.trigger('click')
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['#2fa36b'])
  })

  it('says which swatch is the current one, spelling aside', () => {
    const w = build({ modelValue: '#2FA36B', swatches: SWATCHES })
    const pressed = w.findAll('.rk-color-swatch').map((one) => one.attributes('aria-pressed'))

    expect(pressed).toEqual(['false', 'true'])
  })

  it('disables every part of itself at once', () => {
    const w = build({ swatches: SWATCHES, hexLabel: 'Hex', disabled: true })

    expect(w.find('input[type="color"]').attributes('disabled')).toBeDefined()
    expect(w.find('input[type="text"]').attributes('disabled')).toBeDefined()
    expect(w.find('.rk-color-swatch').attributes('disabled')).toBeDefined()
  })

  it('carries its label, its hint and its error like any other field', () => {
    const w = build({ hint: 'Used for buttons and links.' })
    expect(w.text()).toContain('Brand colour')
    expect(w.text()).toContain('Used for buttons and links.')

    const bad = build({ error: 'Too light to read on white.' })
    expect(bad.find('input[type="color"]').attributes('aria-invalid')).toBe('true')
    expect(bad.text()).toContain('Too light to read on white.')
  })
})
