<script setup lang="ts">
import { LineChart } from 'rei-kit'

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const series = [
  { name: 'Web', values: [12, 18, 15, 24, 30, 28, 36] },
  { name: 'Mobile', values: [8, 10, 14, 12, 18, 22, 25] },
]
</script>

<template>
  <LineChart label="Signups this week" :labels="labels" :series="series" area />
</template>
