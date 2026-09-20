<script setup lang="ts">
import { BaseBadge, DescriptionList } from 'rei-kit'

const items = [
  { key: 'status', term: 'Status' },
  { term: 'Created', description: '12 September 2026' },
  { term: 'Total', description: '₺1,240' },
]
</script>

<template>
  <DescriptionList :items="items" layout="inline">
    <template #status><BaseBadge tone="success">Paid</BaseBadge></template>
  </DescriptionList>
</template>
