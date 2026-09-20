<script setup lang="ts">
import { ref } from 'vue'
import { BaseCalendar, todayKey } from 'rei-kit'

const day = ref<string | undefined>(todayKey())
</script>

<template>
  <BaseCalendar
    v-model="day"
    previous-label="Previous month"
    next-label="Next month"
    :min="todayKey()"
  />
</template>
