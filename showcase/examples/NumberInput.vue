<script setup lang="ts">
import { ref } from 'vue'
import { NumberInput } from 'rei-kit'

const guests = ref<number | undefined>(2)
</script>

<template>
  <NumberInput
    v-model="guests"
    label="Guests"
    :min="1"
    :max="12"
    decrement-label="Fewer guests"
    increment-label="More guests"
  />
</template>
