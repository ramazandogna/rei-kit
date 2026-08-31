<script setup lang="ts">
import ToneDot from './ToneDot.vue'

/** The three classes a category needs to colour a heading. */
export interface Tone {
  /** Solid background for the dot, e.g. `bg-positive`. */
  fill: string
  /** Tinted surface for the pill, e.g. `bg-positive/5 border-positive/25`. */
  card: string
  /** Foreground that pairs with the surface, e.g. `text-positive`. */
  text: string
}

/**
 * A pill heading for a group of things.
 *
 * The tone arrives as three class strings rather than a category name: Tailwind
 * reads source files as plain text, so a class assembled at runtime never
 * reaches the stylesheet — the app has to write them out, and it is the app
 * that knows its own categories anyway.
 */
const {
  tone,
  label,
  count = 0,
} = defineProps<{
  tone: Tone
  label: string
  /** Hidden when zero, so an empty group's heading stays quiet. */
  count?: number
}>()
</script>

<template>
  <h2 class="flex items-center gap-2 self-start rounded-full border px-3 py-1" :class="tone.card">
    <ToneDot :fill="tone.fill" />
    <span class="text-xs font-semibold tracking-wide uppercase" :class="tone.text">
      {{ label }}
    </span>
    <span v-if="count > 0" class="text-ink-soft text-xs tabular-nums">{{ count }}</span>
  </h2>
</template>
