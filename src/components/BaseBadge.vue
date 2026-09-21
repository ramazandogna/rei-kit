<script setup lang="ts">
import { computed } from 'vue'

/**
 * A small standing label: a level, a state, a count.
 *
 * Not a button and never clickable — the moment one of these needs a click it
 * is a chip, which is a different component with focus, a hit area and a way
 * to be removed. Keeping that line drawn is most of the value.
 */
const { tone = 'neutral' } = defineProps<{
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | undefined
}>()

/*
 * The role paints the ground and the edge; `ink` paints the words.
 *
 * These used to write the role on a tint of itself — `text-positive` on
 * `bg-positive/12` — which is the obvious way to build a coloured badge and
 * is unreadable by construction. A twelve per cent tint of a colour is
 * always close to that colour, so the pair measured 1.89:1 at worst across
 * the ten palettes and failed WCAG AA in twelve of the twenty
 * palette-and-mode combinations. Nothing caught it: the palette check
 * measures token against token and this ground is neither, and the jsdom
 * audit has contrast switched off because there is no layout to measure. A
 * real browser found it.
 *
 * `text-ink` on the same tint is 4.56:1 at worst, because a faint wash of
 * anything over a surface is still nearly that surface. The colour has not
 * gone anywhere — it is the ground and the border, which is what `BaseAlert`
 * already did, and a badge was the odd one out rather than the rule.
 */
const TONES = {
  neutral: 'border-hair bg-muted text-ink',
  primary: 'border-primary/30 bg-primary/10 text-ink',
  success: 'border-positive/35 bg-positive/12 text-ink',
  warning: 'border-warning/40 bg-warning/15 text-ink',
  danger: 'border-negative/35 bg-negative/12 text-ink',
} as const

const skin = computed(() => TONES[tone])
</script>

<template>
  <span
    class="rounded-cell inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-medium whitespace-nowrap"
    :class="skin"
  >
    <slot />
  </span>
</template>
