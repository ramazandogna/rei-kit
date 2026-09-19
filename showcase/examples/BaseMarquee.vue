<script setup lang="ts">
import { BaseBadge } from 'rei-kit'
import { BaseMarquee } from 'rei-kit/motion'

const names = ['Nord', 'Dracula', 'Catppuccin', 'Gruvbox']
</script>

<template>
  <BaseMarquee :duration="40">
    <BaseBadge v-for="name in names" :key="name">{{ name }}</BaseBadge>
  </BaseMarquee>
</template>
