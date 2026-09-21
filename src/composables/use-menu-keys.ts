import type { Ref } from 'vue'

/**
 * The keyboard contract `role="menu"` promises.
 *
 * Declaring `role="menu"` is a promise to a screen reader: the arrows move
 * through the items, Home and End go to the ends, Escape closes, and Tab
 * *leaves* rather than cycling inside. That last one is the single place a
 * menu differs from a dialog, and getting it backwards traps somebody in a
 * list of links.
 *
 * It lives here because a menu anchored to a button and a menu anchored to
 * wherever the pointer was are the same keyboard and two different
 * positions. Only the position is worth writing twice.
 */
export interface MenuKeysOptions {
  /** The element holding the `[role="menuitem"]` children. */
  panel: Ref<HTMLElement | null>
  /** Close it — Escape, and Tab on the way out. */
  onClose: () => void
}

export function useMenuKeys({ panel, onClose }: MenuKeysOptions) {
  const items = (): HTMLElement[] =>
    panel.value ? Array.from(panel.value.querySelectorAll<HTMLElement>('[role="menuitem"]')) : []

  function focusAt(index: number) {
    const list = items()
    if (list.length === 0) return

    // Wrapping, because a list with no edges is faster than one you fall off.
    list[(index + list.length) % list.length]?.focus()
  }

  const currentIndex = () => items().indexOf(document.activeElement as HTMLElement)

  /** Returns whether the key was one of the menu's own. */
  function onKeydown(event: KeyboardEvent): boolean {
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        onClose()
        return true
      case 'ArrowDown':
        event.preventDefault()
        focusAt(currentIndex() + 1)
        return true
      case 'ArrowUp':
        event.preventDefault()
        focusAt(currentIndex() - 1)
        return true
      case 'Home':
        event.preventDefault()
        focusAt(0)
        return true
      case 'End':
        event.preventDefault()
        focusAt(items().length - 1)
        return true
      case 'Tab':
        onClose()
        return true
      default:
        return false
    }
  }

  return { items, focusAt, currentIndex, onKeydown }
}
