<script setup lang="ts">
const {
  rows = 3,
  rowHeight = 'h-14',
  label = 'Loading…',
} = defineProps<{
  rows?: number
  rowHeight?: string
  label?: string
}>()
</script>

<template>
  <div role="status" class="flex flex-col gap-1">
    <span class="sr-only">{{ label }}</span>

    <div
      v-for="row in rows"
      :key="row"
      class="bg-muted rounded-card animate-pulse"
      :class="rowHeight"
      aria-hidden="true"
    />
  </div>
</template>
