import { onBeforeUnmount, ref, watch } from 'vue'
import type { Ref } from 'vue'

/** Above the anchor or below it. */
export type PanelSide = 'top' | 'bottom'

export interface AnchoredPanelOptions {
  /** The element the panel is positioned against. */
  root: Ref<HTMLElement | null>
  /** The panel itself, measured once it is on screen. */
  panel: Ref<HTMLElement | null>
  /** Whether it is showing. */
  open: Ref<boolean>
  /** Which way it opens before anything is measured. */
  side?: PanelSide
  /** How close to the window edge it may come, in pixels. */
  margin?: number
}

/**
 * Keeping a panel on screen.
 *
 * Two corrections, in this order, because they are not equal. **Flip**: a
 * panel that does not fit below its anchor opens above it when there is
 * more room there. **Shift**: whatever is left of it past the side of the
 * window is slid back in.
 *
 * A panel taller than the window fits neither way, and then the rule is
 * still "more room wins" — which shows more of it, and leaves the rest
 * scrolled to rather than gone. `BasePopover` carried a comment saying it
 * kept the side it asked for in that case; it never did, and nothing
 * checked, because the arithmetic had never been given a layout to work
 * on. The comment is gone and the behaviour is the one under test.
 *
 * This was written inside `BasePopover`, which is how the kit came to ship
 * a popover that flips and a menu that does not. `BaseMenu`'s panel was
 * pinned under its trigger with `top: 100%`, so a menu button near the
 * bottom of a window — a row action, the `…` on a card, anything on a
 * phone — opened a list that ran off the bottom of the screen. Nothing said
 * so: it rendered, it passed axe, and the items were all there.
 *
 * Re-measured while open, because the page can scroll or the window change
 * size underneath, and a panel that stays where it opened ends up attached
 * to nothing. The scroll listener captures, so a scroll in any ancestor
 * counts, and it is passive-by-omission: it only reads.
 */
export function useAnchoredPanel({
  root,
  panel,
  open,
  side = 'bottom',
  margin = 8,
}: AnchoredPanelOptions) {
  /** Where it actually opened, after measuring. */
  const placed = ref<PanelSide>(side)
  /** Pixels slid sideways to stay on screen. */
  const shift = ref(0)

  function place() {
    if (!panel.value || !root.value || typeof window === 'undefined') return

    const rect = panel.value.getBoundingClientRect()
    const anchor = root.value.getBoundingClientRect()
    const below = window.innerHeight - anchor.bottom
    const above = anchor.top

    if (side === 'bottom' && rect.height > below && above > below) placed.value = 'top'
    if (side === 'top' && rect.height > above && below > above) placed.value = 'bottom'

    if (rect.right > window.innerWidth - margin) {
      shift.value = window.innerWidth - margin - rect.right
    }
    if (rect.left + shift.value < margin) shift.value = margin - rect.left
  }

  function listen(on: boolean) {
    if (typeof window === 'undefined') return

    const method = on ? 'addEventListener' : 'removeEventListener'
    window[method]('resize', place)
    window[method]('scroll', place, true)
  }

  /** Measured where it asked to be, rather than where it ended up last time. */
  function reset() {
    placed.value = side
    shift.value = 0
  }

  watch(open, (isOpen) => listen(isOpen), { immediate: true })

  onBeforeUnmount(() => listen(false))

  return { placed, shift, place, reset }
}
