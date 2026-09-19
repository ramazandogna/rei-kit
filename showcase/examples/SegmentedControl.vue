<script setup lang="ts">
import { ref } from 'vue'
import { SegmentedControl } from 'rei-kit'

const range = ref('week')
const ranges = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]
</script>

<template>
  <SegmentedControl v-model="range" :options="ranges" />
</template>
