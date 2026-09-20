<script setup lang="ts">
import { ref } from 'vue'
import { SliderField } from 'rei-kit'

const opacity = ref(40)
</script>

<template>
  <SliderField
    v-model="opacity"
    label="Opacity"
    :min="0"
    :max="100"
    :step="5"
    decrement-label="Less opaque"
    increment-label="More opaque"
    :format="(value) => `${value}%`"
    hint="Drag for roughly right, type for exactly right."
  />
</template>
