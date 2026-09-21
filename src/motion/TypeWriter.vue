<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { prefersReducedMotion } from './environment'

/**
 * Text that types itself out, and — given several lines — deletes each one
 * and types the next.
 *
 * A screen reader hears the whole line, never a half-typed word: the typing
 * is hidden from it and the full text sits beside it. The server and a
 * reader who asked for less motion get the first line, complete.
 *
 * It stops while hovered or focused, and on `paused`, for the same reason
 * `TextRotate` does.
 */
const {
  text,
  speed = 45,
  deleteSpeed = 25,
  hold = 1800,
  loop = true,
  cursor = true,
  paused = false,
} = defineProps<{
  /** One line to type, or several to type in turn. */
  text: string | readonly string[]
  /** Milliseconds per character typed. */
  speed?: number | undefined
  /** Milliseconds per character deleted. */
  deleteSpeed?: number | undefined
  /** How long a finished line stays before it is deleted, in milliseconds. */
  hold?: number | undefined
  /** With several lines, start again after the last. With one, it is typed once. */
  loop?: boolean | undefined
  /** Show a blinking caret after the text. */
  cursor?: boolean | undefined
  /** Stops where it is. */
  paused?: boolean | undefined
}>()

const lines = computed(() => (typeof text === 'string' ? [text] : [...text]))

const line = ref(0)
const current = computed(() => lines.value[line.value % Math.max(lines.value.length, 1)] ?? '')

/* The whole first line until mount: that is what a server renders and what a
   page without JavaScript keeps. */
const typed = ref(current.value.length)
const deleting = ref(false)
const held = ref(false)

const visible = computed(() => current.value.slice(0, typed.value))

let timer: ReturnType<typeof setTimeout> | null = null

function stop() {
  if (timer !== null) clearTimeout(timer)
  timer = null
}

function tick() {
  const full = current.value.length

  if (!deleting.value && typed.value < full) {
    typed.value += 1
    return schedule(speed)
  }

  if (!deleting.value) {
    // Finished a line. One line, or the last without loop: stay.
    const last = line.value === lines.value.length - 1
    if (lines.value.length < 2 || (last && !loop)) return
    deleting.value = true
    return schedule(hold)
  }

  if (typed.value > 0) {
    typed.value -= 1
    return schedule(deleteSpeed)
  }

  deleting.value = false
  line.value = (line.value + 1) % lines.value.length
  schedule(speed)
}

function schedule(delay: number) {
  stop()
  if (paused || held.value) return
  timer = setTimeout(tick, delay)
}

onMounted(() => {
  if (prefersReducedMotion()) return
  typed.value = 0
  schedule(speed)
})

watch([() => paused, held], () => {
  if (prefersReducedMotion()) return
  schedule(speed)
})

watch(lines, () => {
  stop()
  line.value = 0
  deleting.value = false
  typed.value = prefersReducedMotion() ? current.value.length : 0
  if (!prefersReducedMotion()) schedule(speed)
})

onBeforeUnmount(stop)
</script>

<template>
  <span
    class="rk-type"
    @mouseenter="held = true"
    @mouseleave="held = false"
    @focusin="held = true"
    @focusout="held = false"
  >
    <span class="sr-only">{{ current }}</span>
    <span aria-hidden="true">{{ visible }}</span>
    <span v-if="cursor" class="rk-type-cursor" aria-hidden="true" />
  </span>
</template>

<style scoped>
.rk-type {
  white-space: pre-wrap;
}

/* A bar the height of the text, in its colour. */
.rk-type-cursor {
  display: inline-block;
  width: 0.08em;
  height: 1em;
  margin-inline-start: 0.06em;
  vertical-align: -0.12em;
  background: currentColor;
  animation: rk-type-blink 1s steps(1) infinite;
}

@keyframes rk-type-blink {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rk-type-cursor {
    animation: none;
  }
}
</style>
