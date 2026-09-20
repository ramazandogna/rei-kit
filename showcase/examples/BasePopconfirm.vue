<script setup lang="ts">
import { BaseButton, BasePopconfirm } from 'rei-kit'

function remove() {
  // …
}
</script>

<template>
  <BasePopconfirm
    message="This entry will be deleted."
    confirm-label="Delete"
    cancel-label="Cancel"
    @confirm="remove"
  >
    <template #trigger="{ props }">
      <BaseButton variant="danger" size="sm" v-bind="props">Delete</BaseButton>
    </template>
  </BasePopconfirm>
</template>
