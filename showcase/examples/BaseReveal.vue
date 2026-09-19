<script setup lang="ts">
import { BaseCard } from 'rei-kit'
import { BaseReveal } from 'rei-kit/motion'

const items = ['Fast', 'Accessible', 'Themeable']
</script>

<template>
  <BaseReveal v-for="(item, i) in items" :key="item" :delay="i * 80">
    <BaseCard>{{ item }}</BaseCard>
  </BaseReveal>
</template>
