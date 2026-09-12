<script setup lang="ts">
/**
 * Work in progress, with no idea how much is left.
 *
 * `ProgressBar` is the one to reach for when the amount is known; this is for
 * when it is not. Showing a bar that cannot move is worse than a spinner,
 * because a bar is a promise about how long.
 *
 * `role="status"` and a label, so a screen reader says what is happening. A
 * spinner with no accessible name is a decoration that happens to be the only
 * thing on screen — which is why `label` is required and not defaulted to
 * "Loading" in a language the app may not speak.
 */
const { label, size = 'md' } = defineProps<{
  /** What is being waited for. Already translated. */
  label: string
  size?: 'sm' | 'md' | 'lg' | undefined
}>()

const SIZES = { sm: '1rem', md: '1.5rem', lg: '2.5rem' } as const
</script>

<template>
  <span class="rk-spin-wrap" role="status">
    <span class="rk-spin" :style="{ width: SIZES[size], height: SIZES[size] }" aria-hidden="true" />
    <!-- Off screen rather than hidden: `display: none` is not announced. -->
    <span class="rk-spin-label">{{ label }}</span>
  </span>
</template>

<style scoped>
.rk-spin-wrap {
  display: inline-flex;
  align-items: center;
}

.rk-spin {
  display: block;
  border-radius: 9999px;
  border: 2px solid color-mix(in srgb, currentColor 20%, transparent);
  border-top-color: currentColor;
  animation: rk-spin 700ms linear infinite;
}

.rk-spin-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@keyframes rk-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Still moving, because a spinner that does not move says the app has hung --
   but a slow fade rather than a fast rotation. */
@media (prefers-reduced-motion: reduce) {
  .rk-spin {
    animation: rk-pulse 1.4s ease-in-out infinite;
  }

  @keyframes rk-pulse {
    50% {
      opacity: 0.35;
    }
  }
}
</style>
