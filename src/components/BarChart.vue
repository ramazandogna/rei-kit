<script setup lang="ts" generic="T extends { key: string; label: string; value: number }">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

import { watchVisibility } from '../motion/environment'

/**
 * A row of values, compared.
 *
 * ## It is a table, for the same reason `ActivityGrid` is
 *
 * The rows are `<tr>`, each label is a `<th>`, and each value is printed as
 * text beside its bar. That is not a concession bolted on afterwards — it
 * is the accessible form *and* the layout, and it means the data can be
 * read with the bars switched off entirely. The bars themselves are
 * `aria-hidden`, because a reader who has just been told "element-plus,
 * 104.1 KB" does not also need "graphic".
 *
 * The alternative every chart reaches for first is an SVG with a
 * `role="img"` and a sentence describing it. That sentence is written once,
 * by hand, and is wrong the first time the data changes.
 *
 * ## The scale starts at zero, and there is no prop to change that
 *
 * A bar chart whose axis starts at 80 makes a five per cent difference look
 * like a doubling, and it is the single most common way a true set of
 * numbers is used to say something false. `max` raises the top of the scale
 * — for a fixed ceiling across several charts — and nothing lowers the
 * bottom.
 *
 * ## The colours are yours
 *
 * `fill` returns a class per row, the same contract as `ToneDot`'s and
 * `ActivityGrid`'s `levelFor`: the kit does not know which of your rows is
 * the one you are making a point about. It defaults to `bg-primary`, which
 * is a role rather than a colour, so a chart that makes no point still
 * follows the palette.
 */
const {
  series,
  label,
  valueLabel,
  fill = () => 'bg-primary',
  max = undefined,
  animate = true,
} = defineProps<{
  /** The rows, in the order they should read. */
  series: readonly T[]
  /** Names the chart, e.g. "Bundle size by kit". Becomes its caption. */
  label: string
  /** How a value reads, e.g. `(kb) => `${kb} KB``. The kit has no units. */
  valueLabel: (value: number, item: T) => string
  /** A class for one row's bar, e.g. `bg-positive`. */
  fill?: ((item: T, index: number) => string) | undefined
  /** The top of the scale. Defaults to the largest value present. */
  max?: number | undefined
  /** Grow the bars when the chart first scrolls into view. */
  animate?: boolean | undefined
}>()

defineSlots<{
  /** Overrides a row's printed value — a note beside the number, a link. */
  value?: (props: { item: T; index: number }) => unknown
}>()

const root = useTemplateRef<HTMLElement>('root')

/* Drawn flat until it is on screen, then grown. The duration is a token, so
   a reader who asked for less motion gets the finished chart with no branch
   here: `tokens.css` zeroes every duration under `prefers-reduced-motion`. */
const grown = ref(!animate)

let stopWatching: (() => void) | undefined

onMounted(() => {
  if (grown.value || !root.value) return

  stopWatching = watchVisibility(root.value, (visible) => {
    if (!visible) return
    grown.value = true
    stopWatching?.()
  })
})

onBeforeUnmount(() => stopWatching?.())

/* The top of the scale, never the bottom. A zero ceiling would divide by
   zero; an empty series has nothing to draw either way. */
const ceiling = computed(() => {
  const largest = Math.max(0, ...series.map((item) => item.value))

  return Math.max(max ?? largest, Number.EPSILON)
})

const rows = computed(() =>
  series.map((item, index) => ({
    item,
    index,
    /* Clamped: a value past an explicit `max` would otherwise draw a bar
       wider than its own chart. */
    width: `${Math.min(100, Math.max(0, (item.value / ceiling.value) * 100))}%`,
    fill: fill(item, index),
  })),
)
</script>

<template>
  <table ref="root" class="rk-bars">
    <caption class="sr-only">
      {{
        label
      }}
    </caption>
    <tbody>
      <tr v-for="row in rows" :key="row.item.key" class="rk-bars-row">
        <th scope="row" class="rk-bars-label">{{ row.item.label }}</th>
        <td class="rk-bars-track">
          <!-- The number beside it is what a reader hears; this is the
               picture of it. -->
          <span
            class="rk-bars-fill"
            :class="row.fill"
            :style="{ width: grown ? row.width : '0%' }"
            aria-hidden="true"
          />
        </td>
        <td class="rk-bars-value">
          <slot name="value" :item="row.item" :index="row.index">
            {{ valueLabel(row.item.value, row.item) }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.rk-bars {
  width: 100%;
  border-collapse: collapse;
}

.rk-bars-label {
  padding-block: 0.3125rem;
  padding-inline-end: 0.75rem;
  color: var(--color-ink);
  font-size: 0.8125rem;
  font-weight: 500;
  text-align: start;
  white-space: nowrap;
}

.rk-bars-track {
  width: 100%;
  padding-block: 0.3125rem;
}

.rk-bars-fill {
  display: block;
  height: 0.625rem;
  border-radius: 9999px;
  transition: width var(--duration-slower) var(--ease-standard);
}

.rk-bars-value {
  padding-block: 0.3125rem;
  padding-inline-start: 0.75rem;
  color: var(--color-ink-soft);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  text-align: end;
  white-space: nowrap;
}
</style>
