<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

/**
 * A dialog that arrives from nowhere.
 *
 * Not `BaseSheet` with different padding. A sheet slides up from the bottom
 * edge, is dismissed by dragging it back down, and belongs to a thumb; a modal
 * appears in the middle of what you were reading and is dismissed by leaving
 * it. They are two answers to two questions and merging them would give a
 * component that is wrong on a phone and wrong on a desktop.
 *
 * ## The parts that are easy to get wrong
 *
 * This is why it exists rather than being written per dialog, which is what the
 * one wide consumer was doing in two places. None of the following is visible
 * on screen when it is missing:
 *
 * - **Focus moves in and comes back.** Opening without moving focus leaves a
 *   keyboard user behind the dialog, operating a page they cannot see. Closing
 *   without restoring it drops them at the top of the document.
 * - **Tab does not leave.** A dialog you can Tab out of is a dialog that is
 *   modal only to somebody using a mouse.
 * - **Escape closes.** Every dialog in every application does this.
 * - **The page underneath does not scroll.** Otherwise dismissing the dialog
 *   returns you somewhere else.
 * - **The backdrop closes it, the panel does not.** A click that starts inside
 *   the panel and ends on the backdrop is not a click on the backdrop, which is
 *   why this listens for a press on the backdrop itself rather than any click
 *   that reaches it.
 */
const {
  title,
  closeLabel,
  tone = 'default',
  dismissible = true,
} = defineProps<{
  /** Names the dialog for assistive tech. Required; an unnamed dialog is a box. */
  title: string
  /** Accessible name for the close button. */
  closeLabel: string
  /**
   * `alert` marks it as a decision that interrupts — `role="alertdialog"`,
   * which a screen reader announces immediately rather than on arrival.
   */
  tone?: 'default' | 'alert' | undefined
  /**
   * Whether Escape and the backdrop close it.
   *
   * Off for a dialog that must be answered — but never off as a way of forcing
   * a reader to a decision they have not been given the information for.
   */
  dismissible?: boolean | undefined
}>()

const open = defineModel<boolean>({ default: false })

defineSlots<{
  /** The body. */
  default: () => unknown
  /** Buttons, at the foot. */
  actions?: () => unknown
}>()

const panel = ref<HTMLElement | null>(null)
/** Who had focus before this opened, so it can be given back. */
let restoreTo: HTMLElement | null = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusable(): HTMLElement[] {
  if (!panel.value) return []

  return Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && dismissible) {
    event.stopPropagation()
    open.value = false

    return
  }

  if (event.key !== 'Tab') return

  const items = focusable()
  if (items.length === 0) return event.preventDefault()

  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement

  // The wrap has to be done by hand: the browser's own Tab order is the whole
  // document, and the dialog is only part of it.
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
    // The panel itself when it holds nothing focusable, so focus is at least
    // inside the dialog rather than behind it.
    ;(focusable()[0] ?? panel.value)?.focus()
  } else {
    document.body.style.overflow = ''
    restoreTo?.focus()
    restoreTo = null
  }
})

// A dialog unmounted while open would otherwise leave the page unscrollable,
// with nothing on screen to explain why.
onBeforeUnmount(() => {
  if (open.value) document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="rk-modal">
      <div
        v-if="open"
        class="rk-modal-scrim"
        @keydown="onKeydown"
        @mousedown.self="dismissible && (open = false)"
      >
        <div
          ref="panel"
          class="rk-modal-panel"
          :role="tone === 'alert' ? 'alertdialog' : 'dialog'"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
        >
          <div class="rk-modal-head">
            <h2 class="rk-modal-title">{{ title }}</h2>

            <button
              v-if="dismissible"
              type="button"
              class="rk-modal-close"
              :aria-label="closeLabel"
              @click="open = false"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div class="rk-modal-body"><slot /></div>

          <div v-if="$slots.actions" class="rk-modal-actions"><slot name="actions" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rk-modal-scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: color-mix(in srgb, var(--color-ink) 70%, transparent);
  backdrop-filter: blur(4px);
}

.rk-modal-panel {
  width: 100%;
  max-width: 28rem;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: var(--radius-card);
  background: var(--color-surface);
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.2);
}

.rk-modal-panel:focus {
  outline: none;
}

.rk-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.rk-modal-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--color-ink);
}

.rk-modal-close {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  color: var(--color-ink-soft);
  transition: background-color 150ms;
}

.rk-modal-close:hover {
  background: var(--color-muted);
}

.rk-modal-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-modal-close svg {
  width: 1rem;
  height: 1rem;
}

.rk-modal-body {
  margin-top: 0.75rem;
  color: var(--color-ink-soft);
  font-size: 0.875rem;
  line-height: 1.625;
}

.rk-modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.rk-modal-enter-active,
.rk-modal-leave-active {
  transition: opacity 180ms ease;
}

.rk-modal-enter-active .rk-modal-panel,
.rk-modal-leave-active .rk-modal-panel {
  transition:
    transform 180ms cubic-bezier(0.32, 0.72, 0, 1),
    opacity 180ms ease;
}

.rk-modal-enter-from,
.rk-modal-leave-to {
  opacity: 0;
}

/* From nowhere, not from an edge: a scale is what separates this from a sheet. */
.rk-modal-enter-from .rk-modal-panel,
.rk-modal-leave-to .rk-modal-panel {
  transform: scale(0.96);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .rk-modal-enter-active .rk-modal-panel,
  .rk-modal-leave-active .rk-modal-panel {
    transition: opacity 180ms ease;
    transform: none;
  }

  .rk-modal-enter-from .rk-modal-panel,
  .rk-modal-leave-to .rk-modal-panel {
    transform: none;
  }
}
</style>
