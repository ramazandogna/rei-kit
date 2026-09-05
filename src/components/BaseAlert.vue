<script setup lang="ts">
import { computed } from 'vue'

/**
 * A message the reader has to take in before carrying on.
 *
 * Roles rather than colours, like everything else here: `info` is neutral,
 * `success` confirms, `warning` is a condition to know about, `danger` is
 * something that went wrong or is about to. A component that took a hex would
 * be a component that ignores the theme, and the theme is the whole reason the
 * kit exists.
 *
 * `assertive` decides how a screen reader treats it: a failed save interrupts,
 * a note about a form field waits its turn. Getting this wrong is invisible on
 * screen and rude in a screen reader, which is why it is a prop and not a
 * guess.
 */
const { tone = 'info', assertive = false } = defineProps<{
  tone?: 'info' | 'success' | 'warning' | 'danger'
  /** Announce immediately, interrupting. For failures the reader must act on. */
  assertive?: boolean
}>()

const TONES = {
  info: 'border-hair bg-muted/40 text-ink',
  success: 'border-positive/35 bg-positive/8 text-ink',
  warning: 'border-warning/40 bg-warning/8 text-ink',
  danger: 'border-negative/35 bg-negative/8 text-ink',
} as const

const MARKS = {
  info: 'bg-ink-soft/15 text-ink-soft',
  success: 'bg-positive/15 text-positive',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-negative/15 text-negative',
} as const

const skin = computed(() => TONES[tone])
const mark = computed(() => MARKS[tone])
</script>

<template>
  <div
    class="rounded-card flex items-start gap-3 border px-4 py-3.5 text-sm leading-relaxed"
    :class="skin"
    :role="assertive ? 'alert' : 'status'"
    :aria-live="assertive ? 'assertive' : 'polite'"
  >
    <span
      v-if="$slots.mark"
      class="mt-px grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold"
      :class="mark"
      aria-hidden="true"
    >
      <slot name="mark" />
    </span>

    <div class="min-w-0 flex-1">
      <p v-if="$slots.title" class="text-ink font-semibold">
        <slot name="title" />
      </p>
      <div :class="$slots.title ? 'mt-1' : ''"><slot /></div>
    </div>

    <slot name="action" />
  </div>
</template>
