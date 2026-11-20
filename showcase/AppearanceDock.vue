<script setup lang="ts">
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import {
  BasePopover,
  BaseSeparator,
  MATERIALS,
  PALETTES,
  applyMaterial,
  applyPalette,
  applyTheme,
  useMaterial,
  usePalette,
  useTheme,
} from '../src/index'
import type { Material, ThemePreference } from '../src/index'
import { BaseToolbar } from '../src/web/index'
import { seam } from './seam'

/**
 * The three axes as a floating dock: material, palette, mode. Every change
 * goes through the Seam, and the kit's own composables persist it.
 */
const material = useMaterial()
const palette = usePalette()
const theme = useTheme()

const menuOpen = ref(false)
const current = computed(() => PALETTES.find((p) => p.name === palette.value) ?? PALETTES[0]!)

const pie = (swatch: readonly string[]) =>
  `conic-gradient(from -45deg, ${swatch[0]} 0 25%, ${swatch[1]} 0 50%, ${swatch[2]} 0 75%, ${swatch[3]} 0)`

function setMaterial(next: Material) {
  menuOpen.value = false
  seam(() => {
    material.value = next
    applyMaterial(next)
  })
}

function setPalette(name: string) {
  seam(() => {
    palette.value = name
    applyPalette(name)
  })
}

const ORDER: ThemePreference[] = ['light', 'dark', 'system']
const NEXT = computed(() => ORDER[(ORDER.indexOf(theme.value) + 1) % ORDER.length]!)

function cycle() {
  const next = NEXT.value
  seam(() => {
    theme.value = next
    applyTheme(next)
  })
}
</script>

<template>
  <div class="dock-wrap">
    <BaseToolbar label="Appearance" class="dock surface-overlay">
      <div class="dock-menu">
        <button
          type="button"
          class="dock-btn focus-ring"
          :aria-expanded="menuOpen"
          aria-haspopup="menu"
          aria-label="Material"
          @click="menuOpen = !menuOpen"
        >
          <span class="site-mono dock-label">{{ material }}</span>
          <ChevronDown class="size-3.5" aria-hidden="true" />
        </button>
        <div v-if="menuOpen" class="dock-panel surface-overlay" role="menu" aria-label="Material">
          <button
            v-for="m in MATERIALS"
            :key="m"
            type="button"
            role="menuitem"
            class="dock-item focus-ring"
            @click="setMaterial(m)"
          >
            <span class="dock-swatch" :data-material="m" aria-hidden="true" />
            <span class="site-mono">{{ m }}</span>
            <Check v-if="m === material" class="dock-check size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <BaseSeparator orientation="vertical" spacing="none" class="dock-sep" />

      <BasePopover label="Palette" side="top" align="center">
        <template #trigger="{ props }">
          <button
            v-bind="props"
            type="button"
            class="dock-btn focus-ring"
            :aria-label="`Palette: ${current.label}`"
          >
            <span
              class="dock-dot"
              :style="{ background: pie(current.swatch) }"
              aria-hidden="true"
            />
            <span class="dock-label dock-palette-name">{{ current.label }}</span>
          </button>
        </template>
        <div class="dock-grid" role="radiogroup" aria-label="Palette">
          <button
            v-for="p in PALETTES"
            :key="p.name"
            type="button"
            role="radio"
            class="dock-opt focus-ring"
            :aria-checked="p.name === palette"
            @click="setPalette(p.name)"
          >
            <span
              class="dock-dot dock-dot-lg"
              :style="{ background: pie(p.swatch) }"
              aria-hidden="true"
            />
            <span class="dock-opt-name">{{ p.label }}</span>
          </button>
        </div>
      </BasePopover>

      <BaseSeparator orientation="vertical" spacing="none" class="dock-sep" />

      <button
        type="button"
        class="dock-btn dock-mode focus-ring"
        :aria-label="`Switch to ${NEXT}`"
        :title="`Mode: ${theme}`"
        @click="cycle"
      >
        <Sun v-if="theme === 'light'" class="size-4" aria-hidden="true" />
        <Moon v-else-if="theme === 'dark'" class="size-4" aria-hidden="true" />
        <Monitor v-else class="size-4" aria-hidden="true" />
      </button>
    </BaseToolbar>
  </div>
</template>

<style scoped>
.dock-wrap {
  position: fixed;
  left: 50%;
  translate: -50% 0;
  bottom: max(16px, calc(env(safe-area-inset-bottom) + 12px));
  z-index: 45;
  view-transition-name: site-dock;
}
.dock {
  display: flex;
  height: 48px;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: var(--radius-shell, var(--radius-card));
  box-shadow: var(--shadow-overlay);
}
.dock-menu {
  position: relative;
}
.dock-btn {
  display: inline-flex;
  height: 36px;
  min-width: 36px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-control);
  padding: 0 10px;
  font-size: var(--site-text-sm);
  color: var(--color-ink);
  transition: background-color var(--site-dur-1) var(--site-ease-out);
}
.dock-btn:hover {
  background: color-mix(in oklab, var(--color-ink) 7%, transparent);
}
.dock-label {
  font-size: var(--site-text-xs);
}
.dock-sep {
  height: 20px;
}
.dock-dot {
  width: 16px;
  height: 16px;
  flex: none;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-ink) 15%, transparent);
}
.dock-dot-lg {
  width: 32px;
  height: 32px;
}
.dock-panel {
  position: absolute;
  inset-inline-start: 0;
  bottom: calc(100% + 12px);
  min-width: 11rem;
  border-radius: var(--radius-card);
  padding: 4px;
  box-shadow: var(--shadow-overlay);
}
.dock-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  border-radius: var(--radius-control);
  padding: 8px 10px;
  font-size: var(--site-text-sm);
  text-align: start;
}
.dock-item:hover {
  background: color-mix(in oklab, var(--color-ink) 7%, transparent);
}
.dock-check {
  margin-inline-start: auto;
  color: var(--color-primary);
}
.dock-swatch {
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: var(--radius-cell, 4px);
  border: 1px solid var(--color-ink);
}
.dock-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 4px;
  width: min(20rem, calc(100vw - 4rem));
  padding: 4px;
}
.dock-opt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border-radius: var(--radius-control);
  padding: 4px 0;
}
.dock-opt[aria-checked='true'] .dock-dot {
  box-shadow:
    0 0 0 2px var(--color-surface),
    0 0 0 4px var(--color-primary);
}
.dock-opt-name {
  font-size: 11px;
  color: var(--color-ink-soft);
}
.dock-opt[aria-checked='true'] .dock-opt-name {
  color: var(--color-ink);
  font-weight: 600;
}
@media (max-width: 30rem) {
  .dock-palette-name {
    display: none;
  }
}
</style>
