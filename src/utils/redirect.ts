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
