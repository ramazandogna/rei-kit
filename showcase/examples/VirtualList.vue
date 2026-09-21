<script setup lang="ts">
import { VirtualList } from 'rei-kit'

/** Long enough that rendering all of it would be the reason to reach for this. */
const ROWS = Array.from({ length: 5000 }, (_, index) => ({
  id: index,
  name: `Row ${index + 1}`,
}))
</script>

<template>
  <VirtualList
    :items="ROWS"
    :row-height="36"
    label="Five thousand rows"
    class="border-hair max-h-56 rounded-xl border"
  >
    <template #default="{ item }">
      <span class="text-ink flex h-full items-center px-3 text-sm">{{ item.name }}</span>
    </template>
  </VirtualList>
</template>
