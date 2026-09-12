/**
 * What a router hands back for one query key.
 *
 * Inlined rather than imported from vue-router: the shape is `string | null`
 * either way, and a helper this small should not drag a router into the
 * package's dependencies.
 */
export type QueryValue = string | null

/**
 * Resolves a `?redirect=` query value into a safe in-app path.
 *
 * Only same-origin paths are accepted. Anything else falls back to `/`,
 * so a crafted link cannot bounce a user from the real login page to a
 * phishing clone.
 *
 * Pure: takes the query value instead of reading the router, so it also
 * works inside navigation guards and can be unit tested.
 *
 * @param target - Raw `route.query.redirect` value. May be a string, an
 *   array (repeated query key), `null`, or `undefined`.
 * @returns A path starting with a single `/`. Defaults to `/`.
 *
 * @example
 * ```ts
 * // in a view
 * await router.push(safeRedirect(route.query.redirect))
 *
 * // in a guard
 * return safeRedirect(to.query.redirect)
 * ```
 *
 * @example
 * ```ts
 * safeRedirect('/week')              // '/week'
 * safeRedirect('https://evil.com')   // '/'
 * safeRedirect('//evil.com')         // '/'  (protocol-relative URL)
 * safeRedirect(['/a', '/b'])         // '/'
 * safeRedirect(undefined)            // '/'
 * ```
 */
export function safeRedirect(target: QueryValue | QueryValue[] | undefined): string {
  if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) {
    return target
  }

  return '/'
}

/**
 * Where to send somebody back to after signing in, without the fragment.
 *
 * Supabase's implicit OAuth flow hands the browser back with the access and
 * refresh tokens in the URL fragment. A fragment is client-side only — it is
 * never sent to a server. Copied into a query parameter it stops being one:
 * `/login?redirect=/%23access_token=…` is sent on the very next request and
 * lands in the host's access logs, in `Referer` headers and in browser history.
 *
 * So the redirect keeps the path and the query and drops everything from the
 * `#`. There is nothing after it worth returning to anyway.
 *
 * One of the two phone apps had this and the other was passing `fullPath`
 * straight through, which is the leak above with nothing in the way of it. That
 * is the shape of bug a shared kit exists to end: it was fixed once, in the app
 * whose author happened to think of it.
 *
 * @example
 * ```ts
 * toRedirectPath('/ledger?direction=out')  // '/ledger?direction=out'
 * toRedirectPath('/#access_token=abc')     // '/'
 * ```
 */
export function toRedirectPath(fullPath: string): string {
  const [path] = fullPath.split('#')

  return path === undefined || path === '' ? '/' : path
}
