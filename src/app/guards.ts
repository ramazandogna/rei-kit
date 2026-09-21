import type {
  NavigationGuard,
  NavigationHookAfter,
  RouteLocationNormalized,
  RouteLocationRaw,
} from 'vue-router'

import { announce } from '../composables/use-announce'
import { focusTarget } from '../utils/focus-target'
import { safeRedirect, toRedirectPath } from '../utils/redirect'

export type AuthGuardOptions = {
  /** Read per navigation, not captured: the answer changes while the app runs. */
  isAuthenticated: () => boolean
  /**
   * Where an unauthenticated visitor is sent. The redirect query is added to it.
   *
   * A string is treated as a path, so `'/giris'` and `{ name: 'LoginView' }`
   * both work.
   */
  signIn: RouteLocationRaw
  /**
   * Where a signed-in visitor is sent off a `guestOnly` route.
   *
   * Omitted, they go wherever the redirect query points, falling back to `/` —
   * which is what sends somebody who was bounced to the login screen back to
   * the page they actually wanted.
   */
  home?: RouteLocationRaw | undefined
  /** The query key carrying the return path. Default `'redirect'`. */
  redirectQuery?: string | undefined
  /**
   * Awaited before the first decision — restoring a session, typically.
   *
   * Without it the guard runs while the session is still being read and bounces
   * a signed-in visitor to the login screen on a cold load.
   */
  ready?: (() => Promise<void> | void) | undefined
}

/**
 * The route guard three apps had written separately.
 *
 * It answers two questions and nothing else: may this visitor see this route,
 * and where do they go if not. Everything that differs between the apps — the
 * name of the login route, whether the return path travels as `redirect` or
 * `next`, whether a session has to be restored first — is an option, because
 * each of those is a decision about the app rather than about guarding.
 *
 * It does nothing while prerendering. Every prerendered route is public, the
 * server has no session to read, and a guard that redirected there would write
 * a login page into a file meant to be content.
 *
 * The return path goes through `toRedirectPath`, so an OAuth fragment is
 * dropped rather than copied into a query string the server will see.
 *
 * @example
 * ```ts
 * router.beforeEach(
 *   createAuthGuard({
 *     isAuthenticated: () => useAuthStore().isAuthenticated,
 *     signIn: { name: 'LoginView' },
 *   }),
 * )
 * ```
 */
export function createAuthGuard(options: AuthGuardOptions): NavigationGuard {
  const { isAuthenticated, signIn, home, redirectQuery = 'redirect', ready } = options

  return async (to) => {
    // `import.meta.env` is the consumer's, substituted when they build. The
    // optional read is for a runtime that has no such object at all.
    if (import.meta.env?.['SSR']) return true

    await ready?.()

    if (to.meta['requiresAuth'] && !isAuthenticated()) {
      const target = typeof signIn === 'string' ? { path: signIn } : signIn

      return {
        ...(target as object),
        query: { [redirectQuery]: toRedirectPath(to.fullPath) },
      } as RouteLocationRaw
    }

    if (to.meta['guestOnly'] && isAuthenticated()) {
      return home ?? safeRedirect(to.query[redirectQuery] as string | null | undefined)
    }

    return true
  }
}

/**
 * The document title, which a single-page app has to set for itself.
 *
 * An `afterEach` rather than a `beforeEach`: the title describes where the
 * visitor arrived, and a guard that can still cancel has not arrived anywhere.
 *
 * @example
 * ```ts
 * router.afterEach(createTitleGuard('Kakei'))  // "Ledger · Kakei"
 * ```
 */
export function createTitleGuard(suffix: string, separator = '·'): NavigationHookAfter {
  return (to) => {
    const title = to.meta['title']

    document.title = title ? `${String(title)} ${separator} ${suffix}` : suffix
  }
}

/**
 * Saying, and showing, that the page changed.
 *
 * `createTitleGuard` above sets `document.title`, which is what a browser
 * announces on a real page load. A single-page app has no page load: the
 * title changes, the view is replaced, and for a screen reader **nothing
 * happened**. The reader is still wherever it was, reading content that is
 * no longer on screen. So the kit ships the guard that creates the
 * situation, and this is the other half of it.
 *
 * Two things happen, and they are separate failures:
 *
 * **The new page is announced**, through `announce()` — so the app needs
 * one `AnnounceHost` rendered for it to reach anyone.
 *
 * **Focus moves to the new view**, if `focus` names one. Without that,
 * focus is on the link in the nav that was just re-rendered, or has fallen
 * back to `<body>`, and the next Tab starts again from the top of the
 * document — past the whole header, on every navigation.
 *
 * The first navigation is skipped. The browser's own page load already
 * announced the page, and saying it again is the reader hearing the title
 * twice before they have done anything.
 *
 * Register it **after** `createTitleGuard`, or it announces the title of
 * the page that was just left.
 *
 * @example
 * ```ts
 * router.afterEach(createTitleGuard('Kakei'))
 * router.afterEach(createRouteAnnouncer({ focus: 'main' }))
 * ```
 */
export function createRouteAnnouncer(
  options: {
    /** The `id` of the new view, usually the page's `<main>`. */
    focus?: string | undefined
    /**
     * What to say. The document title by default, which is what
     * `createTitleGuard` has just set and what a page load would have read.
     */
    message?: ((to: RouteLocationNormalized) => string) | undefined
  } = {},
): NavigationHookAfter {
  const { focus, message } = options
  let first = true

  return (to) => {
    if (first) {
      first = false
      return
    }

    if (focus !== undefined) focusTarget(focus)

    const said = message ? message(to) : document.title
    if (said) announce(said)
  }
}
