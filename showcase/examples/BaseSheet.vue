<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseSheet } from 'rei-kit'

const open = ref(false)
</script>

<template>
  <BaseButton @click="open = true">New entry</BaseButton>

  <BaseSheet v-model="open" title="New entry" close-label="Close">
    <p>Anything that belongs to a thumb.</p>
  </BaseSheet>
</template>
