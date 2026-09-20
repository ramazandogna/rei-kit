<script setup lang="ts">
import { AvatarStack } from 'rei-kit'

const people = [
  { name: 'Aiko Tanaka' },
  { name: 'Kenji Mori' },
  { name: 'Mei Lin' },
  { name: 'Ravi Patel' },
  { name: 'Sara Yilmaz' },
]
</script>

<template>
  <AvatarStack :people="people" :max="3" label="Shared with 5 people" />
</template>
