<script setup lang="ts">
import { MegaMenu } from 'rei-kit/web'

/**
 * A top-level item with `columns` opens a panel; one with only `to` is a
 * plain link. Both live in the same bar.
 */
const items = [
  {
    key: 'products',
    label: 'Products',
    columns: [
      {
        key: 'apps',
        title: 'Apps',
        links: [
          { key: 'journal', to: '/journal', label: 'Journal', description: 'A day at a time' },
          { key: 'ledger', to: '/ledger', label: 'Ledger', description: 'Where the money went' },
        ],
      },
      {
        key: 'developers',
        title: 'Developers',
        links: [
          { key: 'kit', to: '/kit', label: 'Component kit' },
          { key: 'api', to: '/api', label: 'API' },
        ],
      },
    ],
  },
  { key: 'pricing', label: 'Pricing', to: '/pricing' },
]
</script>

<template>
  <MegaMenu :items="items" active="pricing" label="Main navigation">
    <!-- A slot named for a top-level item adds to that panel. -->
    <template #products>
      <p class="text-ink-soft mt-4 text-xs">Everything is free while it is in beta.</p>
    </template>
  </MegaMenu>
</template>
