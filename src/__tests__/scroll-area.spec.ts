import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import ScrollArea from '../components/ScrollArea.vue'

/**
 * jsdom lays nothing out, so every box in it measures zero and never
 * overflows. These sizes are therefore set by hand on the viewport element,
 * which is exactly the input the component reads — the arithmetic and the
 * decisions it drives are what is under test here, not the layout.
 */
function size(element: Element, box: { client: number; scroll: number; axis: 'x' | 'y' }) {
  const [client, scroll] =
    box.axis === 'x' ? ['clientWidth', 'scrollWidth'] : ['clientHeight', 'scrollHeight']

  Object.defineProperty(element, client, { value: box.client, configurable: true })
  Object.defineProperty(element, scroll, { value: box.scroll, configurable: true })
}

/** jsdom has no ResizeObserver; the component treats its absence as "never resizes". */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = []
  observe = vi.fn<(target: Element) => void>()
  disconnect = vi.fn<() => void>()

  constructor(readonly callback: () => void) {
    FakeResizeObserver.instances.push(this)
  }
}

beforeEach(() => {
  FakeResizeObserver.instances = []
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

/** Re-measures the way a real resize or scroll would. */
async function remeasure(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('.rk-scroll-viewport').trigger('scroll')
  await nextTick()
}

const mountArea = (props: Record<string, unknown>, slot: string) =>
  mount(ScrollArea, {
    props: { label: 'Kaydırılan alan', ...props },
    slots: { default: slot },
    attachTo: document.body,
  })

describe('ScrollArea', () => {
  it('is a named focus stop when it overflows and holds nothing focusable', async () => {
    const wrapper = mountArea({ axis: 'x' }, '<p>a very long line</p>')
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 100, scroll: 400, axis: 'x' })
    await remeasure(wrapper)

    expect(viewport.attributes('tabindex')).toBe('0')
    expect(viewport.attributes('role')).toBe('region')
    expect(viewport.attributes('aria-label')).toBe('Kaydırılan alan')
  })

  it('stays out of the tab order when something inside already takes focus', async () => {
    // A row of buttons already moves under the keyboard: Tab scrolls the
    // next one into view. A stop of its own would cost a press for nothing.
    const wrapper = mountArea({ axis: 'x' }, '<button type="button">Yemek</button>')
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 100, scroll: 400, axis: 'x' })
    await remeasure(wrapper)

    expect(viewport.attributes('tabindex')).toBeUndefined()
    expect(viewport.attributes('role')).toBeUndefined()
  })

  it('is not a stop when everything fits, focusable or not', async () => {
    const wrapper = mountArea({ axis: 'x' }, '<p>short</p>')
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 400, scroll: 400, axis: 'x' })
    await remeasure(wrapper)

    expect(viewport.attributes('tabindex')).toBeUndefined()
  })

  it('ignores a focusable descendant that is out of the tab order', async () => {
    // `tabindex="-1"` is reachable by script, never by Tab, so it is no way
    // in for a keyboard and the box still has to be one.
    const wrapper = mountArea({ axis: 'x' }, '<div tabindex="-1">bir kart</div>')
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 100, scroll: 400, axis: 'x' })
    await remeasure(wrapper)

    expect(viewport.attributes('tabindex')).toBe('0')
  })

  it('ignores a disabled control, which is no way in either', async () => {
    /* A row of buttons that are all disabled is exactly as unreachable as
       a row of plain text, and the box is the only way to the far end of
       it. This box counted them and denied itself the stop. */
    const wrapper = mountArea({ axis: 'x' }, '<button type="button" disabled>bir</button>')
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 100, scroll: 400, axis: 'x' })
    await remeasure(wrapper)

    expect(viewport.attributes('tabindex')).toBe('0')
  })

  it('still stands aside for one that is not', async () => {
    const wrapper = mountArea(
      { axis: 'x' },
      '<button type="button" disabled>bir</button><button type="button">iki</button>',
    )
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 100, scroll: 400, axis: 'x' })
    await remeasure(wrapper)

    expect(viewport.attributes('tabindex')).toBeUndefined()
  })

  it('fades only the edge that has content past it', async () => {
    const wrapper = mountArea({ axis: 'x' }, '<p>a very long line</p>')
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 100, scroll: 400, axis: 'x' })
    await remeasure(wrapper)

    // At the start: more to come, nothing behind.
    expect(wrapper.find('.is-end-x').exists()).toBe(true)
    expect(wrapper.find('.is-start-x').exists()).toBe(false)

    viewport.element.scrollLeft = 150
    await remeasure(wrapper)
    expect(wrapper.find('.is-start-x').exists()).toBe(true)
    expect(wrapper.find('.is-end-x').exists()).toBe(true)

    viewport.element.scrollLeft = 300
    await remeasure(wrapper)
    expect(wrapper.find('.is-end-x').exists()).toBe(false)
  })

  it('reads a right-to-left scroll position by its distance, not its sign', async () => {
    // A right-to-left box counts `scrollLeft` down from zero. Taken at face
    // value, "at the start" would be true only at the far end of it.
    const wrapper = mountArea({ axis: 'x' }, '<p>a very long line</p>')
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 100, scroll: 400, axis: 'x' })
    viewport.element.scrollLeft = -150
    await remeasure(wrapper)

    expect(wrapper.find('.is-start-x').exists()).toBe(true)
    expect(wrapper.find('.is-end-x').exists()).toBe(true)
  })

  it('draws no fade at all when nothing overflows', async () => {
    const wrapper = mountArea({ axis: 'both' }, '<p>short</p>')
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 400, scroll: 400, axis: 'x' })
    size(viewport.element, { client: 400, scroll: 400, axis: 'y' })
    await remeasure(wrapper)

    expect(wrapper.findAll('.rk-scroll-fade')).toHaveLength(0)
  })

  it('draws no fade when the app turns it off', async () => {
    const wrapper = mountArea({ axis: 'x', fade: false }, '<p>a very long line</p>')
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 100, scroll: 400, axis: 'x' })
    await remeasure(wrapper)

    expect(wrapper.findAll('.rk-scroll-fade')).toHaveLength(0)
    // The focus stop is a separate decision and survives it.
    expect(viewport.attributes('tabindex')).toBe('0')
  })

  it('leaves the native scrollbar alone unless asked', () => {
    const shown = mountArea({ axis: 'y' }, '<p>x</p>')
    expect(shown.get('.rk-scroll-viewport').classes()).not.toContain('no-scrollbar')

    const hidden = mountArea({ axis: 'y', scrollbar: 'hidden' }, '<p>x</p>')
    expect(hidden.get('.rk-scroll-viewport').classes()).toContain('no-scrollbar')
  })

  it('watches its contents as well as itself, so a list that arrives is noticed', async () => {
    mountArea({ axis: 'y' }, '<p>bir</p><p>iki</p>')
    // The template ref lands after the first render, so the observer is set
    // up on the flush that follows it rather than during setup.
    await nextTick()
    const observer = FakeResizeObserver.instances.at(-1)!

    // The box, plus each child: a list that grows changes what there is to
    // scroll without the box itself changing size at all.
    expect(observer.observe.mock.calls.length).toBe(3)
  })

  it('fades a vertical box at its own edges', async () => {
    const wrapper = mountArea({ axis: 'y' }, '<p>a tall stack</p>')
    const viewport = wrapper.get('.rk-scroll-viewport')

    size(viewport.element, { client: 100, scroll: 400, axis: 'y' })
    viewport.element.scrollTop = 150
    await remeasure(wrapper)

    expect(wrapper.find('.is-start-y').exists()).toBe(true)
    expect(wrapper.find('.is-end-y').exists()).toBe(true)
    // The other axis does not scroll, so it never fades.
    expect(wrapper.find('.is-end-x').exists()).toBe(false)
  })
})
