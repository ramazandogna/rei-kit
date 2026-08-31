<script setup lang="ts">
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-vue-next'

const {
  value,
  label,
  trend = null,
} = defineProps<{
  value: string
  label: string
  trend?: 'up' | 'down' | 'flat' | null
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
