<script setup lang="ts" generic="K extends string">
import { RouterLink } from 'vue-router'

export interface NavLinkItem<K extends string> {
  /** Identity, compared against `active`. */
  key: K
  /** Router destination. */
  to: string
  /** Already translated. */
  label: string
}

/**
 * The primary navigation of a wide site.
 *
 * The same contract as `TabBar` minus the icon, so moving an app between a
 * bottom bar and a top one is a change of component and not of data. That is
 * the whole reason the shapes match.
 *
 * A rule under the current section rather than a filled pill: at this size a
 * pill reads as a button, and these are not buttons — they are where you are.
 * The rule is a scaled element rather than a border so it can travel, and it is
 * `aria-hidden` because `aria-current` already says the same thing to anyone not
 * looking at it.
 */
const {
  items,
  active,
  label = '',
} = defineProps<{
  items: readonly NavLinkItem<K>[]
  /** Which item is current. Usually derived from the route. */
  active?: K | undefined
  /** Accessible name for the navigation landmark. */
  label?: string | undefined
}>()
</script>

<template>
  <nav class="rk-nav" :aria-label="label || undefined">
    <RouterLink
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      class="rk-nav-link"
      :class="{ 'is-active': item.key === active }"
      :aria-current="item.key === active ? 'page' : undefined"
    >
      {{ item.label }}
      <span class="rk-nav-rule" aria-hidden="true" />
    </RouterLink>
  </nav>
</template>

<style scoped>
.rk-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rk-nav-link {
  position: relative;
  border-radius: var(--radius-cell);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-ink-soft);
  transition: color 150ms;
}

.rk-nav-link:hover {
  color: var(--color-ink);
}

.rk-nav-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-nav-link.is-active {
  color: var(--color-ink);
  font-weight: 500;
}

.rk-nav-rule {
  position: absolute;
  inset-inline: 0.75rem;
  bottom: -1px;
  height: 2px;
  border-radius: 9999px;
  background: var(--color-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 300ms;
}

.rk-nav-link.is-active .rk-nav-rule {
  transform: scaleX(1);
}

@media (prefers-reduced-motion: reduce) {
  .rk-nav-rule {
    transition: none;
  }
}
</style>
