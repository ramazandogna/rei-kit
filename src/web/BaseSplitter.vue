<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef } from 'vue'

/**
 * Two panes and a handle between them — a list beside a preview, an editor
 * beside its output.
 *
 * The handle is a `separator` with a value, which is the part a hand-written
 * one never has: it can be moved with the arrow keys, Home and End send it
 * to its limits, and Enter puts it back where it started. A divider that
 * only answers to a drag is a layout a keyboard cannot change at all.
 *
 * The split is a percentage, so the panes keep their proportions when the
 * window changes rather than one of them swallowing the other.
 */
const {
  label,
  orientation = 'horizontal',
  min = 15,
  max = 85,
  step = 2,
} = defineProps<{
  /** The handle's accessible name, e.g. "Resize the list". */
  label: string
  /** `horizontal`: side by side, the handle moves left and right. */
  orientation?: 'horizontal' | 'vertical' | undefined
  /** How small the first pane may get, as a percentage. */
  min?: number | undefined
  max?: number | undefined
  /** How far one arrow press moves it, in percentage points. */
  step?: number | undefined
}>()

defineSlots<{
  /** The first pane: the list, the tree, the sidebar. */
  start: () => unknown
  /** The second pane. */
  end: () => unknown
}>()

/** Where the split sits, as a percentage of the whole. `v-model`. */
const split = defineModel<number>({ default: 50 })

const root = useTemplateRef<HTMLElement>('root')
const dragging = ref(false)
const startedAt = split.value

const clamp = (value: number) => Math.min(max, Math.max(min, value))

const horizontal = computed(() => orientation === 'horizontal')

function moveTo(point: number) {
  const box = root.value?.getBoundingClientRect()
  if (!box) return

  const ratio = horizontal.value ? (point - box.left) / box.width : (point - box.top) / box.height

  split.value = clamp(Math.round(ratio * 100))
}

function onPointerDown(event: PointerEvent) {
  dragging.value = true
  ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  event.preventDefault()
  moveTo(horizontal.value ? event.clientX : event.clientY)
}

function onPointerUp(event: PointerEvent) {
  dragging.value = false
  ;(event.target as HTMLElement).releasePointerCapture?.(event.pointerId)
}

function onKeydown(event: KeyboardEvent) {
  const back = horizontal.value ? 'ArrowLeft' : 'ArrowUp'
  const forward = horizontal.value ? 'ArrowRight' : 'ArrowDown'

  const moves: Record<string, number> = {
    [back]: split.value - step,
    [forward]: split.value + step,
    Home: min,
    End: max,
    // Enter puts it back where it started, which is the undo a drag has no
    // other way of offering.
    Enter: startedAt,
  }

  const next = moves[event.key]
  if (next === undefined) return

  event.preventDefault()
  split.value = clamp(next)
}

onBeforeUnmount(() => (dragging.value = false))
</script>

<template>
  <div
    ref="root"
    class="rk-split"
    :class="[`is-${orientation}`, { 'is-dragging': dragging }]"
    :style="{ '--rk-split': `${split}%` }"
  >
    <div class="rk-split-pane is-start"><slot name="start" /></div>

    <div
      class="rk-split-handle focus-ring"
      role="separator"
      tabindex="0"
      :aria-label="label"
      :aria-orientation="orientation === 'horizontal' ? 'vertical' : 'horizontal'"
      :aria-valuenow="split"
      :aria-valuemin="min"
      :aria-valuemax="max"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
    >
      <span class="rk-split-grip" aria-hidden="true" />
    </div>

    <div class="rk-split-pane is-end"><slot name="end" /></div>
  </div>
</template>

<style scoped>
.rk-split {
  display: flex;
  width: 100%;
  min-height: 0;
}

.rk-split.is-vertical {
  flex-direction: column;
}

.rk-split.is-dragging {
  user-select: none;
}

.rk-split-pane {
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

.is-horizontal .rk-split-pane.is-start {
  width: var(--rk-split);
}

.is-vertical .rk-split-pane.is-start {
  height: var(--rk-split);
}

.rk-split-pane.is-end {
  flex: 1;
}

/* The handle is wider than the line it draws: a 1px target is a target
   nobody hits. */
.rk-split-handle {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  background: transparent;
  touch-action: none;
}

.is-horizontal .rk-split-handle {
  width: 0.75rem;
  cursor: col-resize;
}

.is-vertical .rk-split-handle {
  height: 0.75rem;
  cursor: row-resize;
}

.rk-split-grip {
  display: block;
  border-radius: 9999px;
  background: var(--color-hair);
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.is-horizontal .rk-split-grip {
  width: 2px;
  height: 100%;
}

.is-vertical .rk-split-grip {
  width: 100%;
  height: 2px;
}

.rk-split-handle:hover .rk-split-grip,
.rk-split-handle:focus-visible .rk-split-grip,
.is-dragging .rk-split-grip {
  background: var(--color-primary);
}
</style>
