<script setup lang="ts" generic="T extends { key: string; label: string; value: number }">
import { computed } from 'vue'

/**
 * Parts of a whole.
 *
 * ## Not for comparing things
 *
 * This is the chart people reach for when they mean the other one. Judging
 * the difference between two angles is measurably harder than judging the
 * difference between two lengths, so six values that need ranking belong in
 * a `BarChart` and not here. Reach for this when the point is that the
 * slices *add up* — where a budget went, what a bundle is made of — and
 * when there are few enough slices to tell apart.
 *
 * ## The legend is the chart
 *
 * The ring is `aria-hidden`, and every slice's name and value is real text
 * beside it. Same decision as `BarChart`'s table: the description of a
 * chart is not a sentence somebody writes once and forgets to update, it
 * is the data, rendered.
 *
 * ## The colours are yours
 *
 * `fill` returns a class per slice, like `ToneDot`'s and `ActivityGrid`'s
 * `levelFor`. It is required here rather than defaulted: a ring whose
 * slices are all one colour is not a chart, so there is no sensible
 * default to give it.
 */
const {
  slices,
  label,
  valueLabel,
  fill,
  thickness = 14,
} = defineProps<{
  /** The parts, in the order they should read around the ring. */
  slices: readonly T[]
  /** Names the chart, e.g. "What the stylesheet is made of". */
  label: string
  /** How a value reads, e.g. `(kb) => `${kb} KB``. The kit has no units. */
  valueLabel: (value: number, item: T) => string
  /** A class for one slice, e.g. `text-primary` — it paints the stroke. */
  fill: (item: T, index: number) => string
  /** How thick the ring is, as a percentage of its radius. */
  thickness?: number | undefined
}>()

/* A 100-unit circumference, so every slice's length is its percentage and
   there is no arithmetic to get wrong twice. */
const CIRCUMFERENCE = 100
const RADIUS = CIRCUMFERENCE / (2 * Math.PI)

const total = computed(() => slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0))

const arcs = computed(() => {
  let travelled = 0

  return slices.map((item, index) => {
    const share = total.value === 0 ? 0 : (Math.max(0, item.value) / total.value) * CIRCUMFERENCE
    /* Drawn anticlockwise from twelve o'clock by the transform below, so
       the offset counts the slices already placed. */
    const offset = -travelled
    travelled += share

    return {
      item,
      index,
      share,
      offset,
      percent: total.value === 0 ? 0 : (item.value / total.value) * 100,
      fill: fill(item, index),
    }
  })
})
</script>

<template>
  <div class="rk-donut">
    <!-- The names and numbers beside it are what a reader hears. -->
    <svg class="rk-donut-ring" viewBox="0 0 40 40" aria-hidden="true">
      <g transform="rotate(-90 20 20)">
        <circle
          v-for="arc in arcs"
          :key="arc.item.key"
          :class="arc.fill"
          cx="20"
          cy="20"
          :r="RADIUS"
          fill="none"
          stroke="currentColor"
          :stroke-width="(thickness / 100) * RADIUS * 2"
          :stroke-dasharray="`${arc.share} ${CIRCUMFERENCE - arc.share}`"
          :stroke-dashoffset="arc.offset"
        />
      </g>
    </svg>

    <ul class="rk-donut-legend" :aria-label="label">
      <li v-for="arc in arcs" :key="arc.item.key" class="rk-donut-item">
        <span class="rk-donut-swatch" :class="arc.fill" aria-hidden="true" />
        <span class="rk-donut-name">{{ arc.item.label }}</span>
        <span class="rk-donut-value">{{ valueLabel(arc.item.value, arc.item) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.rk-donut {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
}

.rk-donut-ring {
  width: 8.5rem;
  height: 8.5rem;
  flex: none;
}

.rk-donut-legend {
  margin: 0;
  padding: 0;
  min-width: 0;
  flex: 1 1 12rem;
  list-style: none;
}

.rk-donut-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-block: 0.1875rem;
  font-size: 0.8125rem;
}

.rk-donut-swatch {
  width: 0.625rem;
  height: 0.625rem;
  flex: none;
  border-radius: 9999px;
  background: currentColor;
}

.rk-donut-name {
  min-width: 0;
  flex: 1 1 auto;
  color: var(--color-ink);
}

.rk-donut-value {
  color: var(--color-ink-soft);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
