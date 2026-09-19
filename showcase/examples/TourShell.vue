<script setup lang="ts">
import { ref } from 'vue'
import { TourShell } from 'rei-kit/app'

const open = ref(true)
const step = ref(0)
</script>

<template>
  <TourShell
    v-model="open"
    :index="step"
    :total="3"
    dialog-label="Welcome tour"
    skip-label="Skip"
    back-label="Back"
    next-label="Next"
    last-label="Start"
    :step-label="(n) => `Step ${n}`"
    @next="step++"
    @back="step--"
    @dismiss="open = false"
  >
    <template #default="{ index }">
      <h2>Step {{ index + 1 }}</h2>
    </template>
  </TourShell>
</template>
