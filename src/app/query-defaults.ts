/**
 * The cache settings two apps had picked independently and identically.
 *
 * Returned as a plain object rather than a built `QueryClient`, so the kit does
 * not depend on TanStack Query. An app that uses a different cache — or none —
 * pays nothing for this file, and the app keeps the client as its own
 * module-level singleton, which is what lets non-Vue code reach it (the auth
 * store calls `clear()` on sign-out).
 *
 * The numbers are not arbitrary and they are not TanStack's defaults:
 *
 * - `staleTime: 60_000` — the default is 0, which refetches on every mount. A
 *   phone app remounts a screen every time a tab is touched, so the default
 *   turns a tab bar into a network request per tap.
 * - `refetchOnWindowFocus` — left on. Coming back to a backgrounded phone app
 *   is exactly when the data is most likely to be stale.
 * - `retry: 2` on queries, `0` on mutations. Retrying a read is free; retrying
 *   a write that may already have landed is how a double charge happens.
 *
 * @example
 * ```ts
 * export const queryClient = new QueryClient({ defaultOptions: createQueryDefaults() })
 * ```
 */
export function createQueryDefaults(overrides: QueryDefaultsOverrides = {}) {
  const { staleTime = 60_000, gcTime = 5 * 60_000, retry = 2 } = overrides

  return {
    queries: {
      staleTime,
      gcTime,
      refetchOnWindowFocus: true,
      retry,
    },
    mutations: {
      // Not a typo and not a stricter version of the line above. A failed read
      // can be repeated safely; a failed write may have reached the server
      // before the response was lost.
      retry: 0,
    },
  }
}

export type QueryDefaultsOverrides = {
  /** How long a result is served without refetching. Default 60s. */
  staleTime?: number | undefined
  /** How long an unused result is kept before eviction. Default 5m. */
  gcTime?: number | undefined
  /** Attempts for a failed *query*. Mutations are never retried. Default 2. */
  retry?: number | undefined
}
