<script setup lang="ts">
/**
 * A row that scrolls sideways without end: logos, testimonials, a ticker.
 *
 * The content is rendered twice and the track moves by exactly one copy, so
 * the loop has no seam and no measuring. The second copy is `inert` and
 * hidden from assistive tech — a keyboard or screen-reader user meets each
 * item once.
 *
 * It stops while hovered or focused, and on `paused`. For a reader who asked
 * for less motion it does not move at all: it becomes a row that scrolls by
 * hand, so nothing in it is out of reach.
 */
const {
  duration = 30,
  reverse = false,
  paused = false,
  fade = true,
  gap = '2rem',
} = defineProps<{
  /** Seconds for one full pass. Longer is slower; the speed does not change with the content's length. */
  duration?: number | undefined
  /** Move left to right instead. */
  reverse?: boolean | undefined
  /** Holds it still. */
  paused?: boolean | undefined
  /** Fade the content out at both edges instead of cutting it. */
  fade?: boolean | undefined
  /** Space between items, and between the end of one pass and the start of the next. Any CSS length. */
  gap?: string | undefined
}>()

defineSlots<{
  /** The items. Rendered twice, the second copy inert. */
  default: () => unknown
}>()
</script>

<template>
  <div
    class="rk-marquee"
    :class="{ 'is-reverse': reverse, 'is-paused': paused, 'is-faded': fade }"
    :style="{ '--rk-marquee-duration': `${duration}s`, '--rk-marquee-gap': gap }"
  >
    <div class="rk-marquee-track">
      <div class="rk-marquee-group">
        <slot />
      </div>
      <div class="rk-marquee-group" aria-hidden="true" inert>
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.rk-marquee {
  display: flex;
  overflow: hidden;
}

.rk-marquee.is-faded {
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
}

.rk-marquee-track {
  display: flex;
  width: max-content;
  animation: rk-marquee var(--rk-marquee-duration) linear infinite;
}

.rk-marquee.is-reverse .rk-marquee-track {
  animation-direction: reverse;
}

.rk-marquee.is-paused .rk-marquee-track,
.rk-marquee:hover .rk-marquee-track,
.rk-marquee:focus-within .rk-marquee-track {
  animation-play-state: paused;
}

/* Each group ends in the gap, so moving by exactly half the track lands the
   second copy where the first began. */
.rk-marquee-group {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--rk-marquee-gap);
  padding-inline-end: var(--rk-marquee-gap);
}

@keyframes rk-marquee {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rk-marquee {
    overflow-x: auto;
    mask-image: none;
  }

  .rk-marquee-track {
    animation: none;
  }

  .rk-marquee-group[aria-hidden='true'] {
    display: none;
  }
}
</style>
