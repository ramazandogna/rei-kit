<script setup lang="ts">
import { ref } from 'vue'
import { BaseListbox } from 'rei-kit'

const chosen = ref<string[]>(['ada'])
const people = [
  { value: 'ada', label: 'Ada Lovelace', description: 'Owner' },
  { value: 'kenji', label: 'Kenji Mori', description: 'Editor' },
  { value: 'mei', label: 'Mei Lin', description: 'Invited', disabled: true },
]
</script>

<template>
  <BaseListbox v-model="chosen" mode="multiple" :options="people" label="People with access" />
</template>
