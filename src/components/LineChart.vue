<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, useTemplateRef } from 'vue'

import { watchVisibility } from '../motion/environment'
import { formatNumber } from '../utils/format'

/**
 * Several values over time, as lines.
 *
 * ## The data is also a table
 *
 * The plot is a focusable group described by a visually hidden table of every
 * value, so a screen-reader user gets the data and not a picture of it. The
 * arrow keys walk the points, Home and End jump to the ends, Escape lets go,
 * and a polite live region reads the point you are on. The pointer snaps to the
 * nearest point; Enter or a click emits `select`.
 *
 * ## Colour is never the only cue
 *
 * The second series and onward are drawn dashed in distinct patterns, and the
 * legend shows the pattern as well as the colour.
 *
 * The scale does not start above zero unless every value does, and `min`/`max`
 * can pin it. Lines draw in once, when the chart first scrolls into view, and
 * not at all for a reader who asked for less motion.
 *
 * @example
 * ```vue
 * <LineChart label="Signups" :labels="['Mon', 'Tue', 'Wed']"
 *   :series="[{ name: 'Web', values: [3, 6, 9] }]" />
 * ```
 */
type Tone = 'primary' | 'accent' | 'positive' | 'warning' | 'negative' | 'ink'
interface Series {
  name: string
  values: readonly number[]
  tone?: Tone | undefined
}

/** A line or area chart for a few series over the same labels, with a table behind it for screen readers. */
const {
  series,
  labels,
  label,
  valueLabel = (n: number) => formatNumber(n),
  area = false,
  curve = undefined,
  height = 240,
  min = undefined,
  max = undefined,
  grid = true,
  legend = undefined,
  animate = true,
} = defineProps<{
  series: readonly Series[]
  /** The x categories, one per value. */
  labels: readonly string[]
  /** Names the chart. Already translated. */
  label: string
  valueLabel?: ((n: number) => string) | undefined
  area?: boolean | undefined
  /** `smooth` is a monotone cubic, so it never overshoots a value. Defaults to `smooth`, `linear` in brutal. */
  curve?: 'linear' | 'smooth' | undefined
  height?: number | undefined
  min?: number | undefined
  max?: number | undefined
  grid?: boolean | undefined
  /** Defaults to on for more than one series. */
  legend?: boolean | undefined
  /** Draw the lines in the first time the chart is seen. */
  animate?: boolean | undefined
}>()

const emit = defineEmits<{ select: [index: number] }>()

defineSlots<{
  tooltip?: (props: {
    index: number
    label: string
    values: { name: string; value: number; tone: Tone }[]
  }) => unknown
}>()

const TONES: Tone[] = ['primary', 'accent', 'positive', 'warning', 'negative']
const DASH = ['none', '6 4', '2 3', '10 3 2 3']
const M = { l: 44, r: 12, t: 12, b: 26 }

const id = useId()
const root = useTemplateRef<HTMLElement>('root')
const width = ref(600)
const drawn = ref(!animate)
const material = ref('')
const active = ref<number | null>(null)

let resize: ResizeObserver | null = null
let stop: (() => void) | null = null

onMounted(() => {
  const el = root.value
  if (!el) return
  material.value = el.closest<HTMLElement>('[data-material]')?.dataset.material ?? ''
  width.value = el.clientWidth || 600
  if (typeof ResizeObserver !== 'undefined') {
    resize = new ResizeObserver(() => (width.value = el.clientWidth || width.value))
    resize.observe(el)
  }
  if (!drawn.value) {
    stop = watchVisibility(el, (visible) => {
      if (!visible) return
      drawn.value = true
      stop?.()
    })
  }
})

onBeforeUnmount(() => {
  resize?.disconnect()
  stop?.()
})

const plot = computed(() => ({
  w: Math.max(40, width.value - M.l - M.r),
  h: Math.max(40, height - M.t - M.b),
}))

const domain = computed(() => {
  const all = series.flatMap((s) => s.values)
  let lo = min ?? Math.min(0, ...all)
  let hi = max ?? Math.max(...all, 0)
  if (hi === lo) hi = lo + 1
  // Round the top up so four intervals fall on tidy numbers.
  if (max === undefined) {
    const step = (hi - lo) / 4
    const mag = 10 ** Math.floor(Math.log10(step))
    const nice = [1, 2, 2.5, 5, 10].find((n) => n * mag >= step) ?? 10
    hi = lo + nice * mag * 4
  }
  if (min === undefined && lo < 0) lo = -Math.ceil(-lo)

  return { lo, hi }
})

const count = computed(() => Math.max(1, ...series.map((s) => s.values.length), labels.length))
const x = (i: number) =>
  M.l + (count.value === 1 ? plot.value.w / 2 : (i / (count.value - 1)) * plot.value.w)
const y = (v: number) =>
  M.t + (1 - (v - domain.value.lo) / (domain.value.hi - domain.value.lo)) * plot.value.h

const ticks = computed(() =>
  Array.from({ length: 5 }, (_, i) => {
    const v = domain.value.lo + ((domain.value.hi - domain.value.lo) * i) / 4

    return { v, y: y(v) }
  }),
)

const xLabels = computed(() => {
  const per = Math.max(1, Math.ceil(labels.length / Math.max(1, Math.floor(plot.value.w / 48))))

  return labels.map((text, i) => ({ text, x: x(i), show: i % per === 0 }))
})

const resolvedCurve = computed(() => curve ?? (material.value === 'brutal' ? 'linear' : 'smooth'))

/** Fritsch–Carlson monotone cubic, as Bézier segments. */
function smooth(pts: { x: number; y: number }[]): string {
  const n = pts.length
  if (n < 3) return pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ')
  const dx: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1]!.x - pts[i]!.x)
    m.push((pts[i + 1]!.y - pts[i]!.y) / (dx[i] || 1))
  }
  const t = [m[0]!]
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1]! * m[i]! <= 0 ? 0 : (m[i - 1]! + m[i]!) / 2)
  t.push(m[n - 2]!)
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0
      t[i + 1] = 0
      continue
    }
    const a = t[i]! / m[i]!
    const b = t[i + 1]! / m[i]!
    const s = a * a + b * b
    if (s > 9) {
      const k = 3 / Math.sqrt(s)
      t[i] = k * a * m[i]!
      t[i + 1] = k * b * m[i]!
    }
  }
  let d = `M${pts[0]!.x},${pts[0]!.y}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i]! / 3
    d += ` C${pts[i]!.x + h},${pts[i]!.y + t[i]! * h} ${pts[i + 1]!.x - h},${pts[i + 1]!.y - t[i + 1]! * h} ${pts[i + 1]!.x},${pts[i + 1]!.y}`
  }

  return d
}

const lines = computed(() =>
  series.map((s, i) => {
    const pts = s.values.map((v, j) => ({ x: +x(j).toFixed(1), y: +y(v).toFixed(1) }))
    const d =
      resolvedCurve.value === 'smooth'
        ? smooth(pts)
        : pts.map((p, j) => `${j ? 'L' : 'M'}${p.x},${p.y}`).join(' ')
    const base = y(Math.max(domain.value.lo, Math.min(0, domain.value.hi)))
    const first = pts[0]
    const last = pts.at(-1)

    return {
      name: s.name,
      tone: s.tone ?? (TONES[i % TONES.length] as Tone),
      dash: i === 0 ? 'none' : (DASH[Math.min(i, DASH.length - 1)] as string),
      pts,
      d,
      area: first && last ? `${d} L${last.x},${base} L${first.x},${base} Z` : '',
    }
  }),
)

const showLegend = computed(() => legend ?? series.length > 1)

const readout = computed(() => {
  const i = active.value
  if (i === null) return null

  return {
    index: i,
    label: labels[i] ?? '',
    values: series.map((s, k) => ({
      name: s.name,
      value: s.values[i] ?? 0,
      tone: lines.value[k]!.tone,
    })),
  }
})

const announce = computed(() =>
  readout.value
    ? `${label}, ${readout.value.label}: ${readout.value.values
        .map((v) => `${v.name} ${valueLabel(v.value)}`)
        .join(', ')}`
    : '',
)

function nearest(clientX: number) {
  const rect = root.value?.getBoundingClientRect()
  if (!rect) return
  const px = clientX - rect.left
  const raw = count.value === 1 ? 0 : Math.round(((px - M.l) / plot.value.w) * (count.value - 1))
  active.value = Math.max(0, Math.min(count.value - 1, raw))
}

function key(event: KeyboardEvent) {
  const last = count.value - 1
  const cur = active.value
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    const dir =
      (event.key === 'ArrowRight' ? 1 : -1) *
      (getComputedStyle(event.currentTarget as Element).direction === 'rtl' ? -1 : 1)
    active.value = cur === null ? (dir > 0 ? 0 : last) : Math.max(0, Math.min(last, cur + dir))
  } else if (event.key === 'Home') active.value = 0
  else if (event.key === 'End') active.value = last
  else if (event.key === 'Escape') active.value = null
  else if (event.key === 'Enter' && cur !== null) emit('select', cur)
  else return
  event.preventDefault()
}

const tipLeft = computed(() => (active.value === null ? 0 : x(active.value)))
const tipFlip = computed(() => tipLeft.value > width.value / 2)
</script>

<template>
  <div ref="root" class="lc" :class="{ 'lc--drawn': drawn }" :data-curve="resolvedCurve">
    <div
      class="lc-focus"
      :style="{ height: `${height}px` }"
      tabindex="0"
      role="group"
      :aria-label="label"
      :aria-describedby="`${id}-t`"
      @keydown="key"
      @pointermove="nearest($event.clientX)"
      @pointerleave="active = null"
      @click="active !== null && emit('select', active)"
      @blur="active = null"
    >
      <svg class="lc-axes" :width="width" :height="height" aria-hidden="true">
        <g v-if="grid">
          <line
            v-for="t in ticks"
            :key="t.v"
            class="lc-grid"
            :x1="M.l"
            :x2="width - M.r"
            :y1="t.y"
            :y2="t.y"
          />
        </g>
        <text
          v-for="t in ticks"
          :key="`l${t.v}`"
          class="lc-tick"
          :x="M.l - 8"
          :y="t.y"
          text-anchor="end"
          dominant-baseline="middle"
        >
          {{ valueLabel(t.v) }}
        </text>
        <template v-for="l in xLabels" :key="l.x">
          <text v-if="l.show" class="lc-tick" :x="l.x" :y="height - 6" text-anchor="middle">
            {{ l.text }}
          </text>
        </template>
      </svg>

      <svg class="lc-plot" :width="width" :height="height" aria-hidden="true">
        <defs>
          <linearGradient
            v-for="(l, i) in lines"
            :id="`${id}-g${i}`"
            :key="i"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0" class="lc-stop" :style="{ stopColor: `var(--color-${l.tone})` }" />
            <stop offset="1" :style="{ stopColor: `var(--color-${l.tone})`, stopOpacity: 0 }" />
          </linearGradient>
        </defs>
        <g v-for="(l, i) in lines" :key="i" :style="{ '--lc-tone': `var(--color-${l.tone})` }">
          <path v-if="area" class="lc-area" :d="l.area" :fill="`url(#${id}-g${i})`" />
          <path
            class="lc-line"
            :d="l.d"
            fill="none"
            :stroke-dasharray="l.dash === 'none' ? undefined : l.dash"
          />
        </g>
        <template v-if="readout">
          <line class="lc-cross" :x1="tipLeft" :x2="tipLeft" :y1="M.t" :y2="height - M.b" />
          <template v-for="(l, i) in lines" :key="`d${i}`">
            <rect
              v-if="l.pts[readout.index]"
              class="lc-dot"
              :x="l.pts[readout.index]!.x - 4"
              :y="l.pts[readout.index]!.y - 4"
              width="8"
              height="8"
              rx="4"
              :style="{ '--lc-tone': `var(--color-${l.tone})` }"
            />
          </template>
        </template>
      </svg>

      <div
        v-if="readout"
        class="lc-tip surface-overlay rounded-control"
        :class="{ 'is-flip': tipFlip }"
        :style="{ left: `${tipLeft}px` }"
        aria-hidden="true"
      >
        <slot name="tooltip" v-bind="readout">
          <strong class="lc-tip-title">{{ readout.label }}</strong>
          <span v-for="v in readout.values" :key="v.name" class="lc-tip-row">
            <span class="lc-tip-key" :style="{ background: `var(--color-${v.tone})` }" />
            {{ v.name }} <b>{{ valueLabel(v.value) }}</b>
          </span>
        </slot>
      </div>
    </div>

    <ul v-if="showLegend" class="lc-legend">
      <li v-for="l in lines" :key="l.name">
        <svg width="22" height="8" aria-hidden="true">
          <line
            x1="0"
            x2="22"
            y1="4"
            y2="4"
            stroke-width="2"
            :stroke="`var(--color-${l.tone})`"
            :stroke-dasharray="l.dash === 'none' ? undefined : l.dash"
          />
        </svg>
        {{ l.name }}
      </li>
    </ul>

    <table :id="`${id}-t`" class="sr-only">
      <caption>
        {{
          label
        }}
      </caption>
      <thead>
        <tr>
          <th scope="col"><span class="sr-only">Label</span></th>
          <th v-for="s in series" :key="s.name" scope="col">{{ s.name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(text, i) in labels" :key="i">
          <th scope="row">{{ text }}</th>
          <td v-for="s in series" :key="s.name">
            {{ s.values[i] === undefined ? '' : valueLabel(s.values[i]!) }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="sr-only" role="status" aria-live="polite">{{ announce }}</div>
  </div>
</template>

<style scoped>
.lc {
  position: relative;
  width: 100%;
  --lc-w: 1.5;
  --lc-area: 0.25;
}

.lc-focus {
  position: relative;
  width: 100%;
  border-radius: var(--radius-control);
  touch-action: pan-y;
}
.lc-focus:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.lc-axes,
.lc-plot {
  position: absolute;
  inset: 0;
  overflow: visible;
}

/* Lines are wiped in once, from the start. */
.lc-plot {
  clip-path: inset(-8px 100% -8px 0);
}
.lc--drawn .lc-plot {
  clip-path: inset(-8px -8px -8px 0);
  transition: clip-path var(--duration-slower) var(--ease-standard);
}

.lc-grid {
  stroke: var(--color-hair);
  stroke-width: 1;
}
.lc-tick {
  fill: var(--color-ink-soft);
  font-size: 13px;
}

.lc-line {
  stroke: var(--lc-tone);
  stroke-width: calc(var(--lc-w) * 1px);
  stroke-linecap: round;
  stroke-linejoin: round;
}
.lc-stop {
  stop-opacity: var(--lc-area);
}
.lc-cross {
  stroke: var(--color-ink-soft);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}
.lc-dot {
  fill: var(--lc-tone);
  stroke: var(--color-surface);
  stroke-width: 2;
}

.lc-tip {
  position: absolute;
  top: 8px;
  z-index: 1;
  display: grid;
  gap: 0.125rem;
  min-width: 7rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-ink);
  pointer-events: none;
  transform: translateX(12px);
}
.lc-tip.is-flip {
  transform: translateX(calc(-100% - 12px));
}
.lc-tip-title {
  font-weight: 600;
}
.lc-tip-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--color-ink-soft);
}
.lc-tip-row b {
  margin-inline-start: auto;
  padding-inline-start: 0.75rem;
  color: var(--color-ink);
}
.lc-tip-key {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.lc-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.8125rem;
  color: var(--color-ink-soft);
}
.lc-legend li {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

/* Materials */
:where([data-material='soft']) .lc {
  --lc-w: 2.5;
  --lc-area: 0.3;
}
:where([data-material='glass']) .lc {
  --lc-w: 2;
}
:where([data-material='brutal']) .lc {
  --lc-w: 2.5;
}
:where([data-material='brutal']) .lc-line {
  stroke-linejoin: miter;
  stroke-linecap: butt;
}
:where([data-material='brutal']) .lc-area {
  fill: color-mix(in oklab, var(--lc-tone) 20%, transparent);
}
:where([data-material='brutal']) .lc-dot {
  rx: 0;
}
:where([data-material='quiet']) .lc-grid,
.lc-grid {
  stroke-width: 1;
}

@media (prefers-reduced-motion: reduce) {
  .lc-plot {
    clip-path: none !important;
    transition: none !important;
  }
}
</style>
