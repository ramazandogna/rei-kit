<script setup lang="ts" generic="T">
import { computed, onMounted, onScopeDispose, useTemplateRef, watch, watchEffect } from 'vue'

import { useVirtualWindow } from '../composables/use-virtual-window'
import ScrollArea from './ScrollArea.vue'

/**
 * A long list where only the rows near the viewport are in the DOM.
 *
 * ## The part that is usually dropped
 *
 * Windowing is easy to get right visually and easy to get wrong for a
 * reader: a list of ten thousand names that renders twenty of them reads
 * as a list of twenty, and the twenty change under the reader as they
 * move. So every row states its place in the whole — `aria-setsize` is the
 * real length and `aria-posinset` is the real index, not the index in the
 * window. Without those two the list is a different list every time it
 * scrolls.
 *
 * ## Fixed rows, and why that is a prop rather than a measurement
 *
 * Every row is `rowHeight` tall. That is what lets the window be
 * arithmetic — a division rather than a measurement of every row — and it
 * is why the empty space above and below is exactly right, which is what
 * keeps the scrollbar honest about how long the list is. A list of rows
 * that are not all the same height is not this component.
 *
 * ## Below the threshold it is a plain list
 *
 * Under `virtualizeAfter` rows nothing is windowed, no padding is rendered
 * and the markup is what it would have been without any of this. The cost
 * of windowing is only paid by a list long enough to need it.
 */
const {
  items,
  rowHeight,
  label,
  virtualizeAfter = 50,
  scrollbar = 'auto',
} = defineProps<{
  /** The whole list. Only the rows near the viewport are rendered. */
  items: readonly T[]
  /** Every row is this tall, in pixels. */
  rowHeight: number
  /** Names the list, e.g. "Bütün kayıtlar". Already translated. */
  label: string
  /** Below this many rows the list is not windowed at all. */
  virtualizeAfter?: number | undefined
  /** Passed to the scroll area: `hidden` takes the native bar away. */
  scrollbar?: 'auto' | 'hidden' | undefined
}>()

defineSlots<{
  /** One row. `index` is its place in the whole list, not in the window. */
  default: (props: { item: T; index: number }) => unknown
}>()

const area = useTemplateRef<InstanceType<typeof ScrollArea>>('area')

const {
  window: shown,
  padTop,
  padBottom,
  viewportHeight,
  onScroll,
} = useVirtualWindow({
  count: computed(() => items.length),
  rowHeight: computed(() => rowHeight),
  threshold: computed(() => virtualizeAfter),
})

const rows = computed(() =>
  items.slice(shown.value.start, shown.value.end).map((item, offset) => ({
    item,
    /** The row's place in the whole list, which is what a reader is told. */
    index: shown.value.start + offset,
  })),
)

/* How tall the viewport is, measured rather than guessed: it decides how
   many rows are in the window, and a guess that is too small leaves a gap
   at the bottom of a tall list. */
function measure() {
  const element = area.value?.viewport
  if (element) viewportHeight.value = element.clientHeight
}

onMounted(measure)
// A list that arrives after mount can change the box's height along with it.
watch(() => items.length, measure)

/*
 * And again whenever the box itself changes size.
 *
 * `ScrollArea` observes the viewport for its own fades, but that answers a
 * different question and its result does not reach here. Without this, a
 * window resize, a sidebar opening, or a list mounted inside a panel that
 * is laid out a frame later leaves `viewportHeight` at whatever it was —
 * which renders too few rows and leaves a gap at the bottom, or too many.
 */
let observer: ResizeObserver | null = null

watchEffect(() => {
  observer?.disconnect()
  observer = null

  const element = area.value?.viewport
  if (!element || typeof ResizeObserver === 'undefined') return

  observer = new ResizeObserver(measure)
  observer.observe(element)
})

onScopeDispose(() => observer?.disconnect())

/** Scrolls a row into view by its index, for an app driving the list itself. */
function scrollToIndex(index: number) {
  const element = area.value?.viewport
  if (!element) return

  const top = Math.max(0, Math.min(items.length - 1, index)) * rowHeight
  if (top < element.scrollTop) element.scrollTop = top
  else if (top + rowHeight > element.scrollTop + element.clientHeight) {
    element.scrollTop = top + rowHeight - element.clientHeight
  }
}

defineExpose({ scrollToIndex })
</script>

<template>
  <ScrollArea
    ref="area"
    axis="y"
    :label="label"
    :scrollbar="scrollbar"
    class="rk-vlist"
    @scroll="onScroll"
  >
    <ul class="rk-vlist-rows" :aria-label="label">
      <!-- The rows that are not rendered, as height. This is what makes the
           scrollbar the length of the whole list rather than the window. -->
      <li v-if="padTop > 0" :style="{ height: `${padTop}px` }" aria-hidden="true" />

      <li
        v-for="row in rows"
        :key="row.index"
        class="rk-vlist-row"
        :style="{ height: `${rowHeight}px` }"
        :aria-setsize="items.length"
        :aria-posinset="row.index + 1"
      >
        <slot :item="row.item" :index="row.index" />
      </li>

      <li v-if="padBottom > 0" :style="{ height: `${padBottom}px` }" aria-hidden="true" />
    </ul>
  </ScrollArea>
</template>

<style scoped>
.rk-vlist-rows {
  margin: 0;
  padding: 0;
  list-style: none;
}

.rk-vlist-row {
  box-sizing: border-box;
  overflow: hidden;
}
</style>
