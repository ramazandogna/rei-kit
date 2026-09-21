<script setup lang="ts">
import { computed, onScopeDispose, ref, useTemplateRef, watchEffect } from 'vue'

import { useDragScroll } from '../composables/use-drag-scroll'

/**
 * A box that scrolls, with the two things a hand-written one leaves out.
 *
 * ## The edge fade is the affordance `no-scrollbar` takes away
 *
 * Every app here hides the scrollbar on a horizontal row — a strip of
 * months, a row of filter chips — because a native bar under a 40px row is
 * louder than the row. What goes with it is the only sign on screen that
 * there is anything further along. So the fades are driven by the actual
 * scroll position: one appears at an edge exactly when there is content
 * past it, and both are gone when everything fits.
 *
 * ## A focus stop, but only when there is no other way in
 *
 * A box that scrolls and cannot take focus cannot be scrolled by a
 * keyboard, so the far end is simply unreachable. That is the fault
 * `CodeBlock` was written for, and it is not about code: it is true of any
 * scrolling box whose contents are not focusable.
 *
 * But it is *only* true of those. A row of buttons already moves under the
 * keyboard — Tab scrolls the next one into view — and giving that row a
 * stop of its own costs a press for nothing, on every row. So this checks:
 * it becomes a named region when it overflows **and** holds nothing
 * focusable, and stays out of the tab order otherwise.
 *
 * The check runs when the box or its contents resize, which covers a list
 * that arrives from a server. A swap that changes neither size — the same
 * number of rows, buttons turned into plain text — will not be noticed;
 * that is a trade against watching every mutation of a scroll container,
 * and the shape it misses is a rare one.
 */
const {
  label,
  axis = 'y',
  scrollbar = 'auto',
  fade = true,
  drag = false,
} = defineProps<{
  /**
   * Names the box, e.g. "Categories".
   *
   * Required because this becomes a region a reader can land in, and an
   * unnamed region is announced as nothing at all. It is only used when
   * that happens, so it costs nothing in the common case.
   */
  label: string
  /** Which way it scrolls. */
  axis?: 'x' | 'y' | 'both' | undefined
  /** `hidden` takes the native bar away; the fades stay either way. */
  scrollbar?: 'auto' | 'hidden' | undefined
  /** The gradient at an edge with more content past it. */
  fade?: boolean | undefined
  /** Drag to scroll sideways, for a page that has claimed horizontal gestures. */
  drag?: boolean | undefined
}>()

defineSlots<{ default: () => unknown }>()

/* The scroll event does not bubble, so a parent cannot listen for it on the
   wrapper. `VirtualList` needs it, and needs the element it came from, so
   both are handed out rather than left to a template ref into our markup. */
const emit = defineEmits<{ scroll: [event: Event] }>()

const viewport = useTemplateRef<HTMLElement>('viewport')

/** Anything that takes focus on its own, so the box does not need to. */
const FOCUSABLE =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'

const horizontal = computed(() => axis === 'x' || axis === 'both')
const vertical = computed(() => axis === 'y' || axis === 'both')

const start = ref({ x: false, y: false })
const end = ref({ x: false, y: false })
const overflows = ref(false)
const hasFocusable = ref(true)

function measure() {
  const element = viewport.value
  if (!element) return

  const overX = element.scrollWidth - element.clientWidth
  const overY = element.scrollHeight - element.clientHeight

  /* A fractional pixel of overflow is a rounding artefact, not content:
     without this every box that fits exactly draws a fade at one end. */
  const slack = 1

  /* `scrollLeft` counts down from zero in a right-to-left box, so the
     distance travelled is its magnitude either way. That is what makes
     "start" and "end" below mean the same thing in both directions. */
  const alongX = Math.abs(element.scrollLeft)

  start.value = { x: alongX > slack, y: element.scrollTop > slack }
  end.value = { x: overX - alongX > slack, y: overY - element.scrollTop > slack }

  overflows.value = (horizontal.value && overX > slack) || (vertical.value && overY > slack)
  hasFocusable.value = element.querySelector(FOCUSABLE) !== null
}

function onScroll(event: Event) {
  measure()
  emit('scroll', event)
}

/** The box itself is the way in only when nothing inside it is. */
const isStop = computed(() => overflows.value && !hasFocusable.value)

let observer: ResizeObserver | null = null

watchEffect(() => {
  observer?.disconnect()
  observer = null

  const element = viewport.value
  if (!element || typeof ResizeObserver === 'undefined') return

  observer = new ResizeObserver(measure)
  observer.observe(element)
  // The contents too: a list that grows changes what there is to scroll
  // without the box itself changing size at all.
  for (const child of element.children) observer.observe(child)

  measure()
})

onScopeDispose(() => observer?.disconnect())

useDragScroll(computed(() => (drag ? viewport.value : null)))

defineExpose({
  /** The element that actually scrolls, for a parent that has to measure it. */
  viewport,
})
</script>

<template>
  <div class="rk-scroll">
    <div
      ref="viewport"
      class="rk-scroll-viewport"
      :class="[`is-${axis}`, { 'no-scrollbar': scrollbar === 'hidden' }]"
      :tabindex="isStop ? 0 : undefined"
      :role="isStop ? 'region' : undefined"
      :aria-label="isStop ? label : undefined"
      @scroll="onScroll"
    >
      <slot />
    </div>

    <!-- Decoration, and never in the way of a press: the box under them is
         what scrolls. -->
    <template v-if="fade">
      <span v-if="horizontal && start.x" class="rk-scroll-fade is-start-x" aria-hidden="true" />
      <span v-if="horizontal && end.x" class="rk-scroll-fade is-end-x" aria-hidden="true" />
      <span v-if="vertical && start.y" class="rk-scroll-fade is-start-y" aria-hidden="true" />
      <span v-if="vertical && end.y" class="rk-scroll-fade is-end-y" aria-hidden="true" />
    </template>
  </div>
</template>

<style scoped>
.rk-scroll {
  position: relative;
  min-width: 0;
  min-height: 0;
}

.rk-scroll-viewport {
  max-width: 100%;
  max-height: 100%;
}

.rk-scroll-viewport.is-x {
  overflow-x: auto;
  overflow-y: hidden;
}

.rk-scroll-viewport.is-y {
  overflow-x: hidden;
  overflow-y: auto;
}

.rk-scroll-viewport.is-both {
  overflow: auto;
}

.rk-scroll-viewport:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* The fade paints over whatever the box sits on, so the colour is a hook:
   a scroll area on a card sets it to the card's ground. */
.rk-scroll-fade {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  --rk-scroll-fade: var(--scroll-fade-color, var(--color-canvas));
}

.rk-scroll-fade.is-start-x,
.rk-scroll-fade.is-end-x {
  inset-block: 0;
  width: 1.5rem;
}

.rk-scroll-fade.is-start-y,
.rk-scroll-fade.is-end-y {
  inset-inline: 0;
  height: 1.5rem;
}

.rk-scroll-fade.is-start-x {
  inset-inline-start: 0;
  background: linear-gradient(to right, var(--rk-scroll-fade), transparent);
}

.rk-scroll-fade.is-end-x {
  inset-inline-end: 0;
  background: linear-gradient(to left, var(--rk-scroll-fade), transparent);
}

.rk-scroll-fade.is-start-y {
  inset-block-start: 0;
  background: linear-gradient(to bottom, var(--rk-scroll-fade), transparent);
}

.rk-scroll-fade.is-end-y {
  inset-block-end: 0;
  background: linear-gradient(to top, var(--rk-scroll-fade), transparent);
}

/* The insets are logical, so they land on the correct side on their own.
   A gradient has no logical direction, so these two flip by hand. */
[dir='rtl'] .rk-scroll-fade.is-start-x {
  background: linear-gradient(to left, var(--rk-scroll-fade), transparent);
}

[dir='rtl'] .rk-scroll-fade.is-end-x {
  background: linear-gradient(to right, var(--rk-scroll-fade), transparent);
}
</style>
