<script setup lang="ts">
import { CopyButton } from 'rei-kit'
</script>

<template>
  <CopyButton
    text="pnpm add rei-kit"
    copy-label="Copy the command"
    copied-label="Copied"
    error-label="Could not copy"
    with-text
  />
</template>
