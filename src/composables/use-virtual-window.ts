import { computed, ref } from 'vue'
import type { Ref } from 'vue'

/** Rows of slack each way, so a fast scroll does not show a gap before the
 *  next frame fills it. */
const OVERSCAN_ROWS = 3

export interface VirtualWindowOptions {
  /** How many rows there are in total. */
  count: Ref<number>
  /** Every row is this tall, in pixels. Fixed — that is what makes the
   *  arithmetic possible without measuring each one. */
  rowHeight: Ref<number>
  /**
   * Below this many rows the window is the whole list and the padding is
   * zero, so a short list renders exactly as it would without any of this.
   */
  threshold: Ref<number>
}

/**
 * The arithmetic behind a windowed list: which rows are near the viewport,
 * and how much empty space stands in for the rest.
 *
 * This is the part `BaseCombobox` and `VirtualList` share. It was written
 * inside the combobox first, and pulling it out here is the reason there is
 * one copy of it rather than two — the second would have drifted, and the
 * half that drifts silently is the padding, which is what keeps the
 * scrollbar honest about how long the list is.
 *
 * There is no clock and no observer in here: it is a function of the scroll
 * position, and the component that owns the element is what tells it where
 * that is. That is also what makes it testable without a layout.
 */
export function useVirtualWindow({ count, rowHeight, threshold }: VirtualWindowOptions) {
  /** How far down the list is scrolled. Set by the owner from a scroll event. */
  const scrollTop = ref(0)
  /** How tall the viewport is. Measured by the owner, never guessed here. */
  const viewportHeight = ref(0)

  const active = computed(() => count.value > threshold.value)

  const window_ = computed(() => {
    if (!active.value) return { start: 0, end: count.value }

    const first = Math.max(0, Math.floor(scrollTop.value / rowHeight.value) - OVERSCAN_ROWS)
    const rows = Math.ceil(viewportHeight.value / rowHeight.value) + OVERSCAN_ROWS * 2

    return { start: first, end: Math.min(count.value, first + rows) }
  })

  /** The empty space standing in for the rows above and below the window. */
  const padTop = computed(() => (active.value ? window_.value.start * rowHeight.value : 0))
  const padBottom = computed(() =>
    active.value ? (count.value - window_.value.end) * rowHeight.value : 0,
  )

  /** Takes the scroll position straight off the event the owner received. */
  function onScroll(event: Event) {
    scrollTop.value = (event.target as HTMLElement).scrollTop
  }

  return { active, window: window_, padTop, padBottom, scrollTop, viewportHeight, onScroll }
}
