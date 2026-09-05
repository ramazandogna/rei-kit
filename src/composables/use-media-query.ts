import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Whether a media query matches, kept up to date.
 *
 * Starts false and resolves on mount, which is deliberate: this is the one
 * place a component is tempted to branch on viewport during render, and doing
 * that under prerendering produces HTML built for a screen the server does not
 * have. Hydration then swaps it and the page jumps. False first, correct a
 * frame later, no jump — and a layout that reads badly at `false` is a layout
 * with a mobile-first bug worth knowing about.
 *
 * Guarded for the server for the same reason the rest of the kit is: this
 * package has to be importable in Node, and `matchMedia` does not exist there.
 *
 * @example
 * ```ts
 * const wide = useMediaQuery('(min-width: 64rem)')
 * ```
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)

  let list: MediaQueryList | undefined

  function update(event: MediaQueryList | MediaQueryListEvent) {
    matches.value = event.matches
  }

  onMounted(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    list = window.matchMedia(query)
    update(list)
    list.addEventListener('change', update)
  })

  onBeforeUnmount(() => {
    list?.removeEventListener('change', update)
  })

  return matches
}
