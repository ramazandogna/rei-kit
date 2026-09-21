/**
 * Moves focus to an element that was never meant to take it.
 *
 * A `<main>`, a heading, the top of a view: none of them are focusable, and
 * both places the kit needs this — `SkipLink` and `createRouteAnnouncer` —
 * fail in the same invisible way without it. A skip link scrolls the page
 * and leaves focus in the header; a route change swaps the content and
 * leaves focus on the link that is no longer there.
 *
 * `tabindex="-1"` makes the element focusable by script and never by Tab,
 * which is the whole trick. It is left behind rather than cleaned up: a
 * reader that moves out and comes back would otherwise find an unfocusable
 * target the second time.
 *
 * @param target - The element, or the `id` of one. A missing one is a no-op.
 * @returns Whether focus moved, so a caller can fall back.
 */
export function focusTarget(target: Element | string | null): boolean {
  const element = typeof target === 'string' ? document.getElementById(target) : target
  if (!(element instanceof HTMLElement)) return false

  if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1')

  // `focus()` scrolls it into view on its own, which is why there is no
  // `scrollIntoView` beside it.
  element.focus()

  return true
}
