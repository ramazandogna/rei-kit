/** The node every sheet teleports into. */
export const SHEET_ROOT_ID = 'sheet-root'

/**
 * Returns the sheet root, creating it if the page has none.
 *
 * `BaseSheet` teleports out of the app's tree so the app behind it can be
 * marked `inert` — a sheet inside the element it is disabling would disable
 * itself. That means it needs a mount point outside `#app`.
 *
 * It used to need the consuming app to put `<div id="sheet-root">` in its
 * `index.html`, and nothing said so. A page without it got a sheet that opened,
 * blocked the page, and rendered nothing: Vue warns to the console about a
 * missing teleport target and carries on, so the build is green, the types are
 * fine, and the screen is wrong. The kit's own showcase had exactly that bug,
 * which is how it was found.
 *
 * So the node is made on demand. An app that already declares one keeps it —
 * this only fills a gap, it never replaces.
 */
export function ensureSheetRoot(): string {
  const selector = `#${SHEET_ROOT_ID}`

  // Server-rendered: there is no document, and Teleport is skipped anyway.
  if (typeof document === 'undefined') return selector
  if (document.getElementById(SHEET_ROOT_ID)) return selector

  const root = document.createElement('div')
  root.id = SHEET_ROOT_ID
  document.body.appendChild(root)

  return selector
}
