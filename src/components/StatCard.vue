<script setup lang="ts">
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-vue-next'

/**
 * One number, with what it means and which way it is going.
 *
 * The trend is an arrow and a colour, and neither is allowed to be the whole
 * message: the direction is also in the arrow's shape, so it survives a reader
 * who cannot separate the kit's positive and negative hues. `null` is a real
 * state rather than a missing one — a figure with no comparison yet is not a
 * flat figure.
 */
const {
  value,
  label,
  trend = null,
} = defineProps<{
  value: string
  label: string
  trend?: 'up' | 'down' | 'flat' | null | undefined
}>()

const TREND_ICON = { up: ArrowUp, down: ArrowDown, flat: ArrowRight } as const
</script>

<template>
  <div class="border-hair rounded-card flex flex-1 flex-col gap-0.5 border p-3">
    <div class="flex items-baseline gap-1">
      <span class="text-ink text-xl font-semibold tabular-nums">{{ value }}</span>
      <component :is="TREND_ICON[trend]" v-if="trend" class="text-ink-soft size-3" />
    </div>
    <span class="text-ink-soft text-xs">{{ label }}</span>
  </div>
</template>
