<script setup lang="ts">
import { useId } from 'vue'

/**
 * A short label that appears beside a control.
 *
 * ## CSS, not JavaScript, and that is a decision
 *
 * The bubble is shown by `:hover` and `:focus-within` in the stylesheet. No
 * listener, no state, no positioning library. That costs collision detection —
 * a tooltip near the right edge is clipped rather than flipped — and buys the
 * only thing that matters more: it works in a prerendered page, before the
 * bundle has arrived, and with JavaScript switched off entirely.
 *
 * `:focus-within` rather than `:hover` alone is the part people leave out. A
 * tooltip that only answers a mouse is a tooltip that does not exist for anyone
 * using a keyboard, and the content is usually the only explanation of what the
 * control does.
 *
 * The bubble is wired with `aria-describedby`, so a screen reader reads it as a
 * description of the control rather than as loose text nearby. That is why the
 * trigger goes in a slot: the component has to own the id on both ends.
 *
 * ## When not to use it
 *
 * For anything the reader must have. A tooltip is unreachable on a touch screen
 * without a hover state, so text that changes a decision belongs on the page.
 */
const { label, placement = 'top' } = defineProps<{
  /** The description. Already translated. */
  label: string
  placement?: 'top' | 'bottom' | undefined
}>()

defineSlots<{
  /** The control being described. */
  default: (props: { describedBy: string }) => unknown
}>()

const id = useId()
</script>

<template>
  <span class="rk-tip">
    <slot :described-by="id" />

    <!-- `role="tooltip"` and the id, so the control can point at it. Not
         `aria-hidden`: it is the description, not decoration. -->
    <span :id="id" role="tooltip" class="rk-tip-bubble" :class="`is-${placement}`">
      {{ label }}
    </span>
  </span>
</template>

<style scoped>
.rk-tip {
  position: relative;
  display: inline-flex;
}

.rk-tip-bubble {
  position: absolute;
  left: 50%;
  z-index: 60;
  width: max-content;
  max-width: 16rem;
  transform: translateX(-50%);
  border-radius: var(--radius-cell);
  background: var(--color-ink);
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-canvas);
  opacity: 0;
  /* Out of the hit area while hidden, or it would swallow the pointer on its
     way to the control it describes. */
  pointer-events: none;
  transition: opacity 150ms ease;
}

.rk-tip-bubble.is-top {
  bottom: calc(100% + 0.375rem);
}

.rk-tip-bubble.is-bottom {
  top: calc(100% + 0.375rem);
}

.rk-tip:hover .rk-tip-bubble,
.rk-tip:focus-within .rk-tip-bubble {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .rk-tip-bubble {
    transition: none;
  }
}
</style>
