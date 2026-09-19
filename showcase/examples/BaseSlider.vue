<script setup lang="ts">
import { ref } from 'vue'
import { BaseSlider } from 'rei-kit'

const goal = ref(20)
</script>

<template>
  <BaseSlider v-model="goal" label="Daily goal" :min="5" :max="60" :step="5" show-value />
</template>
