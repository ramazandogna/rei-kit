<script setup lang="ts">
import { BookOpen, Home, LayoutGrid, Palette, SwatchBook } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

/**
 * Phones only (< 640px): the five places a thumb goes, pinned to the bottom
 * edge. "Look" opens the appearance sheet, so material, palette and mode are
 * one tap away without a floating button on top of the page.
 */
defineProps<{ lookOpen: boolean }>()
defineEmits<{ look: [] }>()

const route = useRoute()
const TABS = [
  { to: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
  {
    to: '/components',
    label: 'Components',
    icon: LayoutGrid,
    match: (p: string) => p.startsWith('/components') || p.startsWith('/c/'),
  },
  { to: '/themes', label: 'Themes', icon: Palette, match: (p: string) => p.startsWith('/themes') },
  { to: '/docs', label: 'Docs', icon: BookOpen, match: (p: string) => p.startsWith('/docs') },
]
const path = computed(() => route.path)
</script>

<template>
  <nav class="mtb surface-overlay" aria-label="Primary">
    <RouterLink
      v-for="tab in TABS"
      :key="tab.to"
      :to="tab.to"
      class="mtb-tab focus-ring"
      :class="{ 'is-active': tab.match(path) }"
      :aria-current="tab.match(path) ? 'page' : undefined"
    >
      <component :is="tab.icon" class="mtb-icon" aria-hidden="true" />
      <span>{{ tab.label }}</span>
    </RouterLink>
    <button
      type="button"
      class="mtb-tab focus-ring"
      :class="{ 'is-active': lookOpen }"
      aria-haspopup="dialog"
      :aria-expanded="lookOpen"
      aria-controls="appearance-sheet"
      @click="$emit('look')"
    >
      <SwatchBook class="mtb-icon" aria-hidden="true" />
      <span>Look</span>
    </button>
  </nav>
</template>

<style scoped>
.mtb {
  display: none;
}
@media (max-width: 39.99rem) {
  .mtb {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 50;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    padding: 6px 6px calc(6px + env(safe-area-inset-bottom));
    border-radius: 0;
    border-width: 1px 0 0;
    box-shadow: 0 -8px 24px -12px color-mix(in oklab, var(--color-ink) 30%, transparent);
  }
}
.mtb-tab {
  display: flex;
  min-height: 48px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: var(--radius-control);
  font-size: 11px;
  line-height: 1.1;
  color: var(--color-ink-soft);
}
.mtb-icon {
  width: 22px;
  height: 22px;
}
.mtb-tab.is-active {
  color: var(--color-primary);
  font-weight: 600;
  background: color-mix(in oklab, var(--color-primary) 12%, transparent);
}
</style>
