<script setup lang="ts">
import { computed } from 'vue'

import { MATERIALS, useMaterial, useTheme } from '../src/index'
import type { Material } from '../src/index'
import PalettePicker from './PalettePicker.vue'

/**
 * The three axes, as three controls: material, palette, light or dark.
 *
 * Built from the kit's own tokens and switched with the kit's own composables,
 * so everything on this page is proof of the thing it demonstrates — the
 * controls change as you use them.
 */
const material = useMaterial()
const theme = useTheme()

const LABELS: Record<Material, string> = {
  quiet: 'Quiet',
  glass: 'Glass',
  brutal: 'Brutal',
  soft: 'Soft',
}

const isDark = computed(() => {
  if (theme.value === 'system') {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  }
  return theme.value === 'dark'
})

function toggleTheme() {
  theme.value = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <div class="ab">
    <div class="ab-materials control" role="radiogroup" aria-label="Material">
      <button
        v-for="m in MATERIALS"
        :key="m"
        type="button"
        role="radio"
        class="ab-material"
        :class="{ 'is-active': material === m }"
        :aria-checked="material === m"
        @click="material = m"
      >
        {{ LABELS[m] }}
      </button>
    </div>

    <PalettePicker />

    <button
      type="button"
      class="ab-theme control"
      :aria-label="isDark ? 'Switch to light' : 'Switch to dark'"
      @click="toggleTheme"
    >
      <svg v-if="isDark" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8" />
        <path
          d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.ab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ab-materials {
  display: inline-flex;
  gap: 2px;
  border-radius: 9999px;
  padding: 3px;
}

.ab-material {
  border-radius: 9999px;
  padding: 0.3125rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-ink-soft);
  transition:
    background-color var(--duration-base) var(--ease-standard),
    color var(--duration-base) var(--ease-standard);
}

.ab-material:hover {
  color: var(--color-ink);
}

.ab-material.is-active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.ab-material:focus-visible,
.ab-theme:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.ab-theme {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 9999px;
  color: var(--color-ink);
}

.ab-theme svg {
  width: 1.125rem;
  height: 1.125rem;
}

@media (max-width: 40rem) {
  .ab-material {
    padding: 0.3125rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
