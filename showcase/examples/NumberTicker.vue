<script setup lang="ts">
import { ref } from 'vue'
import { NumberTicker } from 'rei-kit/motion'

const balance = ref(48200)
</script>

<template>
  <NumberTicker :value="balance" :format="{ style: 'currency', currency: 'TRY' }" />
</template>
