<script setup lang="ts">
import { ref } from 'vue'
import { TransferList } from 'rei-kit/web'

const granted = ref<string[]>(['read'])
const permissions = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'admin', label: 'Administer' },
]
</script>

<template>
  <TransferList
    v-model="granted"
    :options="permissions"
    available-label="Available"
    chosen-label="Granted"
    add-label="Grant the chosen permissions"
    remove-label="Take back the chosen permissions"
  />
</template>
