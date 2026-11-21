<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

import InstallSection from '../InstallSection.vue'
import LooksSection from '../LooksSection.vue'
import PrismHero from '../PrismHero.vue'

/** Curated, not exhaustive: Prism, the three axes, what is new, install. */

/* "What is new" is two screens below the hero on a phone and mounts charts,
   a chat thread and four effects. As its own chunk it no longer sits between
   the first byte and the hero's paint (LCP); it streams in right after. */
const NewSection = defineAsyncComponent(() => import('../NewSection.vue'))
</script>

<template>
  <PrismHero />
  <LooksSection class="home-defer" />
  <NewSection class="home-defer" />
  <InstallSection class="home-defer" />
</template>
