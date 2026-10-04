<script setup lang="ts">
import ToneDot from './ToneDot.vue'

/** The three classes a category needs to colour a heading. */
export interface Tone {
  /** Solid background for the dot, e.g. `bg-positive`. */
  fill: string
  /** Tinted surface for the pill, e.g. `bg-positive/5 border-positive/25`. */
  card: string
  /**
   * Foreground for the label. `text-ink`, in almost every case.
   *
   * Not the role: `text-positive` on a `bg-positive/5` pill is a colour on a
   * faint wash of itself, and it measures about 2:1 painted — the fault
   * `BaseBadge`, `BaseChip`, `BaseAlert`, `BaseListbox` and `PriceCard` were
   * all fixed for in 2.25.0. This one takes its classes from the app, so no
   * source-reading test could see it; the contrast scan on the showcase
   * caught it once the playground started rendering it.
   */
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
  /**
   * The colour classes for the dot, the pill and the label, as written-out
   * class names. `Tone` is a set of classes rather than a role token because
   * the categories here are the app's own, and Tailwind reads source as plain
   * text: a class assembled at runtime never reaches the stylesheet. Put the
   * role on `fill` and `card` and leave `text` as `text-ink`.
   */
  tone: Tone
  label: string
  /** Hidden when zero, so an empty group's heading stays quiet. */
  count?: number | undefined
}>()
</script>

<template>
  <h2
    class="flex w-fit items-center gap-2 self-start rounded-full border px-3 py-1"
    :class="tone.card"
  >
    <ToneDot :fill="tone.fill" />
    <span class="text-xs font-semibold tracking-wide uppercase" :class="tone.text">
      {{ label }}
    </span>
    <span v-if="count > 0" class="text-ink-soft text-xs tabular-nums">{{ count }}</span>
  </h2>
</template>
