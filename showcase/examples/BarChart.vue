<script setup lang="ts">
import { BarChart } from 'rei-kit'

const SIZES = [
  { key: 'rei', label: 'rei-kit', value: 31.1 },
  { key: 'element', label: 'element-plus', value: 104.1 },
  { key: 'naive', label: 'naive-ui', value: 132.4 },
]
</script>

<template>
  <BarChart
    :series="SIZES"
    label="Bundle size, ten components"
    :value-label="(kb) => `${kb.toFixed(1)} KB`"
    :fill="(item) => (item.key === 'rei' ? 'bg-positive' : 'bg-muted')"
  />
</template>
