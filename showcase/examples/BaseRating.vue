<script setup lang="ts">
import { ref } from 'vue'
import { BaseRating } from 'rei-kit'

const score = ref(4)
</script>

<template>
  <BaseRating
    v-model="score"
    label="Your rating"
    :value-label="(value, max) => `${value} out of ${max}`"
  />
</template>
