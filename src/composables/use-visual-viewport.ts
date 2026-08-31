import { onScopeDispose, readonly, ref } from 'vue'

/** The visible area, once the on-screen keyboard has taken its share. */
export interface VisualViewportRect {
  height: number
  offsetTop: number
}

/**
 * Tracks the visual viewport.
 *
 * Chrome and Android browsers honour `interactive-widget=resizes-content`, so
 * the layout viewport already shrinks for the keyboard there. Safari on iOS
 * does not implement it: it shrinks only the *visual* viewport, leaving a sheet
 * sized in `dvh` sitting partly underneath the keyboard.
 *
 * `null` means the API is unavailable, which callers should read as "trust the
 * layout viewport" rather than as zero.
 *
 * @example
 * ```ts
 * const viewport = useVisualViewport()
 * // :style="viewport ? { height: `${viewport.height}px` } : undefined"
 * ```
 */
export function useVisualViewport() {
  const rect = ref<VisualViewportRect | null>(null)

  const viewport = window.visualViewport
  if (!viewport) return readonly(rect)

  function read() {
    if (!viewport) return

    rect.value = { height: viewport.height, offsetTop: viewport.offsetTop }
  }

  read()

  // `scroll` matters as much as `resize`: iOS shifts the visual viewport up to
  // keep the focused field visible, without changing its height.
  viewport.addEventListener('resize', read)
  viewport.addEventListener('scroll', read)

  onScopeDispose(() => {
    viewport.removeEventListener('resize', read)
    viewport.removeEventListener('scroll', read)
  })

  return readonly(rect)
}
