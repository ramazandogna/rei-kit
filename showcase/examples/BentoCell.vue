<script setup lang="ts">
import { BentoCell, BentoGrid } from 'rei-kit/web'
</script>

<template>
  <BentoGrid :columns="2" row-height="9rem" as="ul">
    <BentoCell :row="2" title="Tall cell" description="Spans two rows.">
      <template #visual><div class="bg-muted rounded-control h-full" /></template>
    </BentoCell>
    <BentoCell title="Plain" description="One cell." />
    <BentoCell title="With footer">
      <template #footer><span class="text-ink-soft text-xs">Footer</span></template>
    </BentoCell>
  </BentoGrid>
</template>
