import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import BarChart from '../components/BarChart.vue'
import DonutChart from '../components/DonutChart.vue'

/**
 * A chart is the one component in this kit that can tell the truth and
 * still say something false.
 *
 * Two ways, and both are ordinary rather than exotic. A bar whose axis does
 * not start at zero makes a five per cent difference look like a doubling.
 * And a picture with no data behind it — an SVG and a hand-written sentence
 * describing it — is a description that is wrong the first time the numbers
 * change, and nothing anywhere says so.
 *
 * So the tests are about the arithmetic and about what is actually readable,
 * not about what it looks like.
 */
const SIZES = [
  { key: 'rei', label: 'rei-kit', value: 31.1 },
  { key: 'element', label: 'element-plus', value: 104.1 },
  { key: 'antd', label: 'ant-design-vue', value: 195.4 },
]

const kb = (value: number) => `${value.toFixed(1)} KB`

function bars(props: Record<string, unknown> = {}) {
  return mount(BarChart, {
    props: { series: SIZES, label: 'Paket boyutu', valueLabel: kb, animate: false, ...props },
    attachTo: document.body,
  })
}

const widths = (wrapper: ReturnType<typeof bars>) =>
  wrapper.findAll('.rk-bars-fill').map((bar) => bar.attributes('style') ?? '')

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('BarChart', () => {
  it('is a table, so the data reads without the picture', () => {
    const wrapper = bars()

    expect(wrapper.find('caption').text()).toBe('Paket boyutu')
    expect(wrapper.findAll('th[scope="row"]').map((cell) => cell.text())).toEqual([
      'rei-kit',
      'element-plus',
      'ant-design-vue',
    ])
    expect(wrapper.text()).toContain('104.1 KB')
  })

  it('keeps the bars out of the way of the reader', () => {
    // The number beside it has already been read out. "Graphic" adds nothing.
    for (const bar of bars().findAll('.rk-bars-fill')) {
      expect(bar.attributes('aria-hidden')).toBe('true')
    }
  })

  /*
   * The whole reason this component exists rather than a div with a width.
   * The largest value is the full width and every other bar is its true
   * fraction of it — so the picture cannot exaggerate a difference the
   * numbers do not have.
   */
  it('scales from zero, so the picture matches the numbers', () => {
    const [rei, element, antd] = widths(bars())

    expect(antd).toContain('width: 100%')
    // 104.1 / 195.4 = 53.27%, 31.1 / 195.4 = 15.92%.
    expect(element).toMatch(/width: 53\.2/)
    expect(rei).toMatch(/width: 15\.9/)
  })

  it('takes a ceiling, for a fixed scale across several charts', () => {
    const [, , antd] = widths(bars({ max: 400 }))

    expect(antd).toMatch(/width: 48\.8/)
  })

  it('never draws past its own edge', () => {
    // A value above an explicit ceiling is clamped rather than overflowing.
    const [, , antd] = widths(bars({ max: 100 }))

    expect(antd).toContain('width: 100%')
  })

  it('survives a series that is all zeros rather than dividing by one', () => {
    const wrapper = bars({ series: [{ key: 'a', label: 'Sıfır', value: 0 }] })

    expect(widths(wrapper)[0]).toContain('width: 0%')
  })

  it('paints from a class, because the kit does not know which row is yours', () => {
    const wrapper = bars({
      fill: (item: { key: string }) => (item.key === 'rei' ? 'bg-positive' : 'bg-muted'),
    })
    const painted = wrapper.findAll('.rk-bars-fill').map((bar) => bar.classes())

    expect(painted[0]).toContain('bg-positive')
    expect(painted[1]).toContain('bg-muted')
  })

  it('falls back to a role rather than a colour', () => {
    expect(bars().get('.rk-bars-fill').classes()).toContain('bg-primary')
  })

  /* Drawn flat and grown once it is on screen — the same shape as `CountUp`,
     for the same reason: a chart that animated off-screen has animated for
     nobody. */
  it('waits until it is on screen to grow', async () => {
    let announce: ((visible: boolean) => void) | undefined

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(readonly callback: (entries: { isIntersecting: boolean }[]) => void) {
          announce = (visible) => this.callback([{ isIntersecting: visible }])
        }
        observe() {}
        disconnect() {}
      },
    )

    const wrapper = bars({ animate: true })
    expect(widths(wrapper)[0]).toContain('width: 0%')

    announce!(true)
    await wrapper.vm.$nextTick()

    expect(widths(wrapper)[0]).toMatch(/width: 15\.9/)
  })
})

const PARTS = [
  { key: 'components', label: 'Component styles', value: 15 },
  { key: 'tokens', label: 'Tokens', value: 5 },
]

function donut(props: Record<string, unknown> = {}) {
  return mount(DonutChart, {
    props: {
      slices: PARTS,
      label: 'Stil sayfası neden oluşuyor',
      valueLabel: kb,
      fill: (_: unknown, index: number) => ['text-primary', 'text-accent'][index]!,
      ...props,
    },
    attachTo: document.body,
  })
}

describe('DonutChart', () => {
  it('puts the data in the legend, not in a sentence about the picture', () => {
    const wrapper = donut()

    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('ul').attributes('aria-label')).toBe('Stil sayfası neden oluşuyor')
    expect(wrapper.text()).toContain('Component styles')
    expect(wrapper.text()).toContain('15.0 KB')
  })

  /* The circumference is 100, so a slice's length is its percentage and
     there is no second place for the arithmetic to be wrong. */
  it('gives each slice its true share of the ring', () => {
    const arcs = donut().findAll('circle')

    expect(arcs[0]!.attributes('stroke-dasharray')).toBe('75 25')
    expect(arcs[1]!.attributes('stroke-dasharray')).toBe('25 75')
  })

  it('starts each slice where the one before it ended', () => {
    const arcs = donut().findAll('circle')

    expect(arcs[0]!.attributes('stroke-dashoffset')).toBe('0')
    expect(arcs[1]!.attributes('stroke-dashoffset')).toBe('-75')
  })

  it('draws nothing rather than dividing by zero', () => {
    const arcs = donut({ slices: [{ key: 'a', label: 'Sıfır', value: 0 }] }).findAll('circle')

    expect(arcs[0]!.attributes('stroke-dasharray')).toBe('0 100')
  })

  it('paints each slice from its own class', () => {
    const arcs = donut().findAll('circle')

    expect(arcs[0]!.classes()).toContain('text-primary')
    expect(arcs[1]!.classes()).toContain('text-accent')
  })
})
