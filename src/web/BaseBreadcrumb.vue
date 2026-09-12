<script setup lang="ts">
import { RouterLink } from 'vue-router'

export interface Crumb {
  /** Already translated. */
  label: string
  /** Omitted for the current page, which is not a link to itself. */
  to?: string | undefined
}

/**
 * Where this page sits, and the way back up.
 *
 * An ordered list inside a `nav`, because the order is the meaning. The last
 * crumb is the current page and is deliberately not a link: a link to the page
 * you are on is a control that does nothing, and `aria-current="page"` is what
 * says so to everyone else.
 *
 * The separators are `aria-hidden`. A screen reader announces a list and its
 * position in it; reading "slash" between every item is noise on top of
 * information the reader already has.
 */
const { items, label = '' } = defineProps<{
  items: readonly Crumb[]
  /** Accessible name for the landmark. */
  label?: string | undefined
}>()
</script>

<template>
  <nav :aria-label="label || undefined">
    <ol class="rk-crumbs">
      <li v-for="(item, index) in items" :key="item.label" class="rk-crumb">
        <RouterLink v-if="item.to" :to="item.to" class="rk-crumb-link">
          {{ item.label }}
        </RouterLink>
        <span v-else class="rk-crumb-current" aria-current="page">{{ item.label }}</span>

        <span v-if="index < items.length - 1" class="rk-crumb-sep" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.rk-crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.rk-crumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rk-crumb-link {
  color: var(--color-ink-soft);
  transition: color 150ms;
}

.rk-crumb-link:hover {
  color: var(--color-ink);
}

.rk-crumb-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

.rk-crumb-current {
  color: var(--color-ink);
  font-weight: 500;
}

.rk-crumb-sep {
  color: var(--color-hair);
}
</style>
