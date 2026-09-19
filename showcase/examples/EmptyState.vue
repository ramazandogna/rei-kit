<script setup lang="ts">
import { BaseButton, EmptyState } from 'rei-kit'
</script>

<template>
  <EmptyState title="No entries yet" description="Your first one takes ten seconds.">
    <template #action>
      <BaseButton>Write one</BaseButton>
    </template>
  </EmptyState>
</template>
