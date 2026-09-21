import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import ErrorSummary from '../components/ErrorSummary.vue'

/**
 * The failure this exists for is the quietest one a form has: the submit
 * button was pressed, the form was rejected, and focus is still on the
 * button. Nothing was announced, and the first rejected field may be a
 * screenful away.
 */
const ERRORS = { email: 'Geçersiz e-posta', password: 'Çok kısa' }

function field(id: string) {
  const input = document.createElement('input')
  input.id = id
  document.body.append(input)

  return input
}

function mountSummary(props: Record<string, unknown> = {}) {
  return mount(ErrorSummary, {
    props: {
      errors: ERRORS,
      title: 'Düzeltilmesi gereken 2 alan var',
      labelFor: (name: string) => ({ email: 'E-posta', password: 'Parola' })[name] ?? name,
      ...props,
    },
    attachTo: document.body,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ErrorSummary', () => {
  it('renders nothing at all when the form is valid', () => {
    const wrapper = mountSummary({ errors: {} })

    expect(wrapper.find('.rk-errsum').exists()).toBe(false)
  })

  it('lists one link per rejected field, with its message', () => {
    const wrapper = mountSummary()
    const links = wrapper.findAll('.rk-errsum-link')

    expect(links).toHaveLength(2)
    expect(links[0]!.text()).toBe('E-posta: Geçersiz e-posta')
    expect(links[0]!.attributes('href')).toBe('#email')
  })

  it('takes focus when the form is first rejected', async () => {
    const wrapper = mount(ErrorSummary, {
      props: {
        errors: {} as Record<string, string>,
        title: 'Hata',
        labelFor: (name: string) => name,
      },
      attachTo: document.body,
    })

    await wrapper.setProps({ errors: ERRORS })
    await nextTick()
    await nextTick()

    // Focused rather than `role="alert"`: an alert reads the list at a
    // reader whose focus is still on a button they cannot use.
    expect(document.activeElement).toBe(wrapper.get('.rk-errsum').element)
  })

  it('does not drag focus back while the reader is fixing a field', async () => {
    const wrapper = mount(ErrorSummary, {
      props: {
        errors: {} as Record<string, string>,
        title: 'Hata',
        labelFor: (name: string) => name,
      },
      attachTo: document.body,
    })
    const input = field('email')

    await wrapper.setProps({ errors: ERRORS })
    await nextTick()
    await nextTick()

    input.focus()
    // A form that re-validates as you type would otherwise pull focus out
    // of the field on every keystroke.
    await wrapper.setProps({ errors: { email: 'Hâlâ geçersiz' } })
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(input)
  })

  it('focuses again when the app asks, which is what a second submit is', async () => {
    const wrapper = mountSummary()
    const input = field('email')
    input.focus()

    ;(wrapper.vm as unknown as { focus: () => void }).focus()

    expect(document.activeElement).toBe(wrapper.get('.rk-errsum').element)
  })

  it('arms itself again once the form has been put right', async () => {
    const wrapper = mount(ErrorSummary, {
      props: {
        errors: {} as Record<string, string>,
        title: 'Hata',
        labelFor: (name: string) => name,
      },
      attachTo: document.body,
    })

    await wrapper.setProps({ errors: ERRORS })
    await nextTick()
    await nextTick()

    await wrapper.setProps({ errors: {} })
    await nextTick()
    document.body.focus()

    await wrapper.setProps({ errors: ERRORS })
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(wrapper.get('.rk-errsum').element)
  })

  it('moves focus to the field, not just the page position', async () => {
    const wrapper = mountSummary()
    const input = field('email')

    await wrapper.findAll('.rk-errsum-link')[0]!.trigger('click')

    // A fragment alone scrolls and leaves focus behind, which is the same
    // fault `SkipLink` exists for.
    expect(document.activeElement).toBe(input)
  })

  it('leaves the link alone when the field is not on the page', async () => {
    const wrapper = mountSummary()

    // Nothing to focus, so the browser's own fragment handling still runs
    // rather than the link swallowing the press.
    const event = await wrapper.findAll('.rk-errsum-link')[0]!.trigger('click')

    expect(event).toBeUndefined()
  })

  it('uses the ids the app gave its fields', () => {
    const wrapper = mountSummary({ fieldId: (name: string) => `signup-${name}` })

    expect(wrapper.findAll('.rk-errsum-link')[0]!.attributes('href')).toBe('#signup-email')
  })

  it('reads them in the order the form is in when told', () => {
    const wrapper = mountSummary({ fields: ['password', 'email'] })
    const links = wrapper.findAll('.rk-errsum-link')

    // A list that reads bottom to top sends the reader up and down the form
    // instead of through it.
    expect(links[0]!.text()).toContain('Parola')
    expect(links[1]!.text()).toContain('E-posta')
  })

  it('skips a named field that has no error', () => {
    const wrapper = mountSummary({ fields: ['email', 'name', 'password'] })

    expect(wrapper.findAll('.rk-errsum-link')).toHaveLength(2)
  })

  it('is a focus stop itself, and not one anybody can Tab into', () => {
    const wrapper = mountSummary()

    // `-1`: the app moves focus here, Tab never lands on it by accident.
    expect(wrapper.get('.rk-errsum').attributes('tabindex')).toBe('-1')
  })
})
