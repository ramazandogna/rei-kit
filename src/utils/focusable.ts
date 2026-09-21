/**
 * What the keyboard can reach, as one selector.
 *
 * Three parts of the kit ask this question and each had written its own
 * answer, which is how three answers came to differ: the dialog trap and
 * the popover agreed, and `ScrollArea` left out `:not([disabled])`, so a
 * box holding nothing but disabled buttons counted as reachable and was
 * denied the focus stop that would have been its only way in.
 *
 * `summary` belongs here for the same reason it belonged in `ScrollArea`:
 * a `<details>` heading takes focus, and a dialog whose trap skipped one
 * would let Tab out of itself.
 *
 * Two things it deliberately does not do. It does not check whether an
 * element is visible or inside an `inert` subtree — a selector cannot, and
 * every caller here is already scoped to something on screen. And it is
 * not what a roving-tabindex container should use to find its own
 * controls: `[tabindex]:not([tabindex="-1"])` matches exactly the one
 * control such a container has already put in the tab order, so it would
 * find one item and then stop. `BaseToolbar` says so where it keeps its
 * own.
 */
export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

/** The reachable elements inside `root`, in document order. */
export function focusableWithin(root: Element | null | undefined): HTMLElement[] {
  return Array.from(root?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
}
