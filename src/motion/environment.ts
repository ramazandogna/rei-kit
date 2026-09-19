/**
 * What every moving part asks before it moves.
 *
 * Kept in one place so the answers cannot drift apart: a counter that honoured
 * reduced motion beside a marquee that did not would be worse than neither.
 * Each is safe to call on a server, where the answer is "do not move" — the
 * server renders the final state, and that is what a reader without
 * JavaScript should see.
 */

/** Whether the reader has asked the operating system for less motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** One frame from now, or the nearest thing to it where frames do not exist. */
export function nextFrame(callback: () => void): () => void {
  if (typeof requestAnimationFrame === 'function') {
    const id = requestAnimationFrame(callback)

    return () => cancelAnimationFrame(id)
  }

  const id = setTimeout(callback, 16)

  return () => clearTimeout(id)
}

/**
 * Calls `callback` with whether `element` is on screen, each time that
 * changes. Returns the function that stops watching.
 *
 * Without `IntersectionObserver` the element counts as visible straight away:
 * an animation that never starts is a missing number, not a missing flourish.
 */
export function watchVisibility(
  element: Element,
  callback: (visible: boolean) => void,
  threshold = 0.25,
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    callback(true)

    return () => {}
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) callback(entry.isIntersecting)
    },
    { threshold },
  )
  observer.observe(element)

  return () => observer.disconnect()
}
