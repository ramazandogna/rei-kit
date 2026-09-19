<script setup lang="ts">
import { BaseAlert } from 'rei-kit'
</script>

<template>
  <BaseAlert tone="warning">
    <template #title>Unsaved changes</template>
    Leave now and the last edit is lost.
  </BaseAlert>
</template>
