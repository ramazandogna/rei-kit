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
} = defineProps<{
  value: number
  max?: number | undefined
  /** For screen readers. Without it this is a rectangle that means nothing. */
  label?: string | undefined
}>()

const portion = computed(() => {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0

  return Math.min(100, Math.max(0, (value / max) * 100))
})
</script>

<template>
  <div
    class="bg-muted h-1.5 w-full overflow-hidden rounded-full"
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
