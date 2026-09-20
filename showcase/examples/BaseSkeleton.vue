<script setup lang="ts">
import { BaseSkeleton } from 'rei-kit'
</script>

<template>
  <div class="flex items-center gap-3" aria-busy="true">
    <BaseSkeleton shape="circle" height="2.5rem" />
    <div class="flex-1">
      <BaseSkeleton shape="text" width="40%" height="0.75rem" />
      <BaseSkeleton class="mt-2" shape="text" width="70%" height="0.75rem" />
    </div>
  </div>
</template>
