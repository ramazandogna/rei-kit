<script setup lang="ts">
import { ref } from 'vue'
import { BaseSwitch } from 'rei-kit'

const reminders = ref(true)
</script>

<template>
  <BaseSwitch v-model="reminders" label="Daily reminder" hint="Every evening at 21:00" />
</template>
