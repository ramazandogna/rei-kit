<script setup lang="ts">
import { computed, useId } from 'vue'

import { formatNumber } from '../utils/format'

/**
 * A line the width of its container and a few pixels tall: how a number has
 * moved, in the space of a word.
 *
 * It is an image with a sentence for a name — "Signups: from 12 to 48, low 12,
 * high 52" — built from the values, so it is right when the data changes and
 * says in text what the shape says by eye. Put the figure itself beside it; a
 * sparkline is a margin note, not the number.
 *
 * Colour is a palette role, so it follows palette and dark mode; the stroke
 * does not scale with the width.
 *
 * @example
 * ```vue
 * <Sparkline :values="[3, 5, 4, 8, 12]" label="Signups" area />
 * ```
 */
type Tone = 'primary' | 'accent' | 'positive' | 'warning' | 'negative' | 'ink'

const {
  values,
  label,
  tone = 'primary',
  area = false,
  height = 32,
  strokeWidth = 1.5,
  showLast = true,
  min = undefined,
  max = undefined,
  valueLabel = (n: number) => formatNumber(n),
} = defineProps<{
  values: readonly number[]
  /** What is being drawn, e.g. "Signups". Already translated. */
  label: string
  tone?: Tone | undefined
  /** Fill under the line. */
  area?: boolean | undefined
  /** Height in px. */
  height?: number | undefined
  strokeWidth?: number | undefined
  /** A dot on the last value. */
  showLast?: boolean | undefined
  min?: number | undefined
  max?: number | undefined
  /** How a number reads in the accessible name. */
  valueLabel?: ((n: number) => string) | undefined
}>()

const id = useId()
const PAD = 3

const range = computed(() => {
  const lo = min ?? Math.min(...values)
  const hi = max ?? Math.max(...values)

  return { lo, hi }
})

const points = computed(() => {
  const { lo, hi } = range.value
  const span = hi - lo || 1
  const n = values.length

  return values.map((v, i) => ({
    x: n === 1 ? 50 : (i / (n - 1)) * 100,
    y: PAD + (1 - (Math.min(hi, Math.max(lo, v)) - lo) / span) * (height - PAD * 2),
  }))
})

const line = computed(() =>
  points.value.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' '),
)

const areaPath = computed(() => {
  const last = points.value.at(-1)
  const first = points.value[0]

  return last && first ? `${line.value} L${last.x},${height} L${first.x},${height} Z` : ''
})

const name = computed(() => {
  if (values.length === 0) return label
  const first = values[0] as number
  const last = values.at(-1) as number

  return `${label}: from ${valueLabel(first)} to ${valueLabel(last)}, low ${valueLabel(
    Math.min(...values),
  )}, high ${valueLabel(Math.max(...values))}`
})

const end = computed(() => points.value.at(-1))
</script>

<template>
  <span
    v-if="values.length"
    class="sl"
    :style="{ '--sl-tone': `var(--color-${tone})`, '--sl-w': strokeWidth, height: `${height}px` }"
  >
    <svg
      role="img"
      :aria-label="name"
      :viewBox="`0 0 100 ${height}`"
      preserveAspectRatio="none"
      width="100%"
      :height="height"
    >
      <defs>
        <linearGradient :id="`${id}-g`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="sl-stop sl-stop--a" />
          <stop offset="1" class="sl-stop sl-stop--b" />
        </linearGradient>
      </defs>
      <path v-if="area" class="sl-area" :d="areaPath" :fill="`url(#${id}-g)`" />
      <path class="sl-line" :d="line" fill="none" vector-effect="non-scaling-stroke" />
    </svg>
    <span
      v-if="showLast && end"
      class="sl-dot"
      aria-hidden="true"
      :style="{ left: `${end.x}%`, top: `${end.y}px` }"
    />
  </span>
</template>

<style scoped>
.sl {
  position: relative;
  display: block;
  width: 100%;
}

.sl svg {
  display: block;
  overflow: visible;
}

.sl-line {
  stroke: var(--sl-tone);
  stroke-width: calc(var(--sl-w) * 1px);
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sl-stop {
  stop-color: var(--sl-tone);
}
.sl-stop--a {
  stop-opacity: 0.25;
}
.sl-stop--b {
  stop-opacity: 0;
}

/* HTML, not SVG, so the stretched viewBox cannot squash it into an ellipse. */
.sl-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 9999px;
  background: var(--sl-tone);
  pointer-events: none;
}

:where([data-material='brutal']) .sl-line {
  stroke-linejoin: miter;
  stroke-linecap: butt;
}
:where([data-material='brutal']) .sl-dot {
  border-radius: 0;
}
:where([data-material='brutal']) .sl-area {
  fill: color-mix(in oklab, var(--sl-tone) 20%, transparent);
}
</style>
