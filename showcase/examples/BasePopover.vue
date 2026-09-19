<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BasePopover, BaseSwitch } from 'rei-kit'

const unpaid = ref(true)
</script>

<template>
  <BasePopover label="Filters">
    <template #trigger="{ props }">
      <BaseButton variant="secondary" v-bind="props">Filters</BaseButton>
    </template>

    <template #default="{ close }">
      <BaseSwitch v-model="unpaid" label="Only unpaid" />
      <BaseButton class="mt-3" size="sm" block @click="close">Done</BaseButton>
    </template>
  </BasePopover>
</template>
