import { onScopeDispose, watch } from 'vue'
import type { Ref } from 'vue'

/** Movement before a press counts as a drag rather than a tap. */
const DRAG_THRESHOLD_PX = 6

/**
 * Drag-to-scroll for a horizontally scrolling element.
 *
 * The app puts `touch-action: pan-y` on the page content so the tab-swipe
 * gesture keeps its pointer events — the browser never claims a horizontal
 * drag, which also means it never pans this element natively. Rather than give
 * that up, horizontal scrolling is driven here.
 *
 * @param target - The scroll container.
 * @returns `didDrag`, so a click handler can ignore the press that ended a drag.
 *
 * @example
 * ```ts
 * const scroller = ref<HTMLElement | null>(null)
 * const { didDrag } = useDragScroll(scroller)
 *
 * function onClick() {
 *   if (didDrag()) return
 *   // …treat as a tap
 * }
 * ```
 */
export function useDragScroll(target: Ref<HTMLElement | null>) {
  let pointerId: number | null = null
  let startX = 0
  let startScroll = 0
  let dragged = false

  function onPointerDown(event: PointerEvent) {
    const element = target.value
    if (!element || event.pointerType === 'mouse') return

    pointerId = event.pointerId
    startX = event.clientX
    startScroll = element.scrollLeft
    dragged = false
  }

  function onPointerMove(event: PointerEvent) {
    const element = target.value
    if (!element || event.pointerId !== pointerId) return

    const dx = event.clientX - startX
    if (!dragged && Math.abs(dx) < DRAG_THRESHOLD_PX) return

    // Capture only once the gesture is clearly horizontal, so a vertical scroll
    // that happens to start here still belongs to the page.
    if (!dragged) {
      dragged = true
      element.setPointerCapture(event.pointerId)
    }

    element.scrollLeft = startScroll - dx
  }

  function onPointerUp(event: PointerEvent) {
    const element = target.value
    if (element?.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId)
    }

    pointerId = null
  }

  function bind(element: HTMLElement) {
    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointercancel', onPointerUp)
  }

  function unbind(element: HTMLElement) {
    element.removeEventListener('pointerdown', onPointerDown)
    element.removeEventListener('pointermove', onPointerMove)
    element.removeEventListener('pointerup', onPointerUp)
    element.removeEventListener('pointercancel', onPointerUp)
  }

  watch(
    target,
    (element, previous) => {
      if (previous) unbind(previous)
      if (element) bind(element)
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    if (target.value) unbind(target.value)
  })

  return { didDrag: () => dragged }
}
