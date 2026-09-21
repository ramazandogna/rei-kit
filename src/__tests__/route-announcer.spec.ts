import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

import { createRouteAnnouncer } from '../app/guards'
import { announce, useAnnounce } from '../composables/use-announce'

/**
 * The failure here is the quietest one in a single-page app: the title
 * changes, the view is replaced, and for a screen reader nothing happened
 * at all. Every assertion below is about something that is invisible on
 * screen and throws nothing when it is wrong.
 */
const { polite } = useAnnounce()

const route = (path: string) => ({ fullPath: path, path }) as RouteLocationNormalized

function main() {
  const element = document.createElement('main')
  element.id = 'main'
  document.body.append(element)

  return element
}

afterEach(async () => {
  document.body.innerHTML = ''
  document.title = ''
  announce('')
  await nextTick()
  vi.useRealTimers()
})

/** The announcement lands a tick after the call, by design. */
async function settle() {
  await nextTick()
  await nextTick()
}

describe('createRouteAnnouncer', () => {
  it('says nothing on the first navigation', async () => {
    const guard = createRouteAnnouncer()
    document.title = 'Kayıtlar · Kakei'

    guard(route('/a'), route('/'), undefined)
    await settle()

    // The browser's own page load already announced this one; saying it
    // again is the title read twice before the reader has done anything.
    expect(polite.value).toBe('')
  })

  it('announces the title the title guard just set', async () => {
    const guard = createRouteAnnouncer()

    guard(route('/a'), route('/'), undefined)
    document.title = 'Raporlar · Kakei'
    guard(route('/b'), route('/a'), undefined)
    await settle()

    expect(polite.value).toBe('Raporlar · Kakei')
  })

  it('takes the app’s own sentence when it has one', async () => {
    const guard = createRouteAnnouncer({ message: (to) => `${to.path} açıldı` })

    guard(route('/a'), route('/'), undefined)
    guard(route('/raporlar'), route('/a'), undefined)
    await settle()

    expect(polite.value).toBe('/raporlar açıldı')
  })

  it('moves focus into the new view', async () => {
    const element = main()
    const guard = createRouteAnnouncer({ focus: 'main' })

    guard(route('/a'), route('/'), undefined)
    guard(route('/b'), route('/a'), undefined)

    // Without this, focus is on a nav link that was just re-rendered, or on
    // `<body>` — and the next Tab starts again from the top of the page.
    expect(document.activeElement).toBe(element)
    expect(element.getAttribute('tabindex')).toBe('-1')
  })

  it('leaves focus alone when no view is named', async () => {
    main()
    const guard = createRouteAnnouncer()

    guard(route('/a'), route('/'), undefined)
    guard(route('/b'), route('/a'), undefined)

    expect(document.activeElement).toBe(document.body)
  })

  it('announces even when the view it was told to focus is not there', async () => {
    const guard = createRouteAnnouncer({ focus: 'nowhere' })

    guard(route('/a'), route('/'), undefined)
    document.title = 'Raporlar'
    guard(route('/b'), route('/a'), undefined)
    await settle()

    // A missing element is a no-op, not a reason to go silent as well.
    expect(polite.value).toBe('Raporlar')
  })

  it('says nothing rather than an empty sentence', async () => {
    const guard = createRouteAnnouncer()
    document.title = ''

    guard(route('/a'), route('/'), undefined)
    guard(route('/b'), route('/a'), undefined)
    await settle()

    expect(polite.value).toBe('')
  })

  it('announces the same title again when a route repeats it', async () => {
    const guard = createRouteAnnouncer()
    document.title = 'Raporlar'

    guard(route('/a'), route('/'), undefined)
    guard(route('/b'), route('/a'), undefined)
    await settle()
    expect(polite.value).toBe('Raporlar')

    guard(route('/c'), route('/b'), undefined)

    // The value alone proves nothing here — it was already 'Raporlar'. What
    // makes the second arrival audible is that the region is cleared in
    // between, so the reader has a change to notice. Two views under one
    // title is a real shape.
    // Cleared synchronously, set again on the next tick. The value alone
    // proves nothing here — it was already 'Raporlar' — so what is under
    // test is that the region changes at all.
    expect(polite.value).toBe('')

    await settle()
    expect(polite.value).toBe('Raporlar')
  })
})
