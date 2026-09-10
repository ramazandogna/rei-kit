<script setup lang="ts">
import { computed } from 'vue'

/**
 * How far through something somebody is.
 *
 * Clamped rather than trusted. A progress bar is always fed a computed number,
 * and computed numbers arrive as 101, as -0, and as NaN when the denominator
 * is zero — which is the ordinary state of a course nobody has started. Any of
 * those renders a bar that runs past its own track, and it is the sort of
 * thing that ships because the happy path was the only one anybody looked at.
 */
const {
  value,
  max = 100,
  label,
  size = 'md',
} = defineProps<{
  value: number
  max?: number | undefined
  /**
   * How thick the track is. `sm` for a bar under a step counter, where it is a
   * hint rather than the subject; `lg` where the progress is the point.
   *
   * It shipped at one thickness and the two bars anybody wanted were `h-1`.
   */
  size?: 'sm' | 'md' | 'lg' | undefined
  /** For screen readers. Without it this is a rectangle that means nothing. */
  label?: string | undefined
}>()

const TRACK = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
} as const

const portion = computed(() => {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0

  return Math.min(100, Math.max(0, (value / max) * 100))
})
</script>

<template>
  <div
    class="bg-muted w-full overflow-hidden rounded-full"
    :class="TRACK[size]"
    role="progressbar"
    :aria-valuenow="Math.round(portion)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label"
  >
    <div
      class="bg-primary h-full rounded-full transition-[width] duration-700 ease-out"
      :style="{ width: `${portion}%` }"
    />
  </div>
</template>
