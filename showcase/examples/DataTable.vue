<script setup lang="ts">
import { ref } from 'vue'
import { DataTable } from 'rei-kit/web'
import type { DataColumn, TableSort } from 'rei-kit/web'

interface Payment extends Record<string, unknown> {
  id: string
  name: string
  amount: number
}

const columns: DataColumn<Payment>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'amount', label: 'Amount', align: 'end', sortable: true },
]
const rows: Payment[] = [
  { id: 'a', name: 'Ada Lovelace', amount: 4200 },
  { id: 'b', name: 'Ömer Seyfettin', amount: 120 },
]

const sort = ref<TableSort<Payment> | undefined>({ key: 'amount', direction: 'desc' })
const selected = ref<string[]>([])
</script>

<template>
  <DataTable
    v-model:sort="sort"
    v-model:selected="selected"
    :columns="columns"
    :rows="rows"
    caption="Payments"
    row-key="id"
    select-all-label="Select every payment"
    :row-label="(row) => `Select ${row.name}`"
  >
    <template #amount="{ value }">{{ value }} ₺</template>
  </DataTable>
</template>
