<script setup lang="ts">
import { BentoCell, BentoGrid } from 'rei-kit/web'
</script>

<template>
  <BentoGrid :columns="3" row-height="8rem">
    <BentoCell :col="2" title="Four materials" description="Quiet, glass, brutal and soft." />
    <BentoCell title="Ten palettes" description="Light and dark." />
    <BentoCell title="Accessible" description="Keyboard and screen reader first." />
    <BentoCell :col="2" interactive title="No dependencies" description="Vue and Tailwind only." />
  </BentoGrid>
</template>
