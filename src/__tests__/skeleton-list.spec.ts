// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import SkeletonList from '../components/SkeletonList.vue'

describe('SkeletonList', () => {
  it('renders one row per row', () => {
    const wrapper = mount(SkeletonList, { props: { rows: 4 } })

    expect(wrapper.findAll('[aria-hidden="true"]')).toHaveLength(4)
  })

  it('keeps treating a utility class as a class', () => {
    const row = mount(SkeletonList, { props: { rowHeight: 'h-20' } }).find('[aria-hidden="true"]')

    expect(row.classes()).toContain('h-20')
    expect(row.attributes('style')).toBeUndefined()
  })

  // The bug this guards: a length landing in `class` is not a class, so every
  // row collapsed to nothing and the placeholder was invisible — a loading
  // state that looks exactly like a finished, empty page.
  it.each(['5rem', '72px', 'var(--row-height)', 'calc(2rem + 1px)'])(
    'gives a row real height when passed %s',
    (rowHeight) => {
      const row = mount(SkeletonList, { props: { rowHeight } }).find('[aria-hidden="true"]')

      expect(row.attributes('style')).toContain('height')
      expect(row.classes()).not.toContain(rowHeight)
    },
  )
})
