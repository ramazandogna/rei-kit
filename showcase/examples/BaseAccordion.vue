<script setup lang="ts">
import { BaseAccordion } from 'rei-kit/web'

const faq = [
  { key: 'price', title: 'How much does it cost?' },
  { key: 'export', title: 'Can I export my data?' },
]
</script>

<template>
  <BaseAccordion :items="faq">
    <template #default="{ item }">
      <p v-if="item.key === 'price'">Free while in beta.</p>
      <p v-else>Yes, from the settings page.</p>
    </template>
  </BaseAccordion>
</template>
