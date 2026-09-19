<script setup lang="ts">
import { ref } from 'vue'
import { BaseTabs } from 'rei-kit/web'

const tab = ref('week')
const tabs = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
]
</script>

<template>
  <BaseTabs v-model="tab" :items="tabs" label="Report">
    <template #default="{ active }">
      <p v-if="active === 'week'">This week…</p>
      <p v-else>This month…</p>
    </template>
  </BaseTabs>
</template>
