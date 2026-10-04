<script setup lang="ts">
import { ref } from 'vue'
import { BaseCheckboxGroup } from 'rei-kit'

const days = ref(['mon', 'thu'])
const weekdays = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday', hint: 'Busiest day' },
]
</script>

<template>
  <BaseCheckboxGroup
    v-model="days"
    legend="Remind me on"
    :options="weekdays"
    select-all-label="Every weekday"
    :columns="2"
  />
</template>
