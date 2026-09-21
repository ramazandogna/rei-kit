<script setup lang="ts">
import { DonutChart } from 'rei-kit'

const PARTS = [
  { key: 'components', label: 'Component styles', value: 19.8 },
  { key: 'tokens', label: 'Tokens', value: 4.6 },
  { key: 'palettes', label: 'Palettes', value: 2.2 },
  { key: 'motion', label: 'Motion', value: 1.3 },
]

const TONES = ['text-primary', 'text-accent', 'text-positive', 'text-warning']
</script>

<template>
  <DonutChart
    :slices="PARTS"
    label="What the stylesheet is made of"
    :value-label="(kb) => `${kb.toFixed(1)} KB`"
    :fill="(_, index) => TONES[index % TONES.length]!"
  />
</template>
