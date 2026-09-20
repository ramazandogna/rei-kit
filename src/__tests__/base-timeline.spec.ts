import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'

import { BaseTimeline } from '../index'

/**
 * What happened, in order, on a rail.
 *
 * The rail is the part that is easy and the part that means nothing. What a
 * screen reader gets is the list: `<ol>`, so it is announced as a list with
 * a count and each event is numbered, with the time read before the title.
 * A rail drawn with divs — which is what every hand-written one is — says
 * nothing at all.
 */
const EVENTS = [
  { key: 'placed', time: '12 Sep, 09:42', title: 'Order placed' },
  { key: 'packed', time: '12 Sep, 14:10', title: 'Packed', description: 'Two parcels.' },
  { key: 'sent', time: '13 Sep, 08:00', title: 'Sent', fill: 'bg-positive' },
] as const

const build = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) =>
  mount(BaseTimeline, { props: { events: EVENTS, label: 'Order history', ...props }, slots })

describe('BaseTimeline', () => {
  it('is an ordered list with a name', () => {
    const w = build()

    // Not a stack of divs: the order is the meaning, and `<ol>` is what
    // says so to somebody listening.
    expect(w.element.tagName).toBe('OL')
    expect(w.attributes('aria-label')).toBe('Order history')
    expect(w.findAll('li')).toHaveLength(3)
  })

  it('reads the time before the title', () => {
    const rows = build().findAll('li')

    expect(rows[0]!.text().startsWith('12 Sep, 09:42')).toBe(true)
    expect(rows[0]!.text()).toContain('Order placed')
    expect(rows[1]!.text()).toContain('Two parcels.')
  })

  it('hides the rail and the dots from a screen reader', () => {
    const w = build()

    // They carry no information the list does not already state.
    expect(w.find('.rk-timeline-rail').attributes('aria-hidden')).toBe('true')
    expect(w.find('.rk-timeline-marker').attributes('aria-hidden')).toBe('true')
  })

  it('takes the marker colour as a class, the way ToneDot does', () => {
    const dots = build().findAll('.rk-timeline-dot')

    // A class rather than a category, so an app can key it off whatever its
    // own domain calls a kind without this component knowing about any.
    expect(dots[2]!.classes()).toContain('bg-positive')
    expect(dots[0]!.classes()).toContain('bg-primary')
  })

  it('lets a marker be something other than a dot', () => {
    const w = build({}, { marker: '<span class="tick">✓</span>' })

    expect(w.findAll('.tick')).toHaveLength(3)
    expect(w.find('.rk-timeline-dot').exists()).toBe(false)
  })

  it('takes a body for one event, named for its key', () => {
    const w = build({}, { packed: '<blockquote class="note">Handle with care.</blockquote>' })

    expect(w.find('.note').text()).toBe('Handle with care.')
    // Only the one that was given a body grows one.
    expect(w.findAll('.rk-timeline-body')).toHaveLength(1)
  })

  it('draws an icon inside the marker when there is one', () => {
    const Check = { render: () => h('svg', { class: 'check' }) }
    const w = build({ events: [{ key: 'done', time: 'now', title: 'Done', icon: Check }] })

    expect(w.find('.check').exists()).toBe(true)
  })

  it('gives one body to every event, typed as the app wrote it', () => {
    /* The replacement for a hand-written note feed: one body shape for
       every row, and the app's own fields handed back. Before this slot
       existed the only way in was a slot per key, which for a feed means a
       slot per note. */
    const notes = [
      { key: 'a', time: '12 Sep', body: 'Went for a walk.' },
      { key: 'b', time: '11 Sep', body: 'Rested.' },
    ]

    const w = mount(BaseTimeline, {
      props: { events: notes, label: 'Notes' },
      slots: { default: '<blockquote class="note">{{ params.event.body }}</blockquote>' },
    })

    expect(w.findAll('.note').map((one) => one.text())).toEqual(['Went for a walk.', 'Rested.'])
  })

  it('lets one event override the shared body', () => {
    const w = build(
      {},
      {
        default: '<span class="plain">body</span>',
        packed: '<span class="special">special</span>',
      },
    )

    expect(w.findAll('.plain')).toHaveLength(2)
    expect(w.findAll('.special')).toHaveLength(1)
  })

  it('renders nothing but the rail when there is nothing yet', () => {
    const w = build({ events: [] })

    expect(w.findAll('li')).toHaveLength(0)
    // An empty state is the app's to word, so the kit shows none.
    expect(w.text()).toBe('')
  })

  it('keeps the order it was given', () => {
    // Newest first suits a note feed; oldest first suits a status trail.
    // The kit sorts nothing, so both are the app's to decide.
    const reversed = [...EVENTS].reverse()
    const w = build({ events: reversed })

    expect(w.findAll('li')[0]!.text()).toContain('Sent')
  })
})
