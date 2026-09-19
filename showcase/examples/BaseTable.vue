<script setup lang="ts">
import { BaseTable } from 'rei-kit'

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'amount', label: 'Amount', align: 'end' },
] as const
const rows = [
  { id: 1, date: '12 Sep', amount: 320 },
  { id: 2, date: '14 Sep', amount: 1250 },
]
</script>

<template>
  <BaseTable :columns="columns" :rows="rows" caption="Recent payments" row-key="id">
    <template #amount="{ value }">{{ value }} ₺</template>
  </BaseTable>
</template>
