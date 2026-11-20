<script setup lang="ts">
import { Sparkline } from 'rei-kit'
</script>

<template>
  <div class="flex items-center gap-4">
    <span class="text-ink text-2xl font-semibold">48</span>
    <div class="w-32">
      <Sparkline :values="[12, 18, 15, 24, 30, 28, 48]" label="Signups" area />
    </div>
  </div>
</template>
