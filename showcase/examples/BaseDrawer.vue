<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCheckbox } from 'rei-kit'
import { BaseDrawer } from 'rei-kit/web'

const open = ref(false)
const unpaid = ref(true)
const thisMonth = ref(false)
</script>

<template>
  <BaseButton variant="secondary" @click="open = true">Filters</BaseButton>

  <BaseDrawer v-model="open" title="Filters" close-label="Close" side="end" size="24rem">
    <div class="flex flex-col gap-3">
      <BaseCheckbox v-model="unpaid" label="Only unpaid" />
      <BaseCheckbox v-model="thisMonth" label="This month" />
    </div>

    <template #actions>
      <BaseButton variant="ghost" @click="open = false">Clear</BaseButton>
      <BaseButton @click="open = false">Apply</BaseButton>
    </template>
  </BaseDrawer>
</template>
