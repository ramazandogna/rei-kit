<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

import { prefersReducedMotion, watchVisibility } from './environment'

/**
 * Content that fades or rises into place as it scrolls into view.
 *
 * Visible by default and hidden only once it has mounted and found itself
 * below the fold, so a page rendered on a server, or read without
 * JavaScript, never has content stuck at zero opacity. For a reader who
 * asked for less motion it is never hidden at all.
 *
 * For a staggered list, give each item a growing `delay`:
 * `:delay="index * 60"`.
 */
const {
  effect = 'rise',
  delay = 0,
  once = true,
  as = 'div',
} = defineProps<{
  /** How it arrives: fading in, rising a little as it does, or growing to size. */
  effect?: 'fade' | 'rise' | 'scale' | undefined
  /** Milliseconds to wait once it is in view — the stagger in a list. */
  delay?: number | undefined
  /** Reveal once and stay. Off, it hides again each time it leaves the screen. */
  once?: boolean | undefined
  /** The element to render. */
  as?: string | undefined
}>()

defineSlots<{
  /** What is revealed. */
  default: () => unknown
}>()

const root = useTemplateRef<HTMLElement>('root')
const hidden = ref(false)

let stop: (() => void) | null = null

onMounted(() => {
  if (prefersReducedMotion() || !root.value) return

  stop = watchVisibility(root.value, (visible) => {
    hidden.value = !visible
    if (visible && once) {
      stop?.()
      stop = null
    }
  })
})

onBeforeUnmount(() => stop?.())
</script>

<template>
  <component
    :is="as"
    ref="root"
    class="rk-reveal"
    :class="[`rk-reveal-${effect}`, { 'is-hidden': hidden }]"
    :style="{ '--rk-reveal-delay': `${delay}ms` }"
  >
    <slot />
  </component>
</template>

<style scoped>
.rk-reveal {
  transition:
    opacity var(--duration-slower) var(--ease-standard),
    transform var(--duration-slower) var(--ease-standard);
  transition-delay: var(--rk-reveal-delay);
}

/* Hiding is instant; only arriving is animated. Otherwise an item leaving the
   screen would fade out where nobody is looking and waste the frames. */
.rk-reveal.is-hidden {
  opacity: 0;
  transition-duration: 0s;
  transition-delay: 0s;
}

.rk-reveal-rise.is-hidden {
  transform: translateY(1rem);
}

.rk-reveal-scale.is-hidden {
  transform: scale(0.96);
}
</style>
