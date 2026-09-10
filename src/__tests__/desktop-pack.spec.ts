import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { BaseAlert, BaseBadge, BaseCard, ErrorBoundary, PageContainer, ProgressBar } from '../index'

/**
 * The parts a desktop app needs on day one.
 *
 * The kit came out of a phone app, so it had none of these: three consuming
 * apps wrote their own page measure, their own card and their own error
 * boundary, and the copies drifted — one card with a heavier border than the
 * next, and nobody able to say why.
 *
 * What is pinned here is the behaviour that fails quietly. A progress bar fed
 * a NaN, an alert that says nothing to a screen reader, a boundary that stays
 * broken after the reader navigates away: all of them render, none of them
 * throw, and all of them are wrong.
 */
describe('ProgressBar', () => {
  it('never runs past its own track', () => {
    // Progress is always a computed number, and computed numbers arrive as
    // 101 and as -3.
    const over = mount(ProgressBar, { props: { value: 140, max: 100 } })
    const under = mount(ProgressBar, { props: { value: -20, max: 100 } })

    expect(over.get('[role="progressbar"] > div').attributes('style')).toContain('width: 100%')
    expect(under.get('[role="progressbar"] > div').attributes('style')).toContain('width: 0%')
  })

  it('survives the denominator being zero', () => {
    // Which is the ordinary state of a course nobody has started yet.
    const empty = mount(ProgressBar, { props: { value: 0, max: 0 } })

    expect(empty.get('[role="progressbar"] > div').attributes('style')).toContain('width: 0%')
    expect(empty.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
  })

  it('reports where it is, not just how it looks', () => {
    const half = mount(ProgressBar, { props: { value: 7, max: 28, label: 'Kurs ilerlemesi' } })

    expect(half.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('25')
    expect(half.get('[role="progressbar"]').attributes('aria-label')).toBe('Kurs ilerlemesi')
  })
})

describe('ErrorBoundary', () => {
  const Boom = defineComponent({
    setup() {
      return () => {
        throw new Error('patladı')
      }
    },
  })

  it('shows the fallback instead of unmounting the app', async () => {
    const wrapper = mount(ErrorBoundary, {
      slots: { default: () => h(Boom), fallback: () => h('p', 'kurtarma ekranı') },
    })

    // The child throws while rendering, so the boundary catches it after its
    // own render has already run — the fallback appears on the next tick.
    await nextTick()

    expect(wrapper.text()).toContain('kurtarma ekranı')
  })

  it('hands the error out rather than swallowing it silently', () => {
    // The app is the only thing that knows where errors should be reported.
    const seen: unknown[] = []

    mount(ErrorBoundary, {
      props: { onError: (cause: unknown) => seen.push(cause) },
      slots: { default: () => h(Boom), fallback: () => h('p', 'x') },
    })

    expect(seen).toHaveLength(1)
    expect((seen[0] as Error).message).toBe('patladı')
  })

  it('clears when the reader moves on', async () => {
    // An error on one lesson must not follow somebody to the next one. Without
    // this the boundary stays broken until a full reload.
    const key = ref('/ders/1')
    const broken = ref(true)

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              ErrorBoundary,
              { resetKey: key.value },
              {
                default: () => (broken.value ? h(Boom) : h('p', 'ders')),
                fallback: () => h('p', 'kurtarma ekranı'),
              },
            )
        },
      }),
    )

    await nextTick()
    expect(wrapper.text()).toContain('kurtarma ekranı')

    broken.value = false
    key.value = '/ders/2'
    await nextTick()

    expect(wrapper.text()).toContain('ders')
  })
})

describe('BaseAlert', () => {
  it('interrupts only when it has to', () => {
    // A failed save interrupts; a note about a form field waits its turn.
    // Invisible on screen, rude in a screen reader.
    const quiet = mount(BaseAlert, { slots: { default: 'kaydedildi' } })
    const loud = mount(BaseAlert, {
      props: { tone: 'danger', assertive: true },
      slots: { default: 'x' },
    })

    expect(quiet.attributes('role')).toBe('status')
    expect(quiet.attributes('aria-live')).toBe('polite')
    expect(loud.attributes('role')).toBe('alert')
    expect(loud.attributes('aria-live')).toBe('assertive')
  })

  it('carries no colour of its own', () => {
    // A hex here would be a component that ignores the theme, and the theme is
    // the whole reason the kit exists.
    for (const tone of ['info', 'success', 'warning', 'danger'] as const) {
      const html = mount(BaseAlert, { props: { tone }, slots: { default: 'x' } }).html()

      expect({ tone, hex: /#[0-9a-f]{3,8}\b/i.test(html) }).toEqual({ tone, hex: false })
    }
  })
})

describe('PageContainer', () => {
  it('takes its measure from a token, not a literal', () => {
    // Baked in, this component was unusable by the first app that wanted it:
    // that app had deliberately measured its page at 1120px, and a container
    // that insists on 1200 is the same mistake as a component with a hex in
    // it, one axis over.
    const page = mount(PageContainer, { slots: { default: 'x' } })
    const prose = mount(PageContainer, { props: { width: 'reading' }, slots: { default: 'x' } })

    expect(page.attributes('style')).toContain('var(--measure-page)')
    expect(prose.attributes('style')).toContain('var(--measure-reading)')
  })

  it('can be the landmark it actually is', () => {
    const main = mount(PageContainer, { props: { as: 'main' }, slots: { default: 'x' } })

    expect(main.element.tagName).toBe('MAIN')
  })
})

describe('BaseCard and BaseBadge', () => {
  it('only moves when it is something you can press', () => {
    const still = mount(BaseCard, { slots: { default: 'x' } })
    const pressable = mount(BaseCard, { props: { interactive: true }, slots: { default: 'x' } })

    expect(still.classes().join(' ')).not.toContain('hover:-translate-y-0.5')
    expect(pressable.classes().join(' ')).toContain('hover:-translate-y-0.5')
  })

  it('draws the head and the foot only when given one', () => {
    const plain = mount(BaseCard, { slots: { default: 'gövde' } })
    const full = mount(BaseCard, { slots: { head: 'başlık', default: 'gövde', foot: 'altlık' } })

    // The body wrapper and nothing else: no empty head or foot rule drawn
    // across a card that was given neither.
    expect(plain.element.children).toHaveLength(1)
    expect(plain.text()).toBe('gövde')

    expect(full.element.children).toHaveLength(3)
    expect(full.text()).toContain('başlık')
    expect(full.text()).toContain('altlık')
  })

  it('is a label, never a control', () => {
    // The moment one of these needs a click it is a chip: focus, a hit area,
    // and a way to be removed. Keeping that line drawn is most of the value.
    const badge = mount(BaseBadge, { slots: { default: 'N5' } })

    expect(badge.element.tagName).toBe('SPAN')
    expect(badge.attributes('tabindex')).toBeUndefined()
  })
})

describe('VERSION', () => {
  it('reports the version that was actually published', async () => {
    // It was a hard-coded '0.0.0' that nothing ever rewrote, so the package
    // told every consumer it was at 0.0.0 whatever it was. A public symbol
    // that reports something false is worse than a missing one: nobody checks
    // a value that looks like it works.
    const { version } = (await import('../../package.json')) as unknown as { version: string }
    const { VERSION } = await import('../index')

    // Under vitest no `define` runs, so the fallback is what should appear —
    // and the fallback has to be visibly not a version.
    expect([version, '0.0.0-dev']).toContain(VERSION)
    expect(VERSION).not.toBe('0.0.0')
  })
})

describe('the parts that shipped and nobody could reach', () => {
  it('BaseCard lets the card decide how much room it gives', () => {
    // It shipped with `px-5 py-4` baked in and was used by nobody, across
    // three apps and thirty-five hand-written card surfaces — which used p-3
    // six times, p-4 six times, p-5 five times, and not once the pair this
    // insisted on.
    for (const [padding, expected] of [
      ['sm', 'p-3'],
      ['md', 'p-4'],
      ['lg', 'p-5'],
    ] as const) {
      const wrapper = mount(BaseCard, { props: { padding }, slots: { default: 'x' } })

      expect(wrapper.findAll('div')[1]!.classes()).toContain(expected)
    }
  })

  it('BaseCard gives none at all to a card that holds a list', () => {
    // The rows own the padding, and the dividers have to reach the border.
    const wrapper = mount(BaseCard, { props: { padding: 'none' }, slots: { default: 'x' } })

    expect(
      wrapper
        .get('div > div')
        .classes()
        .some((c) => c.startsWith('p')),
    ).toBe(false)
  })

  it('BaseCard keeps its head as tight as its body', () => {
    // A card cannot be tight around its contents and loose around its title.
    const wrapper = mount(BaseCard, {
      props: { padding: 'sm' },
      slots: { head: 'title', default: 'x' },
    })

    // findAll: [0] the card, [1] the head, [2] the body.
    expect(wrapper.findAll('div')[1]!.classes()).toContain('py-2.5')
  })

  it('ProgressBar is thinner where it is a hint rather than the subject', () => {
    // It shipped at one thickness and the two bars anybody wanted were h-1.
    const hint = mount(ProgressBar, { props: { value: 1, max: 2, size: 'sm' } })
    const subject = mount(ProgressBar, { props: { value: 1, max: 2, size: 'lg' } })

    expect(hint.get('[role="progressbar"]').classes()).toContain('h-1')
    expect(subject.get('[role="progressbar"]').classes()).toContain('h-2')
  })
})
