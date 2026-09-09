import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { RouterLinkStub } from '@vue/test-utils'

import {
  BaseButton,
  BaseCheckbox,
  BaseRadioGroup,
  BaseSelect,
  BaseTextarea,
  FormField,
} from '../index'

/**
 * The layer that was making every app write markup by hand.
 *
 * The kit had one button that could only ever be a `<button>`, and one form
 * control. Across three consumers that came to 136 hand-written `<button>`
 * elements, five `<select>`s, six `<textarea>`s and seven checkboxes — every
 * one of them a place where the kit's focus ring, its disabled state and its
 * error wiring had to be remembered rather than inherited.
 *
 * What is pinned here is the part that fails quietly: an element that is the
 * wrong element, a disabled link that is still clickable, a field whose error
 * is invisible to a screen reader.
 */
describe('BaseButton as an element', () => {
  it('is a button until told otherwise', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Kaydet' } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('becomes a real anchor rather than a button inside one', () => {
    // The bug this replaces: `<RouterLink><BaseButton>` renders an <a> around
    // a <button>. Invalid HTML, two stops in the tab order, two controls
    // announced for one thing on screen.
    const wrapper = mount(BaseButton, {
      props: { as: 'a', href: '/fiyatlandirma' },
      slots: { default: 'Fiyatlar' },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/fiyatlandirma')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('resolves router-link by name, so vue-router stays optional', () => {
    // Nothing in this component imports vue-router. An app that never passes
    // `as="router-link"` never needs it installed.
    const wrapper = mount(BaseButton, {
      props: { as: 'router-link', to: '/kurslar' },
      slots: { default: 'Kurslar' },
      global: { stubs: { 'router-link': RouterLinkStub } },
    })

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/kurslar')
  })

  it('takes the href away when a link is disabled', () => {
    // `disabled` is not a thing an anchor has. Left with its href it stays
    // focusable and activatable, so the attribute is removed outright -- which
    // is the whole of what disabled means for a link.
    const wrapper = mount(BaseButton, {
      props: { as: 'a', href: '/kurslar', disabled: true },
      slots: { default: 'Kurslar' },
    })

    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('does not put aria-disabled on a button, which has the real thing', () => {
    const wrapper = mount(BaseButton, { props: { disabled: true } })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
  })

  it('is square when it holds only an icon', () => {
    const wrapper = mount(BaseButton, { props: { icon: true, size: 'md' } })

    expect(wrapper.classes()).toContain('size-11')
    // Horizontal padding would stop it being square.
    expect(wrapper.classes().some((c) => c.startsWith('px-'))).toBe(false)
  })

  it('forwards the accessible name an icon button cannot do without', () => {
    const wrapper = mount(BaseButton, {
      props: { icon: true },
      attrs: { 'aria-label': 'Ayarlar' },
    })

    expect(wrapper.attributes('aria-label')).toBe('Ayarlar')
  })

  it('reports that it is working while it loads', () => {
    const wrapper = mount(BaseButton, { props: { loading: true } })

    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})

describe('FormField wiring', () => {
  it('points the label at the control it names', () => {
    const wrapper = mount(FormField, {
      props: { label: 'E-posta' },
      slots: { default: `<template #default="{ id }"><input :id="id" /></template>` },
    })

    const forAttr = wrapper.get('label').attributes('for')

    expect(forAttr).toBeTruthy()
    expect(wrapper.get('input').attributes('id')).toBe(forAttr)
  })

  it('describes the field by its error, not by its hint', () => {
    // Both at once buries the reason the field was rejected under advice the
    // reader has already had.
    const wrapper = mount(FormField, {
      props: { label: 'E-posta', hint: 'İş adresi olabilir', error: 'Geçerli değil' },
      slots: {
        default: `<template #default="{ describedBy }"><input :aria-describedby="describedBy" /></template>`,
      },
    })

    const describedBy = wrapper.get('input').attributes('aria-describedby')

    expect(wrapper.get(`#${describedBy}`).text()).toBe('Geçerli değil')
    expect(wrapper.text()).not.toContain('İş adresi olabilir')
  })

  it('keeps the label for assistive tech when it is hidden from the eye', () => {
    // Dropping it entirely would leave the control with no accessible name.
    const wrapper = mount(FormField, {
      props: { label: 'Ara', labelHidden: true },
      slots: { default: `<template #default="{ id }"><input :id="id" /></template>` },
    })

    expect(wrapper.get('label').classes()).toContain('sr-only')
    expect(wrapper.get('label').text()).toBe('Ara')
  })
})

describe('the controls built on it', () => {
  it('BaseSelect offers a placeholder nobody can choose', () => {
    // An empty option that can be selected lets someone go back to having
    // answered nothing, which no form wants.
    const wrapper = mount(BaseSelect, {
      props: {
        label: 'Para birimi',
        placeholder: 'Seçin',
        options: [
          { value: 'TRY', label: 'Türk lirası' },
          { value: 'JPY', label: 'Japon yeni' },
        ],
      },
    })

    const first = wrapper.findAll('option')[0]!

    expect(first.text()).toBe('Seçin')
    expect(first.attributes('disabled')).toBeDefined()
  })

  it('BaseTextarea carries the field wiring a bare textarea has to be given', () => {
    const wrapper = mount(BaseTextarea, {
      props: { label: 'Not', error: 'Çok uzun' },
    })

    expect(wrapper.get('textarea').attributes('aria-invalid')).toBe('true')
    const describedBy = wrapper.get('textarea').attributes('aria-describedby')
    expect(wrapper.get(`#${describedBy}`).text()).toBe('Çok uzun')
  })

  it('BaseCheckbox makes the words part of the hit target', () => {
    // On a phone, a 16px box on its own is the difference between a control
    // and a coin toss.
    const wrapper = mount(BaseCheckbox, { props: { label: 'Beni hatırla' } })

    expect(wrapper.get('label').attributes('for')).toBe(wrapper.get('input').attributes('id'))
    expect(wrapper.get('label').text()).toContain('Beni hatırla')
  })

  it('BaseRadioGroup names the question, not one of the answers', () => {
    // A label points at one element; what is being named here is the question.
    // Left as a label, a screen reader reads the options with no idea what
    // they are options for.
    const wrapper = mount(BaseRadioGroup, {
      props: {
        legend: 'Tema',
        options: [
          { value: 'light', label: 'Açık' },
          { value: 'dark', label: 'Koyu' },
        ],
      },
    })

    expect(wrapper.element.tagName).toBe('FIELDSET')
    expect(wrapper.get('legend').text()).toBe('Tema')
  })

  it('BaseRadioGroup keeps its radios in one group', () => {
    // Without a shared name they are independent checkboxes that look round.
    const wrapper = mount(BaseRadioGroup, {
      props: {
        legend: 'Tema',
        options: [
          { value: 'light', label: 'Açık' },
          { value: 'dark', label: 'Koyu' },
        ],
      },
    })

    const names = wrapper.findAll('input').map((input) => input.attributes('name'))

    expect(new Set(names).size).toBe(1)
    expect(names[0]).toBeTruthy()
  })
})
