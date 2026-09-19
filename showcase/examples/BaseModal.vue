<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from 'rei-kit'
import { BaseModal } from 'rei-kit/web'

const open = ref(false)
</script>

<template>
  <BaseButton @click="open = true">Delete account</BaseButton>

  <BaseModal v-model="open" title="Delete account?" close-label="Close" tone="alert">
    This cannot be undone.

    <template #actions>
      <BaseButton variant="secondary" @click="open = false">Cancel</BaseButton>
      <BaseButton variant="danger">Delete</BaseButton>
    </template>
  </BaseModal>
</template>
