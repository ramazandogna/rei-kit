<script setup lang="ts" generic="K extends string">
import { RouterLink } from 'vue-router'
import type { Component } from 'vue'

import { tapFeedback } from '../utils/haptics'

export interface TabItem<K extends string> {
  /** Identity, compared against `active`. */
  key: K
  /** Router destination. */
  to: string
  /** Text under the icon. Already translated. */
  label: string
  icon: Component
}

/**
 * The floating bottom bar.
 *
 * Items and the active key are props: the package has no opinion about how an
 * app names its screens, and reading `route.meta` here would force one.
 */
const {
  items,
  active,
  label = '',
} = defineProps<{
  items: readonly TabItem<K>[]
  /** Which item is current. Usually from `route.meta`. */
  active?: K | undefined
  /** Accessible name for the navigation landmark. */
  label?: string
}>()
</script>

<template>
  <header class="tab-bar">
    <nav class="tab-bar-inner" :aria-label="label || undefined">
      <RouterLink
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        class="tab-link"
        :class="{ 'is-active': item.key === active }"
        :aria-current="item.key === active ? 'page' : undefined"
        @click="tapFeedback()"
      >
        <span class="tab-icon-slot">
          <component :is="item.icon" class="tab-icon" />
        </span>
        <span class="tab-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </header>
</template>

<style scoped>
@reference "../styles/_reference.css";

/* absolute, not fixed: the bar hangs inside the app shell. Fixed would pin it
   to the browser window, which on a desktop is nowhere near the app. */
.tab-bar {
  @apply absolute left-1/2 z-40 w-full max-w-[360px] -translate-x-1/2 px-4;
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
}

.tab-bar-inner {
  @apply border-hair bg-surface/85 flex items-center justify-between gap-1 border p-1.5 shadow-lg backdrop-blur-md;
  border-radius: var(--radius-shell);
}

.tab-link {
  @apply text-ink-soft flex min-h-[52px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-1.5;
  border-radius: calc(var(--radius-shell) - 6px);
  /* Only the icon reacts to a press. Scaling the whole link drags the label and
     the pill with it, which reads as the bar wobbling. */
  transition: color 200ms ease;
}

.tab-link:hover {
  @apply text-ink;
}

/* The pill sits behind the icon rather than the link, so the active tab grows a
   marker instead of the row changing shape. */
.tab-icon-slot {
  @apply flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200 ease-out;
}

.tab-link:active .tab-icon-slot {
  transform: scale(0.88);
}

.is-active {
  @apply text-primary;
}

.is-active .tab-icon-slot {
  @apply bg-muted;
}

.tab-icon {
  @apply size-[18px] stroke-2 transition-transform duration-200;
}

.is-active .tab-icon {
  @apply scale-110 stroke-[2.5px];
}

.tab-label {
  @apply text-[10px] leading-none font-medium;
}

.is-active .tab-label {
  @apply font-semibold;
}

@media (prefers-reduced-motion: reduce) {
  .tab-icon-slot,
  .tab-icon {
    transition: none;
  }
  .tab-link:active .tab-icon-slot {
    transform: none;
  }
}
</style>
