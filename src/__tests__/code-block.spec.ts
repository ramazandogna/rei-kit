import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CodeBlock from '../components/CodeBlock.vue'

/**
 * Two things here are easy to get wrong and invisible once wrong.
 *
 * A box that scrolls sideways and cannot take focus cannot be scrolled by a
 * keyboard, so the end of a long line is unreachable and nothing on screen
 * says so. And a sample rendered as HTML rather than text is both a lie
 * about what the code says and a hole, so the angle brackets in it have to
 * survive as characters.
 */
const SAMPLE = 'const a = <T,>(x: T) => x & 1'

describe('CodeBlock', () => {
  it('shows the sample exactly, brackets and all', () => {
    const wrapper = mount(CodeBlock, { props: { code: SAMPLE, label: 'Örnek' } })

    expect(wrapper.get('code').text()).toBe(SAMPLE)
    // As characters, not as markup: rendered as HTML this would be a tag.
    expect(wrapper.get('code').element.innerHTML).toContain('&lt;T,&gt;')
  })

  it('is a named focus stop while it can scroll', () => {
    const pre = mount(CodeBlock, { props: { code: SAMPLE, label: 'Örnek' } }).get('pre')

    expect(pre.attributes('tabindex')).toBe('0')
    expect(pre.attributes('role')).toBe('region')
    expect(pre.attributes('aria-label')).toBe('Örnek')
  })

  it('stops being a focus stop when it wraps, because there is nothing to scroll', () => {
    const pre = mount(CodeBlock, {
      props: { code: SAMPLE, label: 'Örnek', wrap: true },
    }).get('pre')

    // A stop that scrolls nothing is one to Tab past for no reason, and on
    // a page of samples that is one per sample.
    expect(pre.attributes('tabindex')).toBeUndefined()
    expect(pre.attributes('role')).toBeUndefined()
  })

  it('carries no bar at all until there is something to put in it', () => {
    const wrapper = mount(CodeBlock, { props: { code: SAMPLE, label: 'Örnek' } })

    expect(wrapper.find('figcaption').exists()).toBe(false)
  })

  it('takes a copy button only when it has both of its words', () => {
    const half = mount(CodeBlock, {
      props: { code: SAMPLE, label: 'Örnek', copyLabel: 'Kopyala' },
    })

    // One without the other would mean a button whose changed state has no
    // name, so it is both or neither.
    expect(half.findComponent({ name: 'CopyButton' }).exists()).toBe(false)

    const whole = mount(CodeBlock, {
      props: { code: SAMPLE, label: 'Örnek', copyLabel: 'Kopyala', copiedLabel: 'Kopyalandı' },
    })

    expect(whole.findComponent({ name: 'CopyButton' }).props('text')).toBe(SAMPLE)
  })

  it('lets an app hand in its own highlighted body', () => {
    const wrapper = mount(CodeBlock, {
      props: { code: SAMPLE, label: 'Örnek' },
      slots: { default: '<span class="tok">const</span> a' },
    })

    expect(wrapper.find('.tok').exists()).toBe(true)
    // The copy still carries the real text rather than the marked-up one.
    expect(wrapper.text()).not.toContain('<span')
  })
})
