<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { BaseButton } from '../../src/index'
import { ENTRIES } from '../catalog'
import AxesSection from '../AxesSection.vue'
import GettingStarted from '../GettingStarted.vue'

/**
 * Temporary home (task 5b replaces it with the Prism hero, the "80 looks"
 * matrix, the bento and the install steps). Until then: a short intro and the
 * two existing sections the new home keeps. The full gallery is /components.
 */
</script>

<template>
  <div class="site-page">
    <section class="site-section">
      <p class="site-eyebrow">rei-kit</p>
      <h1 class="site-h1">Change one attribute.</h1>
      <p class="site-lead">
        {{ ENTRIES.length }} accessible Vue 3 components. Four materials, ten palettes, light and
        dark, from the same markup.
      </p>
      <div class="home-actions">
        <BaseButton as="router-link" to="/components">Browse components</BaseButton>
        <BaseButton as="router-link" to="/docs" variant="secondary">Read the docs</BaseButton>
        <RouterLink to="/themes" class="home-link">Explore themes →</RouterLink>
      </div>
    </section>
    <AxesSection />
    <GettingStarted />
  </div>
</template>

<style scoped>
.home-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
}
.home-link {
  color: var(--color-primary);
}
</style>
