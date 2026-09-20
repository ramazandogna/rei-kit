<script setup lang="ts">
import { BaseCard, BaseTimeline } from 'rei-kit'

/* Your own objects: the slots hand them back typed, so a body can read
   `event.body` without a lookup by key. `time` is already formatted —
   only you know whether this line should say "12 September", "2 hours ago"
   or "09:42". */
const notes = [
  { key: 'n3', time: '12 September', body: 'Walked the long way home.', fill: 'bg-positive' },
  { key: 'n2', time: '11 September', body: 'Rested. No guilt.', fill: 'bg-positive' },
  { key: 'n1', time: '9 September', body: 'Started again.', fill: 'bg-primary' },
]
</script>

<template>
  <BaseTimeline :events="notes" label="Notes on this habit">
    <template #default="{ event }">
      <BaseCard as="blockquote" padding="sm" class="text-ink text-sm leading-relaxed">
        {{ event.body }}
      </BaseCard>
    </template>
  </BaseTimeline>
</template>
