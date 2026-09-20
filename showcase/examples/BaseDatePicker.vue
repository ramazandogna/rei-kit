<script setup lang="ts">
import { ref } from 'vue'
import { BaseDatePicker, addDays, todayKey } from 'rei-kit'
import type { DateRange } from 'rei-kit'

const span = ref<DateRange | undefined>()

const presets = [
  { label: 'Last 7 days', value: () => ({ start: addDays(todayKey(), -6), end: todayKey() }) },
  { label: 'Last 30 days', value: () => ({ start: addDays(todayKey(), -29), end: todayKey() }) },
]
</script>

<template>
  <BaseDatePicker
    v-model="span"
    mode="range"
    label="Report period"
    placeholder="Choose a period"
    clear-label="Clear the period"
    :presets="presets"
    previous-label="Previous month"
    next-label="Next month"
  />
</template>
