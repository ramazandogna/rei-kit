import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import {
  FabButton,
  OfflineBanner,
  TabShell,
  createAuthGuard,
  createQueryDefaults,
  createTabTransition,
  createTitleGuard,
  createWriteReport,
} from '../app/index'
import { toRedirectPath, useToast } from '../index'

/**
 * The shell pack.
 *
 * `App.vue` was 120 lines in both phone apps, differing in the product name and
 * two colour variables; `AppLayout.vue` was 180, differing in which form a
 * button opened. Neither difference is a reason to own a frame.
 */

describe('toRedirectPath', () => {
  it('keeps the path and the query', () => {
    expect(toRedirectPath('/ledger?direction=out')).toBe('/ledger?direction=out')
  })

  it('drops the fragment, which is the whole point', () => {
    // Supabase's implicit flow returns the tokens in the fragment. Copied into
    // a query parameter they reach the server, the access log and the history.
    expect(toRedirectPath('/#access_token=abc&refresh_token=def')).toBe('/')
    expect(toRedirectPath('/week#access_token=abc')).toBe('/week')
  })

  it('never returns an empty path', () => {
    expect(toRedirectPath('#access_token=abc')).toBe('/')
    expect(toRedirectPath('')).toBe('/')
  })
})

describe('createAuthGuard', () => {
  const route = (meta: Record<string, unknown>, fullPath = '/week', query = {}) =>
    ({ meta, fullPath, query }) as never

  it('sends an unauthenticated visitor to sign-in, remembering where they were', async () => {
    const guard = createAuthGuard({
      isAuthenticated: () => false,
      signIn: { name: 'LoginView' },
    })

    expect(await guard(route({ requiresAuth: true }, '/ledger?x=1'), route({}), vi.fn())).toEqual({
      name: 'LoginView',
      query: { redirect: '/ledger?x=1' },
    })
  })

  it('strips an OAuth fragment from the remembered path', async () => {
    // The bug this guard exists to stop having twice: one app did this and the
    // other passed `fullPath` straight through.
    const guard = createAuthGuard({ isAuthenticated: () => false, signIn: '/giris' })

    expect(
      await guard(route({ requiresAuth: true }, '/#access_token=secret'), route({}), vi.fn()),
    ).toEqual({ path: '/giris', query: { redirect: '/' } })
  })

  it('lets the app name the query key', async () => {
    const guard = createAuthGuard({
      isAuthenticated: () => false,
      signIn: '/giris',
      redirectQuery: 'next',
    })

    const result = (await guard(route({ requiresAuth: true }, '/kurslar'), route({}), vi.fn())) as {
      query: Record<string, string>
    }

    expect(result.query).toEqual({ next: '/kurslar' })
  })

  it('lets a signed-in visitor through a protected route', async () => {
    const guard = createAuthGuard({ isAuthenticated: () => true, signIn: '/giris' })

    expect(await guard(route({ requiresAuth: true }), route({}), vi.fn())).toBe(true)
  })

  it('sends a signed-in visitor off a guest-only route, back where they meant to go', async () => {
    const guard = createAuthGuard({ isAuthenticated: () => true, signIn: '/giris' })

    expect(
      await guard(
        route({ guestOnly: true }, '/login', { redirect: '/insights' }),
        route({}),
        vi.fn(),
      ),
    ).toBe('/insights')
  })

  it('refuses an off-site redirect', async () => {
    // safeRedirect's job, reached through the guard: a crafted link must not
    // bounce somebody from the real login page to a clone of it.
    const guard = createAuthGuard({ isAuthenticated: () => true, signIn: '/giris' })

    expect(
      await guard(
        route({ guestOnly: true }, '/login', { redirect: 'https://evil.example' }),
        route({}),
        vi.fn(),
      ),
    ).toBe('/')
  })

  it('prefers an explicit home over the redirect query', async () => {
    const guard = createAuthGuard({
      isAuthenticated: () => true,
      signIn: '/giris',
      home: '/kurslar',
    })

    expect(
      await guard(route({ guestOnly: true }, '/giris', { redirect: '/x' }), route({}), vi.fn()),
    ).toBe('/kurslar')
  })

  it('waits for the session to be restored before deciding', async () => {
    // Without this the guard runs while the session is still being read and
    // bounces a signed-in visitor to the login screen on a cold load.
    let restored = false
    const guard = createAuthGuard({
      isAuthenticated: () => restored,
      signIn: '/giris',
      ready: async () => {
        restored = true
      },
    })

    expect(await guard(route({ requiresAuth: true }), route({}), vi.fn())).toBe(true)
  })

  it('leaves an unguarded route alone', async () => {
    const guard = createAuthGuard({ isAuthenticated: () => false, signIn: '/giris' })

    expect(await guard(route({}), route({}), vi.fn())).toBe(true)
  })
})

describe('createTitleGuard', () => {
  it('joins the route title to the product name', () => {
    createTitleGuard('Kakei')({ meta: { title: 'Ledger' } } as never, {} as never, undefined)
    expect(document.title).toBe('Ledger · Kakei')
  })

  it('falls back to the product name for a route with no title', () => {
    createTitleGuard('Kakei')({ meta: {} } as never, {} as never, undefined)
    expect(document.title).toBe('Kakei')
  })
})

describe('createQueryDefaults', () => {
  it('does not retry a mutation, whatever the query retry is', () => {
    // A failed read can be repeated safely; a failed write may have reached the
    // server before the response was lost.
    expect(createQueryDefaults({ retry: 5 }).mutations.retry).toBe(0)
    expect(createQueryDefaults({ retry: 5 }).queries.retry).toBe(5)
  })

  it('keeps a tab change off the network', () => {
    // The library default is 0, which refetches on every mount -- and a phone
    // app remounts a screen on every tab tap.
    expect(createQueryDefaults().queries.staleTime).toBe(60_000)
  })
})

describe('createWriteReport', () => {
  const build = (saved: () => string) => {
    const toast = useToast()
    toast.dismissAll()

    return {
      toast,
      report: createWriteReport({ saved, deleted: () => 'Deleted', failed: () => 'Failed' }),
    }
  }

  it('reads the wording per report, so a language switch is followed', () => {
    // A string would be captured when the report was built and would keep
    // whichever language was active then, for the life of the app.
    let lang = 'en'
    const { toast, report } = build(() => (lang === 'en' ? 'Saved' : 'Kaydedildi'))

    report.saved()
    lang = 'tr'
    report.saved()

    expect(toast.toasts.value.map((t) => t.message)).toEqual(['Saved', 'Kaydedildi'])
  })

  it('reports a failure as danger rather than warning', () => {
    // The change is not in the database and the person who made it is the only
    // one who can decide what to do about that.
    const { toast, report } = build(() => 'Saved')

    report.failed()

    expect(toast.toasts.value.at(-1)).toMatchObject({ tone: 'danger', message: 'Failed' })
  })

  it('treats a delete as a success, because it is one', () => {
    const { toast, report } = build(() => 'Saved')

    report.deleted()

    expect(toast.toasts.value.at(-1)).toMatchObject({ tone: 'success', message: 'Deleted' })
  })
})

describe('createTabTransition name', () => {
  const t = () => createTabTransition(['a', 'b', 'c'] as const)

  it('is empty when there is nothing to slide', () => {
    // An unnamed <Transition> still runs a default v-* animation, so the empty
    // string is what actually turns it off.
    const tabs = t()
    tabs.resolve('a', undefined)

    expect(tabs.name.value).toBe('')
  })

  it('matches the classes shipped in the mobile shell', () => {
    const tabs = t()
    tabs.resolve('c', 'a')
    expect(tabs.name.value).toBe('slide-forward')

    tabs.resolve('a', 'c')
    expect(tabs.name.value).toBe('slide-backward')
  })
})

describe('OfflineBanner', () => {
  it('says nothing while the connection is there', () => {
    const w = mount(OfflineBanner, { props: { label: 'No connection' } })

    expect(w.text()).toBe('')
  })

  it('is a status, not an alert', async () => {
    // Losing signal is a condition to know about, not a reason to interrupt a
    // reader mid-sentence.
    const w = mount(OfflineBanner, { props: { label: 'No connection' } })

    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    window.dispatchEvent(new Event('offline'))
    await nextTick()

    expect(w.find('[role="status"]').exists()).toBe(true)
    expect(w.text()).toContain('No connection')

    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    window.dispatchEvent(new Event('online'))
  })
})

describe('FabButton', () => {
  it('fires the haptic on the press, not on what the press opens', async () => {
    // The sheet it opens may still be being fetched; the feedback cannot wait
    // for that.
    const vibrate = vi.fn<(pattern: number | number[]) => boolean>()
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })

    const w = mount(FabButton, { props: { label: 'New' } })
    await w.find('button').trigger('click')

    expect(vibrate).toHaveBeenCalled()
    expect(w.emitted('click')).toHaveLength(1)
  })

  it('names the action rather than showing a bare plus', () => {
    const w = mount(FabButton, { props: { label: 'New transaction' } })

    expect(w.text()).toContain('New transaction')
  })

  it('hides the icon from assistive tech, since the label already says it', () => {
    const w = mount(FabButton, { props: { label: 'New' } })

    expect(w.find('[aria-hidden="true"]').exists()).toBe(true)
  })
})

describe('TabShell', () => {
  it('renders the page inside the shell frame', () => {
    const w = mount(TabShell, { slots: { default: '<p>page</p>' } })

    expect(w.find('.shell-frame p').exists()).toBe(true)
  })

  it('leaves out the aside entirely when nothing is in it', () => {
    // An empty <aside> is still an element a screen reader announces.
    expect(mount(TabShell).find('aside').exists()).toBe(false)
    expect(
      mount(TabShell, { slots: { aside: 'x' } })
        .find('aside')
        .exists(),
    ).toBe(true)
  })

  it('puts the chrome above the page, outside the layout', () => {
    // An update prompt has to appear on the sign-in screens too, which are not
    // inside the app layout.
    const w = mount(TabShell, {
      slots: { chrome: '<b>update</b>', default: '<p>page</p>' },
    })
    const html = w.html()

    expect(html.indexOf('update')).toBeLessThan(html.indexOf('page'))
  })
})
