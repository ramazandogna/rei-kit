<script setup lang="ts">
import { SectionHeading } from 'rei-kit'

// Written out, so Tailwind sees the classes.
const income = {
  fill: 'bg-positive',
  card: 'bg-positive/5 border-positive/25',
  text: 'text-positive',
}
</script>

<template>
  <SectionHeading :tone="income" label="Income" :count="3" />
</template>
