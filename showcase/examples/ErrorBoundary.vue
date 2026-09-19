<script setup lang="ts">
import { RouterView } from 'vue-router'
import { BaseButton, ErrorBoundary } from 'rei-kit'

function report(cause: unknown) {
  console.error(cause)
}
</script>

<template>
  <ErrorBoundary @error="report">
    <RouterView />

    <template #fallback="{ reset }">
      <p>That part of the page failed.</p>
      <BaseButton @click="reset">Try again</BaseButton>
    </template>
  </ErrorBoundary>
</template>
