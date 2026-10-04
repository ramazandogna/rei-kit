import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { BaseCheckboxGroup } from '../index'

/**
 * The group that sat between a radio group and a listbox.
 *
 * Four or five boxes under one question is the commonest form control there
 * is, and the kit had the single box and the set of radios but not this —
 * so an app wrote the fieldset, the legend, the array arithmetic and the
 * select-all by hand, every time.
 *
 * What is pinned here is the part that fails quietly: a legend that is a
 * heading instead, a select-all that reaches a box the form has ruled out,
 * and a model mutated in place rather than replaced.
 */
const WEEKDAYS = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'fri', label: 'Friday', disabled: true },
] as const

function group(props: Record<string, unknown> = {}) {
  return mount(BaseCheckboxGroup, {
    props: { legend: 'Remind me on', options: WEEKDAYS, ...props },
  })
}

describe('BaseCheckboxGroup', () => {
  it('names the question rather than one of the answers', () => {
    const wrapper = group()

    expect(wrapper.element.tagName).toBe('FIELDSET')
    expect(wrapper.get('legend').text()).toBe('Remind me on')
  })

  it('keeps the legend as the accessible name when it is hidden', () => {
    const wrapper = group({ legendHidden: true })

    expect(wrapper.get('legend').classes()).toContain('sr-only')
    expect(wrapper.get('legend').text()).toBe('Remind me on')
  })

  it('adds a value without touching the array it was given', () => {
    /* Frozen on purpose: a component that pushes onto the parent's array
       changes it without an emit, which works until the parent watches it. */
    const chosen = Object.freeze(['mon'])
    const wrapper = group({ modelValue: chosen })

    wrapper.findAll('input[type="checkbox"]')[1]!.setValue(true)

    expect(wrapper.emitted('update:modelValue')![0]![0]).toEqual(['mon', 'tue'])
    expect(chosen).toEqual(['mon'])
  })

  it('removes a value by rewriting the list', async () => {
    const wrapper = group({ modelValue: ['mon', 'tue'] })

    await wrapper.findAll('input[type="checkbox"]')[0]!.setValue(false)

    expect(wrapper.emitted('update:modelValue')![0]![0]).toEqual(['tue'])
  })

  it('has no select-all until it is named', () => {
    expect(group().findAll('input[type="checkbox"]')).toHaveLength(3)
    expect(
      group({ selectAllLabel: 'Every weekday' }).findAll('input[type="checkbox"]'),
    ).toHaveLength(4)
  })

  it('select-all leaves a disabled option alone, in both directions', async () => {
    const wrapper = group({ selectAllLabel: 'Every weekday', modelValue: [] })
    const all = wrapper.findAll('input[type="checkbox"]')[0]!

    await all.setValue(true)

    /* Friday is disabled: pressing "every weekday" is not a way to choose
       what the form has ruled out. */
    expect(wrapper.emitted('update:modelValue')![0]![0]).toEqual(['mon', 'tue'])
  })

  it('select-all keeps a disabled option that is already chosen', async () => {
    /* Everything choosable plus the disabled Friday, so the select-all is
       checked and clearing it is a real press. */
    const wrapper = group({ selectAllLabel: 'Every weekday', modelValue: ['mon', 'tue', 'fri'] })

    await wrapper.findAll('input[type="checkbox"]')[0]!.setValue(false)

    expect(wrapper.emitted('update:modelValue')![0]![0]).toEqual(['fri'])
  })

  it('stands for the rest while only some of them are chosen', () => {
    const partly = group({ selectAllLabel: 'Every weekday', modelValue: ['mon'] })
    const box = partly.findAll('input[type="checkbox"]')[0]!.element as HTMLInputElement

    /* The property no markup can set, and the half every hand-written
       select-all drops: neither on nor off, because some of them are. */
    expect(box.indeterminate).toBe(true)
    expect(box.checked).toBe(false)
  })

  it('is checked rather than indeterminate once every choosable one is chosen', () => {
    const wrapper = group({ selectAllLabel: 'Every weekday', modelValue: ['mon', 'tue'] })
    const box = wrapper.findAll('input[type="checkbox"]')[0]!.element as HTMLInputElement

    expect(box.checked).toBe(true)
    expect(box.indeterminate).toBe(false)
  })

  it('reports an error on the group, where a reader of any one box hears it', () => {
    const wrapper = group({ error: 'Choose at least one day.' })

    expect(wrapper.attributes('aria-invalid')).toBe('true')
    const described = wrapper.attributes('aria-describedby')!
    expect(wrapper.get(`#${described}`).text()).toBe('Choose at least one day.')
  })

  it('disables every box at once, select-all included', () => {
    const wrapper = group({ selectAllLabel: 'Every weekday', disabled: true })

    expect(
      wrapper
        .findAll('input[type="checkbox"]')
        .every((box) => (box.element as HTMLInputElement).disabled),
    ).toBe(true)
  })
})
