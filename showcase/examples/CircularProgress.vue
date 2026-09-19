<script setup lang="ts">
import { CircularProgress } from 'rei-kit'
</script>

<template>
  <div class="flex items-center gap-4">
    <CircularProgress :value="72" label="Upload" show-value size="lg" />
    <CircularProgress label="Loading" />
  </div>
</template>
