<script setup lang="ts">
import {
  type ComponentPublicInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue'

import { nextFrame, prefersReducedMotion, watchVisibility } from './environment'

/**
 * A line between two elements with a pulse of light travelling along it, for
 * showing that one thing feeds another: sources into a hub, a client to a
 * server.
 *
 * Put it inside a `position: relative` container and hand it template refs for
 * the container and the two ends. It measures their centres, draws a curve
 * between them, and measures again when any of them resizes or the window
 * does. The pulse runs twice and rests, unless `loop` asks it to go on, and
 * stops while offscreen. Under reduced motion the whole path shows as a still
 * line.
 *
 * The drawing is decorative and hidden from assistive tech: whatever it means
 * ("A sends data to B") has to be in the surrounding text as well.
 *
 * @example
 * ```vue
 * <div ref="box" class="relative">
 *   <div ref="a" /> <div ref="b" />
 *   <AnimatedBeam :container="box" :from="a" :to="b" :curvature="40" />
 * </div>
 * ```
 */
type Target = HTMLElement | ComponentPublicInstance | null

/** A line between two elements with a pulse of light travelling along it. */
const {
  container = null,
  from = null,
  to = null,
  curvature = 0,
  fromOffset = undefined,
  toOffset = undefined,
  tone = 'primary',
  width = 2,
  duration = 3,
  delay = 0,
  reverse = false,
  loop = false,
  paused = false,
} = defineProps<{
  /** The positioned element the line is drawn over. */
  container?: Target | undefined
  /** Where the line starts. */
  from?: Target | undefined
  /** Where the line ends. */
  to?: Target | undefined
  /** Sideways bend of the line in px; negative bends the other way. */
  curvature?: number | undefined
  fromOffset?: { x: number; y: number } | undefined
  toOffset?: { x: number; y: number } | undefined
  tone?: 'primary' | 'accent' | 'positive' | 'warning' | 'negative' | 'ink' | undefined
  /** Line thickness in px. */
  width?: number | undefined
  /** Seconds per pass. Without `loop` it is capped at 2.4 so two passes end within 5 s. */
  duration?: number | undefined
  /** Seconds before the first pass. */
  delay?: number | undefined
  reverse?: boolean | undefined
  /** Keep going. Off, two passes and a resting pulse. */
  loop?: boolean | undefined
  paused?: boolean | undefined
}>()

const svg = useTemplateRef<SVGSVGElement>('svg')
const d = ref('')

const element = (target: Target | undefined): HTMLElement | null => {
  if (!target) return null
  const el = target instanceof Element ? target : (target.$el as unknown)

  return el instanceof HTMLElement ? el : null
}

function measure() {
  const box = element(container)
  const a = element(from)
  const b = element(to)
  if (!box || !a || !b) {
    d.value = ''
    return
  }

  const base = box.getBoundingClientRect()
  const centre = (el: HTMLElement, offset?: { x: number; y: number }) => {
    const r = el.getBoundingClientRect()

    return {
      x: r.left - base.left + r.width / 2 + (offset?.x ?? 0),
      y: r.top - base.top + r.height / 2 + (offset?.y ?? 0),
    }
  }
  const p = centre(a, fromOffset)
  const q = centre(b, toOffset)

  // Control point: the midpoint pushed along the perpendicular.
  const dx = q.x - p.x
  const dy = q.y - p.y
  const len = Math.hypot(dx, dy) || 1
  const cx = (p.x + q.x) / 2 + (-dy / len) * curvature
  const cy = (p.y + q.y) / 2 + (dx / len) * curvature
  const r = (n: number) => Math.round(n * 10) / 10

  d.value = `M${r(p.x)},${r(p.y)} Q${r(cx)},${r(cy)} ${r(q.x)},${r(q.y)}`
}

let cancel: (() => void) | null = null
const schedule = () => {
  cancel?.()
  cancel = nextFrame(measure)
}

let observer: ResizeObserver | null = null
let stopVisibility: (() => void) | null = null

function observe() {
  observer?.disconnect()
  if (typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(schedule)
  for (const target of [container, from, to]) {
    const el = element(target)
    if (el) observer.observe(el)
  }
}

onMounted(() => {
  measure()
  observe()
  window.addEventListener('resize', schedule)
  const el = svg.value
  if (el && !prefersReducedMotion()) {
    stopVisibility = watchVisibility(el, (visible) => {
      if (visible) el.removeAttribute('data-paused')
      else el.setAttribute('data-paused', '')
    })
  }
})

watch(
  () => [container, from, to],
  () => {
    observe()
    schedule()
  },
)
watch(() => [curvature, fromOffset, toOffset], schedule, { deep: true })

onBeforeUnmount(() => {
  cancel?.()
  observer?.disconnect()
  stopVisibility?.()
  if (typeof window !== 'undefined') window.removeEventListener('resize', schedule)
})
</script>

<template>
  <svg
    ref="svg"
    class="ab"
    :class="{ 'ab--loop': loop, 'ab--paused': paused, 'ab--reverse': reverse }"
    :style="{
      '--ab-tone': `var(--color-${tone})`,
      '--ab-w': width,
      '--ab-dur': `${loop ? duration : Math.min(duration, 2.4)}s`,
      '--ab-delay': `${loop ? delay : Math.max(0, Math.min(delay, 5 - 2 * Math.min(duration, 2.4)))}s`,
    }"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="d">
      <path class="ab-base" :d="d" fill="none" />
      <path class="ab-glow" :d="d" pathLength="100" fill="none" />
      <path class="ab-beam" :d="d" pathLength="100" fill="none" />
    </template>
  </svg>
</template>

<style scoped>
.ab {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.ab-base {
  stroke: var(--color-hair);
  stroke-width: calc(var(--ab-w) * 1px);
}

.ab-beam,
.ab-glow {
  stroke: var(--ab-tone);
  stroke-width: calc(var(--ab-w) * 1px);
  stroke-linecap: round;
  /* A pulse shorter than the path, with a gap longer than it, so it enters
     and leaves rather than wrapping. It rests mid-path once it is done. */
  stroke-dasharray: 18 100;
  stroke-dashoffset: -41;
  animation: ab-run var(--ab-dur) linear var(--ab-delay) 2;
}

.ab-glow {
  display: none;
  filter: blur(4px);
}

.ab--loop .ab-beam,
.ab--loop .ab-glow {
  animation-iteration-count: infinite;
}
.ab--reverse .ab-beam,
.ab--reverse .ab-glow {
  animation-direction: reverse;
}
.ab--paused .ab-beam,
.ab--paused .ab-glow,
.ab[data-paused] .ab-beam,
.ab[data-paused] .ab-glow {
  animation-play-state: paused;
}

@keyframes ab-run {
  from {
    stroke-dashoffset: 18;
  }
  to {
    stroke-dashoffset: -100;
  }
}

:where([data-material='glass']) .ab-glow {
  display: block;
}

:where([data-material='soft']) .ab-base,
:where([data-material='soft']) .ab-beam {
  stroke-width: calc(var(--ab-w) * 1px + 1px);
}
:where([data-material='soft']) .ab-beam {
  filter: blur(1px);
}

:where([data-material='brutal']) .ab-base {
  stroke: var(--color-ink);
  stroke-width: 2px;
}
:where([data-material='brutal']) .ab-beam {
  stroke-linecap: square;
  animation-timing-function: steps(10);
}

@media (prefers-reduced-motion: reduce) {
  .ab-beam,
  .ab-glow {
    animation: none;
    stroke-dasharray: none;
    stroke-opacity: 0.5;
  }
}
</style>
