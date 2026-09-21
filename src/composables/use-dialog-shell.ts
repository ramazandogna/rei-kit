import { nextTick, onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'

import { inertOutside } from '../utils/inert'

/**
 * What every modal surface has to do, in one place.
 *
 * A dialog, a drawer and anything else that takes the whole page share a
 * list that is easy to get nearly right: trap Tab, stop Escape, make the
 * rest of the page inert, stop it scrolling underneath, and hand focus back
 * to whatever opened it. Each of those has an order that matters, and the
 * orders are not obvious — releasing `inert` *after* restoring focus drops
 * it on the body, because an inert element cannot take focus. That was
 * written once, correctly, in `BaseModal`; a drawer that copied it would be
 * a second copy to keep correct.
 *
 * The Tab wrap has to be done by hand: the browser's own Tab order is the
 * whole document, and a dialog is only part of it. `inert` is what also
 * stops a screen reader's virtual cursor, which walks straight past a
 * keydown handler.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface DialogShellOptions {
  /** Whether Escape and the scrim close it. */
  dismissible?: () => boolean
  /** Called when the shell decides it should close. */
  onClose: () => void
}

export function useDialogShell(
  open: Ref<boolean>,
  panel: Ref<HTMLElement | null>,
  { dismissible = () => true, onClose }: DialogShellOptions,
) {
  let releaseInert: (() => void) | null = null
  let restoreTo: HTMLElement | null = null

  const focusable = (): HTMLElement[] =>
    panel.value ? Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)) : []

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && dismissible()) {
      event.stopPropagation()
      onClose()

      return
    }

    if (event.key !== 'Tab') return

    const items = focusable()
    if (items.length === 0) return event.preventDefault()

    const first = items[0]!
    const last = items[items.length - 1]!
    const active = document.activeElement

    if (event.shiftKey && (active === first || !panel.value?.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(open, async (isOpen) => {
    if (isOpen) {
      restoreTo = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      await nextTick()
      if (panel.value) releaseInert = inertOutside(panel.value)
      // The panel itself when it holds nothing focusable, so focus is at
      // least inside rather than behind.
      ;(focusable()[0] ?? panel.value)?.focus()
    } else {
      document.body.style.overflow = ''
      // Before focus goes back: an inert element cannot take it.
      releaseInert?.()
      releaseInert = null
      restoreTo?.focus()
      restoreTo = null
    }
  })

  // Unmounted while open, the page would otherwise stay unscrollable with
  // nothing on screen to explain why.
  onBeforeUnmount(() => {
    if (open.value) document.body.style.overflow = ''
    releaseInert?.()
  })

  return { onKeydown, focusable }
}
