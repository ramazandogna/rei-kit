<script setup lang="ts">
import { ref } from 'vue'
import { BaseCombobox } from 'rei-kit'

const country = ref('')
const countries = [
  { value: 'tr', label: 'Türkiye' },
  { value: 'jp', label: 'Japan' },
  { value: 'de', label: 'Germany' },
]
</script>

<template>
  <BaseCombobox
    v-model="country"
    label="Country"
    :options="countries"
    placeholder="Start typing"
    empty-label="No country matches"
  />
</template>
