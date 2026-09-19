<script setup lang="ts">
import { computed } from 'vue'

/**
 * Progress as a ring — for a small space, a card's corner, a goal.
 *
 * With a `value`, a promise about how far: the ring fills and, with
 * `showValue`, the percentage sits inside it. Without one, it says only
 * "working" and turns — the same distinction as `ProgressBar` and
 * `BaseSpinner`, in one shape. For a reader who asked for less motion the
 * turning ring breathes instead of spinning.
 *
 * The inside is a slot, so a ring can hold "3/7", an icon or nothing.
 */
const {
  value = undefined,
  max = 100,
  label,
  size = 'md',
  showValue = false,
  tone = 'primary',
} = defineProps<{
  /** How far. Leave it out while there is nothing to measure. */
  value?: number | undefined
  max?: number | undefined
  /** The accessible name, e.g. "Upload". Required: a ring says nothing aloud on its own. */
  label: string
  size?: 'sm' | 'md' | 'lg' | undefined
  /** The rounded percentage inside the ring. */
  showValue?: boolean | undefined
  tone?: 'primary' | 'accent' | 'positive' | 'warning' | 'negative' | undefined
}>()

defineSlots<{
  /** Inside the ring, instead of the percentage. */
  default?: () => unknown
}>()

const RADIUS = 20
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const indeterminate = computed(() => value === undefined)

/* Clamped like ProgressBar: a negative, an overshoot and a zero `max` all
   stay inside the ring. */
const portion = computed(() => {
  if (value === undefined || max <= 0) return 0
  return Math.min(1, Math.max(0, value / max))
})

const percent = computed(() => Math.round(portion.value * 100))
const offset = computed(() => CIRCUMFERENCE * (1 - (indeterminate.value ? 0.28 : portion.value)))
</script>

<template>
  <div
    class="rk-ring"
    :class="[`is-${size}`, `is-${tone}`, { 'is-indeterminate': indeterminate }]"
    role="progressbar"
    :aria-label="label"
    :aria-valuenow="indeterminate ? undefined : percent"
    :aria-valuemin="indeterminate ? undefined : 0"
    :aria-valuemax="indeterminate ? undefined : 100"
  >
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle class="rk-ring-track" cx="24" cy="24" :r="RADIUS" />
      <circle
        class="rk-ring-bar"
        cx="24"
        cy="24"
        :r="RADIUS"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="offset"
      />
    </svg>
    <span v-if="$slots.default || (showValue && !indeterminate)" class="rk-ring-inside">
      <slot>{{ percent }}%</slot>
    </span>
  </div>
</template>

<style scoped>
.rk-ring {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: var(--rk-ring-size);
  height: var(--rk-ring-size);
  --rk-ring-size: 3rem;
  --rk-ring-colour: var(--color-primary);
}

.rk-ring.is-sm {
  --rk-ring-size: 1.75rem;
}

.rk-ring.is-lg {
  --rk-ring-size: 5rem;
}

.rk-ring.is-accent {
  --rk-ring-colour: var(--color-accent);
}

.rk-ring.is-positive {
  --rk-ring-colour: var(--color-positive);
}

.rk-ring.is-warning {
  --rk-ring-colour: var(--color-warning);
}

.rk-ring.is-negative {
  --rk-ring-colour: var(--color-negative);
}

.rk-ring svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* The ring starts at twelve o'clock, like a clock face, not at three. */
  rotate: -90deg;
}

.rk-ring-track,
.rk-ring-bar {
  fill: none;
  stroke-width: 4;
}

.rk-ring-track {
  stroke: var(--color-muted);
}

.rk-ring-bar {
  stroke: var(--rk-ring-colour);
  stroke-linecap: round;
  transition: stroke-dashoffset var(--duration-slow) var(--ease-standard);
}

.rk-ring.is-indeterminate svg {
  animation: rk-ring-spin 0.9s linear infinite;
}

.rk-ring-inside {
  position: relative;
  font-size: calc(var(--rk-ring-size) * 0.26);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

@keyframes rk-ring-spin {
  from {
    rotate: -90deg;
  }
  to {
    rotate: 270deg;
  }
}

@keyframes rk-ring-breathe {
  50% {
    opacity: 0.4;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rk-ring.is-indeterminate svg {
    animation: rk-ring-breathe 1.6s ease-in-out infinite;
  }
}
</style>
