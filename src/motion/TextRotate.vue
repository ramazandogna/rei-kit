<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { prefersReducedMotion } from './environment'

/**
 * One word in a sentence that changes on its own: "Build it *glass*",
 * then *brutal*, then *soft*.
 *
 * It stops while the pointer rests on it or it holds focus, and an app can
 * stop it with `paused`. That is not a courtesy: content that moves on its
 * own for more than five seconds needs a way to stop it, and hovering is
 * where a reader's attention already is.
 *
 * For a reader who asked for less motion it does not rotate at all — the
 * first word stands, which is a complete sentence. On a server it is the
 * first word too.
 */
const {
  words,
  interval = 2400,
  paused = false,
} = defineProps<{
  /** The words, in order. The first is the one a server and a still page show. */
  words: readonly string[]
  /** How long each word stays, in milliseconds. */
  interval?: number | undefined
  /** Holds the current word. For a pause button, or a section out of view. */
  paused?: boolean | undefined
}>()

const index = ref(0)
const held = ref(false)
const current = computed(() => words[index.value % Math.max(words.length, 1)] ?? '')

let timer: ReturnType<typeof setInterval> | null = null

function stop() {
  if (timer !== null) clearInterval(timer)
  timer = null
}

function start() {
  stop()
  if (paused || held.value || words.length < 2 || prefersReducedMotion()) return

  timer = setInterval(() => {
    index.value = (index.value + 1) % words.length
  }, interval)
}

onMounted(start)
onBeforeUnmount(stop)
watch([() => paused, held, () => words.length, () => interval], start)
</script>

<template>
  <span
    class="rk-rotate"
    @mouseenter="held = true"
    @mouseleave="held = false"
    @focusin="held = true"
    @focusout="held = false"
  >
    <Transition name="rk-rotate" mode="out-in">
      <span :key="current" class="rk-rotate-word">{{ current }}</span>
    </Transition>
  </span>
</template>

<style scoped>
.rk-rotate {
  display: inline-block;
  vertical-align: bottom;
}

.rk-rotate-word {
  display: inline-block;
}

.rk-rotate-enter-active,
.rk-rotate-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-standard),
    filter var(--duration-base) var(--ease-standard);
}

.rk-rotate-enter-from {
  opacity: 0;
  transform: translateY(40%);
  filter: blur(4px);
}

.rk-rotate-leave-to {
  opacity: 0;
  transform: translateY(-40%);
  filter: blur(4px);
}
</style>
