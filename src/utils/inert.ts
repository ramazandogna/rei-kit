/**
 * How many open layers hold each element inert. An element set inert by the
 * app itself is never in here, so releasing never undoes the app's own choice.
 */
const holds = new Map<Element, number>()

/**
 * Takes everything on the page except the branch holding `keep` out of tab
 * order and pointer events, and returns the function that gives it back.
 *
 * `inert` is a real focus trap without keydown bookkeeping, and the only one
 * that also stops a screen reader's virtual cursor. It used to be applied to
 * `document.getElementById('app')` — the id Vite's template happens to use —
 * so an app mounted on `#root` got a dialog whose background was still
 * reachable with Tab, and nothing said so. Working from `<body>`'s children
 * instead holds whatever the app is mounted on, and anything else teleported
 * there too.
 *
 * Counted per element, so a sheet opened over a sheet, or a tour over either,
 * does not hand the page back when the inner one closes.
 */
export function inertOutside(keep: Element): () => void {
  if (typeof document === 'undefined') return () => {}

  const taken: Element[] = []

  for (const element of Array.from(document.body.children)) {
    if (element.contains(keep)) continue

    const count = holds.get(element)
    if (count === undefined) {
      if (element.hasAttribute('inert')) continue
      element.setAttribute('inert', '')
    }
    holds.set(element, (count ?? 0) + 1)
    taken.push(element)
  }

  let released = false

  return () => {
    if (released) return
    released = true

    for (const element of taken) {
      const count = (holds.get(element) ?? 1) - 1
      if (count > 0) {
        holds.set(element, count)
        continue
      }
      holds.delete(element)
      element.removeAttribute('inert')
    }
  }
}
