<script setup lang="ts">
import { BaseButton, ToastHost, useToast } from 'rei-kit'

const toast = useToast()
</script>

<template>
  <!-- Once, near the root of the app. -->
  <ToastHost close-label="Close" />

  <BaseButton @click="toast.success('Saved')">Save</BaseButton>
</template>
