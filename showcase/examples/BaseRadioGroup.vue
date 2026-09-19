<script setup lang="ts">
import { ref } from 'vue'
import { BaseRadioGroup } from 'rei-kit'

const plan = ref('monthly')
const plans = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]
</script>

<template>
  <BaseRadioGroup v-model="plan" legend="Plan" :options="plans" />
</template>
