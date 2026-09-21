import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import SkipLink from '../web/SkipLink.vue'

/**
 * The failure this component exists to prevent is invisible: an `<a>`
 * pointing at `#main` scrolls the page and, in most browsers, leaves focus
 * on itself — still inside the header the reader asked to skip. It looks
 * like it worked, and the next Tab lands on the second nav item.
 */
const wrappers: { unmount: () => void }[] = []

function mountLink(target = 'main') {
  const main = document.createElement('main')
  main.id = 'main'
  document.body.append(main)

  const wrapper = mount(SkipLink, {
    props: { for: target, label: 'İçeriğe geç' },
    attachTo: document.body,
  })
  wrappers.push(wrapper, { unmount: () => main.remove() })

  return { wrapper, main }
}

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()!.unmount()
})

describe('SkipLink', () => {
  it('moves focus to the target rather than trusting the fragment', async () => {
    const { wrapper, main } = mountLink()

    await wrapper.get('a').trigger('click')

    expect(document.activeElement).toBe(main)
  })

  it('makes the target focusable by script and never by Tab', async () => {
    const { wrapper, main } = mountLink()

    await wrapper.get('a').trigger('click')

    // `-1`: reachable by `focus()`, skipped by Tab. A `0` here would put the
    // whole page body into the tab order.
    expect(main.getAttribute('tabindex')).toBe('-1')
  })

  it('leaves the tabindex behind, so a second skip still works', async () => {
    const { wrapper, main } = mountLink()

    await wrapper.get('a').trigger('click')
    main.blur()
    await wrapper.get('a').trigger('click')

    expect(document.activeElement).toBe(main)
  })

  it('does not fight an app that made the target focusable itself', async () => {
    const { wrapper, main } = mountLink()
    main.setAttribute('tabindex', '0')

    await wrapper.get('a').trigger('click')

    expect(main.getAttribute('tabindex')).toBe('0')
    expect(document.activeElement).toBe(main)
  })

  it('still points at the fragment, so it works without JavaScript', () => {
    const { wrapper } = mountLink()

    expect(wrapper.get('a').attributes('href')).toBe('#main')
  })

  it('leaves the page alone when the target is not there', async () => {
    const { wrapper } = mountLink('nowhere')

    // Not prevented, so the browser's own fragment handling still runs: a
    // silent no-op is better than a link that swallows the press.
    const event = await wrapper.get('a').trigger('click')

    expect(event).toBeUndefined()
    expect(document.activeElement).not.toBe(null)
  })

  it('is clipped rather than hidden, because a hidden link cannot be focused', () => {
    const { wrapper } = mountLink()

    // The failure mode is `display: none`, which takes it out of the tab
    // order entirely — a skip link nobody can ever reach.
    expect(wrapper.get('a').classes()).toContain('rk-skip')
  })
})
