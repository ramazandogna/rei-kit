<script setup lang="ts">
import { ref } from 'vue'
import { BaseSelect } from 'rei-kit'

const currency = ref()
const options = [
  { value: 'TRY', label: 'Turkish lira' },
  { value: 'JPY', label: 'Japanese yen' },
]
</script>

<template>
  <BaseSelect v-model="currency" label="Currency" :options="options" placeholder="Choose one" />
</template>
