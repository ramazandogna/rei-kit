<script setup lang="ts">
import { onBeforeUnmount, ref, useId } from 'vue'

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
 * ## `follow`, and what it costs
 *
 * With `follow` the bubble tracks the pointer across the trigger, which is
 * what a large target wants — a chart, a map, a calendar cell — where a
 * bubble pinned to the middle can be nowhere near what is under the cursor.
 *
 * It is opt-in because it is the one thing here that needs JavaScript: a
 * `follow` tooltip does nothing until the bundle arrives, while the default
 * works in a prerendered page with scripting switched off. It also stops
 * following for a reader who asked their system for less motion, and for a
 * keyboard, which has no cursor to follow — both fall back to the anchored
 * position, so the tooltip is never lost, only still.
 *
 * ## When not to use it
 *
 * For anything the reader must have. A tooltip is unreachable on a touch screen
 * without a hover state, so text that changes a decision belongs on the page.
 */
const {
  label,
  placement = 'top',
  follow = false,
  offset = 14,
} = defineProps<{
  /** The description. Already translated. */
  label: string
  placement?: 'top' | 'bottom' | undefined
  /** Track the pointer across the trigger instead of pinning to its middle. */
  follow?: boolean | undefined
  /** How far the bubble sits from the pointer, in pixels. */
  offset?: number | undefined
}>()

defineSlots<{
  /** The control being described. */
  default: (props: { describedBy: string }) => unknown
}>()

const id = useId()

/** Where the pointer is inside the trigger, or null when it is not. */
const at = ref<{ x: number; y: number } | null>(null)
let frame = 0

/**
 * A box chasing the pointer is motion, so a reader who asked for less of it
 * gets the anchored bubble. Read per move rather than cached: the preference
 * can change while the page is open.
 */
const wantsStill = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

function onPointerMove(event: PointerEvent) {
  if (!follow || wantsStill()) return

  // One update per frame: pointermove fires far faster than the screen
  // redraws, and every extra one is a layout nobody sees.
  if (frame) return
  const { clientX, clientY, currentTarget } = event
  const box = (currentTarget as HTMLElement).getBoundingClientRect()

  frame = requestAnimationFrame(() => {
    frame = 0
    at.value = { x: clientX - box.left, y: clientY - box.top }
  })
}

function onPointerLeave() {
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  at.value = null
}

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <span
    class="rk-tip"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
    @focusout="onPointerLeave"
  >
    <slot :described-by="id" />

    <!-- `role="tooltip"` and the id, so the control can point at it. Not
         `aria-hidden`: it is the description, not decoration. -->
    <span
      :id="id"
      role="tooltip"
      class="rk-tip-bubble"
      :class="[`is-${placement}`, { 'is-following': at }]"
      :style="
        at
          ? {
              left: `${at.x}px`,
              top: placement === 'top' ? `${at.y - offset}px` : `${at.y + offset}px`,
            }
          : undefined
      "
    >
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
  transition: opacity var(--duration-fast) ease;
}

.rk-tip-bubble.is-top {
  bottom: calc(100% + 0.375rem);
}

.rk-tip-bubble.is-bottom {
  top: calc(100% + 0.375rem);
}

/* Following: placed from the pointer rather than from the trigger's edges,
   so `top` and `bottom` both have to give way to the inline style. */
.rk-tip-bubble.is-following {
  bottom: auto;
  /* No transition on the position, or the bubble lags the pointer it is
     supposed to be under. */
  transition: opacity var(--duration-fast) ease;
}

.rk-tip-bubble.is-following.is-top {
  transform: translate(-50%, -100%);
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
