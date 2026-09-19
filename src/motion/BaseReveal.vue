<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

import { nextFrame, prefersReducedMotion, watchVisibility } from './environment'

/**
 * Content that fades or rises into place as it scrolls into view.
 *
 * Visible in the markup, and hidden only once it has mounted in a browser
 * that will reveal it again, so a page rendered on a server, or read without
 * JavaScript, never has content stuck at zero opacity. For a reader who
 * asked for less motion it is never hidden at all.
 *
 * Content already on screen when it mounts arrives too. It used to be shown
 * as it was, which read as nothing happening — and made a re-mounted list
 * (a "replay") look broken.
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
let cancelFrame: (() => void) | null = null

onMounted(() => {
  if (prefersReducedMotion() || !root.value) return

  // Hidden before the first paint, then revealed a frame after the observer
  // says so: without a painted hidden frame there is nothing to transition
  // from, and content in view would simply appear.
  hidden.value = true
  stop = watchVisibility(root.value, (visible) => {
    cancelFrame?.()
    if (!visible) {
      hidden.value = true
      return
    }
    cancelFrame = nextFrame(() => (hidden.value = false))
    if (once) {
      stop?.()
      stop = null
    }
  })
})

onBeforeUnmount(() => {
  stop?.()
  cancelFrame?.()
})
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
