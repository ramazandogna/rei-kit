import type { NavigationGuard, NavigationHookAfter, RouteLocationRaw } from 'vue-router'

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
