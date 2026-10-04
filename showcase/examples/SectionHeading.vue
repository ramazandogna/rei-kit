<script setup lang="ts">
import { SectionHeading } from 'rei-kit'

/* Written out, so Tailwind sees the classes. The role carries the dot and the
   edge; the words stay `text-ink`, because a role on a faint wash of itself
   measures about 2:1 — the fault five components in this kit were fixed for. */
const income = {
  fill: 'bg-positive',
  card: 'bg-positive/5 border-positive/25',
  text: 'text-ink',
}
</script>

<template>
  <SectionHeading :tone="income" label="Income" :count="3" />
</template>
