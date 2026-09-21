<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

/**
 * A panel of anything — a form, a picker, a few settings — anchored to the
 * control that opened it.
 *
 * Not a menu and not a modal. A menu is a list of actions and moves with the
 * arrow keys; a modal takes the whole page. A popover is a small non-modal
 * dialog: focus moves into it on open and back to the trigger on Escape, a
 * click outside or a Tab out of it closes it, and the page behind stays
 * usable.
 *
 * The trigger is yours. The `trigger` slot hands you the attributes and the
 * click handler to bind on whatever you render — usually a `BaseButton` —
 * instead of wrapping it in a button of the kit's, which would nest one
 * button inside another.
 *
 * It opens below the trigger and flips above when there is no room below,
 * and slides sideways rather than off the edge of the screen.
 */
const {
  label,
  side = 'bottom',
  align = 'start',
} = defineProps<{
  /** The panel's accessible name — what a screen reader announces on open. */
  label: string
  /** Where it prefers to open. It flips when there is no room there. */
  side?: 'bottom' | 'top' | undefined
  /** Which edge of the trigger the panel lines up with. */
  align?: 'start' | 'center' | 'end' | undefined
}>()

export interface PopoverTriggerProps {
  'aria-expanded': boolean
  'aria-controls': string
  'aria-haspopup': 'dialog'
  'data-rk-popover-trigger': ''
  onClick: () => void
}

defineSlots<{
  /** The control that opens it. Bind `props` on it: `v-bind="props"`. */
  trigger: (props: { open: boolean; props: PopoverTriggerProps }) => unknown
  /** The panel's content. `close` for a Done or Apply button inside it. */
  default: (props: { close: () => void }) => unknown
}>()

/** Open or closed, with `v-model`. Optional: it manages itself. */
const open = defineModel<boolean>({ default: false })

const id = useId()
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)

/** Where it actually opened, after measuring. */
const placed = ref(side)
/** Pixels slid sideways to stay on screen. */
const shift = ref(0)

const triggerProps = computed<PopoverTriggerProps>(() => ({
  'aria-expanded': open.value,
  'aria-controls': id,
  'aria-haspopup': 'dialog',
  'data-rk-popover-trigger': '',
  onClick: () => (open.value = !open.value),
}))

function close() {
  open.value = false
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function trigger(): HTMLElement | null {
  return root.value?.querySelector<HTMLElement>('[data-rk-popover-trigger]') ?? null
}

/**
 * Measured once it is on screen, because only then is there a size to
 * measure. Flips first, then slides: a panel that fits neither above nor
 * below keeps the side it asked for, where it is at least attached.
 */
function place() {
  if (!panel.value || typeof window === 'undefined') return

  const rect = panel.value.getBoundingClientRect()
  const anchor = root.value!.getBoundingClientRect()
  const below = window.innerHeight - anchor.bottom
  const above = anchor.top

  if (side === 'bottom' && rect.height > below && above > below) placed.value = 'top'
  if (side === 'top' && rect.height > above && below > above) placed.value = 'bottom'

  const margin = 8
  if (rect.right > window.innerWidth - margin) shift.value = window.innerWidth - margin - rect.right
  if (rect.left + shift.value < margin) shift.value = margin - rect.left
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return

  event.preventDefault()
  close()
  trigger()?.focus()
}

/* Tab out of it, and it closes — it is not a trap. Focus that moved to
   nowhere (a click on empty page) is left to the pointer handler. */
function onFocusout(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (next && root.value && !root.value.contains(next)) close()
}

/* Re-measured while it is open: the page can scroll or the window change
   size under an open panel, and one that stays where it opened ends up
   attached to nothing. Passive and capturing, so a scroll inside any
   ancestor counts. */
function watchViewport(on: boolean) {
  if (typeof window === 'undefined') return
  const method = on ? 'addEventListener' : 'removeEventListener'
  window[method]('resize', place)
  window[method]('scroll', place, true)
}

function onDocumentPointer(event: Event) {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

watch(
  open,
  async (isOpen) => {
    if (typeof document === 'undefined') return

    if (!isOpen) {
      document.removeEventListener('pointerdown', onDocumentPointer)
      watchViewport(false)
      return
    }

    document.addEventListener('pointerdown', onDocumentPointer)
    watchViewport(true)
    // Reset before it renders, so it is measured where it asked to be rather
    // than where it ended up last time.
    placed.value = side
    shift.value = 0
    await nextTick()
    place()
    const first = panel.value?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panel.value)?.focus()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onDocumentPointer)
  }
  watchViewport(false)
})
</script>

<template>
  <div ref="root" class="rk-popover" @keydown="onKeydown" @focusout="onFocusout">
    <slot name="trigger" :open="open" :props="triggerProps" />

    <Transition name="rk-popover">
      <div
        v-if="open"
        :id="id"
        ref="panel"
        class="rk-popover-panel surface-overlay"
        :class="[`is-${placed}`, `is-${align}`]"
        :style="shift ? { '--rk-popover-shift': `${shift}px` } : undefined"
        role="dialog"
        :aria-label="label"
        tabindex="-1"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.rk-popover {
  position: relative;
  display: inline-flex;
}

.rk-popover-panel {
  position: absolute;
  z-index: 50;
  min-width: 14rem;
  max-width: min(24rem, calc(100vw - 1rem));
  border-radius: var(--radius-card);
  padding: 0.75rem;
  translate: var(--rk-popover-shift, 0) 0;
}

.rk-popover-panel:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-popover-panel.is-bottom {
  top: calc(100% + 0.5rem);
}

.rk-popover-panel.is-top {
  bottom: calc(100% + 0.5rem);
}

.rk-popover-panel.is-start {
  inset-inline-start: 0;
}

.rk-popover-panel.is-end {
  inset-inline-end: 0;
}

.rk-popover-panel.is-center {
  left: 50%;
  translate: calc(-50% + var(--rk-popover-shift, 0px)) 0;
}

.rk-popover-enter-active,
.rk-popover-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.rk-popover-enter-from,
.rk-popover-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.rk-popover-panel.is-top.rk-popover-enter-from,
.rk-popover-panel.is-top.rk-popover-leave-to {
  transform: translateY(4px) scale(0.98);
}
</style>
