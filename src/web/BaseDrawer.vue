<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { ref } from 'vue'

import BaseButton from '../components/BaseButton.vue'
import { useDialogShell } from '../composables/use-dialog-shell'

/**
 * A panel that comes in from the edge of a wide screen.
 *
 * ## `BaseDrawer`, `BaseSheet` or `BaseModal`
 *
 * A sheet belongs to a thumb: it arrives from the bottom edge and is pinned
 * to the 430px shell column, so on a desktop it is narrow, and that is
 * correct. A drawer is the wide screen's version — it comes from the side,
 * it is as tall as the window, and it is the shape for the things a site
 * keeps beside the page rather than on top of it: filters, a cart, a
 * navigation menu that outgrew its bar, a record's details.
 *
 * A modal interrupts and wants an answer. A drawer does not ask anything —
 * it is somewhere to work, and the page is still behind it.
 *
 * ## It is still a dialog
 *
 * Coming from the side changes where it is, not what it owes. Focus moves
 * in, Tab cannot leave, Escape closes, the page behind goes inert and stops
 * scrolling, and focus goes back to whatever opened it. All of that is
 * `useDialogShell`, shared with `BaseModal`, because a drawer that
 * reimplemented it would be a second copy to keep correct.
 *
 * ## `side` is logical, not left and right
 *
 * `start` and `end` follow the writing direction, so a drawer that opens
 * from the left in English opens from the right in Arabic without the app
 * asking. `top` and `bottom` are there for a command bar or a filter strip,
 * and they are the same component because the contract is identical.
 */
const open = defineModel<boolean>({ required: true })

const {
  title,
  closeLabel,
  side = 'end',
  size = '22rem',
  dismissible = true,
} = defineProps<{
  /** Names the dialog. Already translated. */
  title: string
  /** Accessible name of the close button. Already translated. */
  closeLabel: string
  /** Which edge it comes from. `start` and `end` follow the writing direction. */
  side?: 'start' | 'end' | 'top' | 'bottom' | undefined
  /**
   * How far it reaches in from that edge — a width on the sides, a height on
   * the top and bottom. Any CSS length.
   */
  size?: string | undefined
  /** Escape and the scrim close it. Off for something half filled in. */
  dismissible?: boolean | undefined
}>()

const panel = ref<HTMLElement | null>(null)

function close() {
  open.value = false
}

const { onKeydown } = useDialogShell(open, panel, {
  dismissible: () => dismissible,
  onClose: close,
})

/* A width on the sides, a height on the top and bottom, and never both: a
   drawer that set the other one too could not be told to fill the edge it
   came from. */
const extent = (horizontal: boolean) => (horizontal ? { width: size } : { height: size })
</script>

<template>
  <Teleport to="body">
    <Transition :name="`rk-drawer-${side}`">
      <div v-if="open" class="rk-drawer-scrim" @keydown="onKeydown">
        <div class="rk-drawer-veil" @click="dismissible && close()" />

        <section
          ref="panel"
          class="rk-drawer-panel surface-overlay"
          :class="`is-${side}`"
          :style="extent(side === 'start' || side === 'end')"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
        >
          <header class="rk-drawer-head">
            <h2 class="rk-drawer-title">{{ title }}</h2>
            <BaseButton
              v-if="dismissible"
              variant="ghost"
              size="sm"
              icon
              :aria-label="closeLabel"
              @click="close"
            >
              <X class="size-4" aria-hidden="true" />
            </BaseButton>
          </header>

          <div class="rk-drawer-body"><slot /></div>

          <footer v-if="$slots.actions" class="rk-drawer-actions">
            <slot name="actions" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rk-drawer-scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
}

.rk-drawer-veil {
  position: absolute;
  inset: 0;
  background: color-mix(in oklab, var(--color-ink) 45%, transparent);
  backdrop-filter: blur(2px);
}

.rk-drawer-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 100%;
  outline: none;
  box-shadow: var(--shadow-overlay);
}

/* Logical, so the writing direction decides which edge this is. */
.rk-drawer-panel.is-start {
  margin-inline-end: auto;
  height: 100%;
  border-start-end-radius: var(--radius-card);
  border-end-end-radius: var(--radius-card);
}

.rk-drawer-panel.is-end {
  margin-inline-start: auto;
  height: 100%;
  border-start-start-radius: var(--radius-card);
  border-end-start-radius: var(--radius-card);
}

.rk-drawer-panel.is-top {
  margin-block-end: auto;
  width: 100%;
  border-end-start-radius: var(--radius-card);
  border-end-end-radius: var(--radius-card);
}

.rk-drawer-panel.is-bottom {
  margin-block-start: auto;
  width: 100%;
  border-start-start-radius: var(--radius-card);
  border-start-end-radius: var(--radius-card);
}

.rk-drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-block-end: 1px solid var(--color-hair);
}

.rk-drawer-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-ink);
}

.rk-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

.rk-drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-block-start: 1px solid var(--color-hair);
}

/* One pair per edge: a drawer that slid in from the wrong side reads as a
   different component arriving. */
.rk-drawer-start-enter-active,
.rk-drawer-start-leave-active,
.rk-drawer-end-enter-active,
.rk-drawer-end-leave-active,
.rk-drawer-top-enter-active,
.rk-drawer-top-leave-active,
.rk-drawer-bottom-enter-active,
.rk-drawer-bottom-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}

.rk-drawer-start-enter-active .rk-drawer-panel,
.rk-drawer-start-leave-active .rk-drawer-panel,
.rk-drawer-end-enter-active .rk-drawer-panel,
.rk-drawer-end-leave-active .rk-drawer-panel,
.rk-drawer-top-enter-active .rk-drawer-panel,
.rk-drawer-top-leave-active .rk-drawer-panel,
.rk-drawer-bottom-enter-active .rk-drawer-panel,
.rk-drawer-bottom-leave-active .rk-drawer-panel {
  transition: transform var(--duration-base) var(--ease-sheet);
}

.rk-drawer-start-enter-from,
.rk-drawer-start-leave-to,
.rk-drawer-end-enter-from,
.rk-drawer-end-leave-to,
.rk-drawer-top-enter-from,
.rk-drawer-top-leave-to,
.rk-drawer-bottom-enter-from,
.rk-drawer-bottom-leave-to {
  opacity: 0;
}

.rk-drawer-start-enter-from .rk-drawer-panel,
.rk-drawer-start-leave-to .rk-drawer-panel {
  transform: translateX(-100%);
}

.rk-drawer-end-enter-from .rk-drawer-panel,
.rk-drawer-end-leave-to .rk-drawer-panel {
  transform: translateX(100%);
}

.rk-drawer-top-enter-from .rk-drawer-panel,
.rk-drawer-top-leave-to .rk-drawer-panel {
  transform: translateY(-100%);
}

.rk-drawer-bottom-enter-from .rk-drawer-panel,
.rk-drawer-bottom-leave-to .rk-drawer-panel {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .rk-drawer-start-enter-active .rk-drawer-panel,
  .rk-drawer-start-leave-active .rk-drawer-panel,
  .rk-drawer-end-enter-active .rk-drawer-panel,
  .rk-drawer-end-leave-active .rk-drawer-panel,
  .rk-drawer-top-enter-active .rk-drawer-panel,
  .rk-drawer-top-leave-active .rk-drawer-panel,
  .rk-drawer-bottom-enter-active .rk-drawer-panel,
  .rk-drawer-bottom-leave-active .rk-drawer-panel {
    transition: none;
    transform: none;
  }
}
</style>
