<script setup lang="ts">
import { ScrollArea } from 'rei-kit'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
</script>

<template>
  <!-- Nothing inside takes focus, so this becomes a named focus stop on its
       own and the far end stays reachable with a keyboard. -->
  <ScrollArea axis="x" scrollbar="hidden" label="The year so far" class="max-w-sm">
    <p class="flex gap-3 whitespace-nowrap">
      <span v-for="month in MONTHS" :key="month" class="text-ink-soft text-sm">{{ month }}</span>
    </p>
  </ScrollArea>
</template>
