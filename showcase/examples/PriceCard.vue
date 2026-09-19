<script setup lang="ts">
import { BaseButton, PriceCard } from 'rei-kit'
</script>

<template>
  <PriceCard
    name="Pro"
    price="₺49"
    period="/ month"
    :features="['Unlimited entries', 'Export', 'Sync']"
    recommended
    badge="Popular"
  >
    <template #action>
      <BaseButton block>Choose Pro</BaseButton>
    </template>
  </PriceCard>
</template>
