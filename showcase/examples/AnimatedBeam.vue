<script setup lang="ts">
import { ref } from 'vue'
import { AnimatedBeam } from 'rei-kit/motion'

const box = ref<HTMLElement | null>(null)
const a = ref<HTMLElement | null>(null)
const b = ref<HTMLElement | null>(null)
</script>

<template>
  <div ref="box" class="relative flex items-center justify-between px-6 py-10">
    <div ref="a" class="surface rounded-control px-4 py-2 text-sm">Source</div>
    <div ref="b" class="surface rounded-control px-4 py-2 text-sm">Hub</div>
    <AnimatedBeam :container="box" :from="a" :to="b" :curvature="40" />
    <p class="sr-only">Source sends data to Hub.</p>
  </div>
</template>
