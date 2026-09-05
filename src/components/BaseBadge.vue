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
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
}>()

const TONES = {
  neutral: 'bg-muted text-ink-soft',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-positive/12 text-positive',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-negative/12 text-negative',
} as const

const skin = computed(() => TONES[tone])
</script>

<template>
  <span
    class="rounded-cell inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium whitespace-nowrap"
    :class="skin"
  >
    <slot />
  </span>
</template>
