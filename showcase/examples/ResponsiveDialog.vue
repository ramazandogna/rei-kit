<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'

const open = ref(false)
</script>

<template>
  <BaseButton variant="danger" @click="open = true">Delete account</BaseButton>

  <ResponsiveDialog v-model="open" title="Delete this account?" close-label="Close" tone="alert">
    Everything in it goes with it. This cannot be undone.

    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Keep it</BaseButton>
      <BaseButton variant="danger">Delete</BaseButton>
    </template>
  </ResponsiveDialog>
</template>
