<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

/**
 * A list of actions behind one control.
 *
 * ## `role="menu"` is a promise
 *
 * Declaring it tells a screen reader that the arrow keys move between the
 * items, that Escape closes, and that Tab leaves rather than walking through.
 * A div with `role="menu"` and none of that is worse than a plain list of
 * links: it announces a contract and then breaks it, and the reader is left
 * pressing keys that do nothing.
 *
 * The hand-written menu this replaces declared the role and had none of the
 * behaviour. That is the usual shape of the bug — the roles are the part people
 * remember, because they are the part you can see in the markup.
 *
 * So: focus moves into the menu on open and back to the trigger on close,
 * ArrowUp/ArrowDown move and wrap, Home and End jump, Escape closes, and a
 * click outside closes. Items are found in the DOM rather than declared as
 * data, so a caller can mix links, buttons and separators freely.
 *
 * @example
 * ```vue
 * <BaseMenu :label="t('nav.account')">
 *   <template #trigger="{ open }">
 *     <BaseAvatar :label="t('nav.account')" />
 *   </template>
 *
 *   <RouterLink to="/profil" role="menuitem">{{ t('nav.profile') }}</RouterLink>
 *   <button type="button" role="menuitem" @click="signOut">{{ t('auth.signOut') }}</button>
 * </BaseMenu>
 * ```
 */
const { label, align = 'end' } = defineProps<{
  /** Accessible name for the trigger. Required: the trigger is usually a glyph. */
  label: string
  /** Which edge the panel lines up with. */
  align?: 'start' | 'end' | undefined
}>()

defineSlots<{
  /** The control that opens it. Receives the open state for its own styling. */
  trigger?: (props: { open: boolean }) => unknown
  /** The items. Anything with `role="menuitem"` joins the keyboard order. */
  default: () => unknown
}>()

const open = defineModel<boolean>({ default: false })

const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const trigger = ref<HTMLElement | null>(null)

const id = useId()

function items(): HTMLElement[] {
  if (!panel.value) return []

  return Array.from(panel.value.querySelectorAll<HTMLElement>('[role="menuitem"]'))
}

function focusAt(index: number) {
  const list = items()
  if (list.length === 0) return

  // Wrapping, because a list with no edges is faster than one you fall off.
  const wrapped = (index + list.length) % list.length
  list[wrapped]?.focus()
}

function currentIndex(): number {
  return items().indexOf(document.activeElement as HTMLElement)
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value) {
    // The arrows open the menu from the trigger, which is what makes it
    // reachable without a mouse in the first place.
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      open.value = true
    }

    return
  }

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      open.value = false
      break
    case 'ArrowDown':
      event.preventDefault()
      focusAt(currentIndex() + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusAt(currentIndex() - 1)
      break
    case 'Home':
      event.preventDefault()
      focusAt(0)
      break
    case 'End':
      event.preventDefault()
      focusAt(items().length - 1)
      break
    case 'Tab':
      // Tab leaves the menu rather than cycling inside it. This is the one
      // place a menu differs from a dialog, and getting it backwards traps
      // somebody in a list of links.
      open.value = false
      break
  }
}

function onDocumentPointer(event: Event) {
  if (root.value && !root.value.contains(event.target as Node)) open.value = false
}

/* `immediate`, because a menu can be mounted already open -- a caller driving
   it from a route, or a test. Without it that menu has no outside-click
   listener and never moves focus, and nothing says so: it looks open and
   behaves like a div. The closed case is a no-op, since removing a listener
   that was never added is free and focus is only taken back from inside. */
watch(
  open,
  async (isOpen) => {
    if (typeof document === 'undefined') return

    if (isOpen) {
      document.addEventListener('pointerdown', onDocumentPointer)
      await nextTick()
      items()[0]?.focus()
    } else {
      document.removeEventListener('pointerdown', onDocumentPointer)
      // Only take focus back if it is still inside the menu; otherwise the menu
      // is closing *because* the reader went somewhere else, and dragging them
      // back is the rudest thing it could do.
      if (root.value?.contains(document.activeElement)) trigger.value?.focus()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onDocumentPointer)
  }
})
</script>

<template>
  <div ref="root" class="rk-menu" @keydown="onKeydown">
    <button
      ref="trigger"
      type="button"
      class="rk-menu-trigger"
      :aria-label="label"
      :aria-expanded="open"
      :aria-haspopup="true"
      :aria-controls="open ? id : undefined"
      @click="open = !open"
    >
      <slot name="trigger" :open="open" />
    </button>

    <div v-if="open" :id="id" ref="panel" class="rk-menu-panel" :class="`is-${align}`" role="menu">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.rk-menu {
  position: relative;
  display: inline-flex;
}

.rk-menu-trigger {
  display: inline-flex;
  border-radius: var(--radius-cell);
}

.rk-menu-trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-menu-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  z-index: 50;
  min-width: 12rem;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid color-mix(in srgb, var(--color-hair) 70%, transparent);
  background: var(--color-surface);
  padding: 0.375rem;
  box-shadow: 0 10px 24px -8px rgb(0 0 0 / 0.25);
}

.rk-menu-panel.is-end {
  right: 0;
}

.rk-menu-panel.is-start {
  left: 0;
}

/* The items belong to the caller, so this styles them by role rather than by
   class: whatever they render, it lines up. */
.rk-menu-panel :deep([role='menuitem']) {
  display: block;
  width: 100%;
  border-radius: var(--radius-cell);
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  color: var(--color-ink);
  transition: background-color 150ms;
}

.rk-menu-panel :deep([role='menuitem']:hover) {
  background: var(--color-muted);
}

.rk-menu-panel :deep([role='menuitem']:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.rk-menu-panel :deep(hr) {
  margin: 0.375rem 0;
  height: 1px;
  border: 0;
  background: color-mix(in srgb, var(--color-hair) 70%, transparent);
}
</style>
