<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

import { formatNumber } from '../utils/format'
import { nextFrame, prefersReducedMotion, watchVisibility } from './environment'

/**
 * A number that counts up to its value once it scrolls into view.
 *
 * Where `NumberTicker` rolls digits, this passes through every value on the
 * way — the right choice for a statistic a reader should watch grow, and for
 * decimals, where rolling columns would spin without meaning anything.
 *
 * It waits until it is on screen, so a count below the fold is not over
 * before anyone sees it. It eases out: fast at first, settling on the value,
 * which reads as arriving rather than stopping. A screen reader hears the
 * final value only. On a server, and for a reader who asked for less motion,
 * it is the value from the start.
 */
const {
  value,
  from = 0,
  duration = 1600,
  format = undefined,
  locale = undefined,
} = defineProps<{
  /** The number to count to. Change it and it counts on from where it is. */
  value: number
  /** Where the first count starts. */
  from?: number | undefined
  /** How long a count takes, in milliseconds. */
  duration?: number | undefined
  /** Passed to `Intl.NumberFormat`. Set `maximumFractionDigits` to count in decimals. */
  format?: Intl.NumberFormatOptions | undefined
  /** A BCP 47 tag. Unset, the kit's active formatting locale. */
  locale?: string | undefined
}>()

const root = useTemplateRef<HTMLElement>('root')

/* The value first, so a server render — and the frame before mount — shows
   the real number rather than a zero that means nothing. */
const shown = ref(value)

const text = (n: number) =>
  locale === undefined ? formatNumber(n, format) : formatNumber(n, format, locale)

const display = computed(() => text(shown.value))
const label = computed(() => text(value))

let cancelFrame: (() => void) | null = null
let stopWatching: (() => void) | null = null
let started = false

const easeOut = (t: number) => 1 - (1 - t) ** 3

function countTo(target: number) {
  cancelFrame?.()

  const start = shown.value
  const began = performance.now()

  const step = () => {
    const progress = Math.min(1, (performance.now() - began) / duration)
    shown.value = start + (target - start) * easeOut(progress)
    cancelFrame = progress < 1 ? nextFrame(step) : null
  }

  cancelFrame = nextFrame(step)
}

onMounted(() => {
  if (prefersReducedMotion() || duration <= 0 || !root.value) {
    started = true
    return
  }

  shown.value = from
  stopWatching = watchVisibility(root.value, (visible) => {
    if (!visible || started) return
    started = true
    stopWatching?.()
    countTo(value)
  })
})

watch(
  () => value,
  (next) => {
    // Before the first count, the new value is simply where it will go.
    if (!started) return
    if (prefersReducedMotion() || duration <= 0) shown.value = next
    else countTo(next)
  },
)

onBeforeUnmount(() => {
  cancelFrame?.()
  stopWatching?.()
})
</script>

<template>
  <span ref="root" class="rk-count">
    <span class="sr-only">{{ label }}</span>
    <span aria-hidden="true">{{ display }}</span>
  </span>
</template>

<style scoped>
/* Tabular figures, so the number does not shake sideways as it counts. */
.rk-count {
  font-variant-numeric: tabular-nums;
}
</style>
