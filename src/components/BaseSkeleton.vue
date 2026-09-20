<script setup lang="ts">
/**
 * One grey box standing in for content that has not arrived.
 *
 * `SkeletonList` is rows of these for a list; this is the primitive, for the
 * shapes a list does not cover — an avatar, a heading, a chart.
 *
 * A height is a CSS length, never a class: `h-4` inside a component the app
 * does not control would render at zero the day that utility is not in the
 * app's stylesheet, which is exactly how every skeleton in one app came out
 * invisible.
 *
 * It is hidden from assistive tech. The thing that is loading says so —
 * through `aria-busy`, or a status message — and a screen reader reading
 * "blank, blank, blank" helps nobody.
 */
const {
  width = '100%',
  height = '1rem',
  shape = 'block',
} = defineProps<{
  /** Any CSS length: `12rem`, `60%`, `8ch`. */
  width?: string | undefined
  height?: string | undefined
  /** `circle` makes a round one and squares the width to the height. */
  shape?: 'block' | 'text' | 'circle' | undefined
}>()
</script>

<template>
  <span
    class="rk-skeleton"
    :class="`is-${shape}`"
    :style="{ width: shape === 'circle' ? height : width, height }"
    aria-hidden="true"
  />
</template>

<style scoped>
.rk-skeleton {
  display: block;
  flex-shrink: 0;
  background: var(--color-muted);
  animation: rk-skeleton-pulse 1.6s ease-in-out infinite;
}

.rk-skeleton.is-block {
  border-radius: var(--radius-cell);
}

/* A line of text, rounded like one and a little short of its box. */
.rk-skeleton.is-text {
  border-radius: 9999px;
}

.rk-skeleton.is-circle {
  border-radius: 9999px;
}

@keyframes rk-skeleton-pulse {
  50% {
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rk-skeleton {
    animation: none;
  }
}
</style>
