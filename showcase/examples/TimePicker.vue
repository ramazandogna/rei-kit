<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from 'rei-kit'

const at = ref<string | undefined>('09:30')
</script>

<template>
  <TimePicker
    v-model="at"
    label="Reminder"
    hours-label="Hour"
    minutes-label="Minute"
    placeholder="Choose a time"
    :step="15"
    min="07:00"
    max="22:00"
    hint="Stored as HH:mm, shown in your own clock."
  />
</template>
