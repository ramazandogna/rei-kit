<script setup lang="ts">
import { Check, ChevronDown, Moon, Sun, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

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

/* What is on screen right now, read from <html>: `system` is resolved by the
   kit, so the toggle flips what the reader actually sees. */
const isDark = ref(false)
const NEXT = computed<ThemePreference>(() => (isDark.value ? 'light' : 'dark'))
function readDark() {
  isDark.value = document.documentElement.classList.contains('dark')
}
let watcher: MutationObserver | undefined
onMounted(() => {
  readDark()
  watcher = new MutationObserver(readDark)
  watcher.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  window.addEventListener('scroll', onScroll, { passive: true })
})

/* Phones get a bottom sheet (opened from the tab bar's Look tab) instead of
   a floating toolbar that sits on top of whatever the reader is looking at. */
const sheetOpen = defineModel<boolean>('sheet', { default: false })

/* Desktop: the dock steps out of the way while reading down the page and
   returns the moment the reader scrolls up. */
const tucked = ref(false)
let lastY = 0
function onScroll() {
  const y = window.scrollY
  const dy = y - lastY
  if (Math.abs(dy) < 6) return
  tucked.value = dy > 0 && y > 160 && !menuOpen.value
  lastY = y
}
const MODES: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Auto' },
]
function setMode(next: ThemePreference) {
  seam(() => {
    theme.value = next
    applyTheme(next)
  })
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') sheetOpen.value = false
}
watch(sheetOpen, (open) => {
  if (typeof document === 'undefined') return
  if (open) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  watcher?.disconnect()
  if (typeof window !== 'undefined') window.removeEventListener('scroll', onScroll)
  if (typeof document !== 'undefined') document.removeEventListener('keydown', onKey)
})

function toggleMode(event: MouseEvent) {
  const next = NEXT.value
  const r = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const origin =
    event.detail === 0
      ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      : { x: event.clientX, y: event.clientY }
  seam(() => {
    theme.value = next
    applyTheme(next)
    readDark()
  }, origin)
}
</script>

<template>
  <div class="dock-wrap" :class="{ 'is-tucked': tucked }">
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
        :aria-label="`Switch to ${NEXT} mode`"
        :title="`Switch to ${NEXT} mode`"
        @click="toggleMode"
      >
        <Sun v-if="isDark" class="size-4" aria-hidden="true" />
        <Moon v-else class="size-4" aria-hidden="true" />
        <span class="dock-label">{{ isDark ? 'Dark' : 'Light' }}</span>
      </button>
    </BaseToolbar>

    <Transition name="dock-sheet">
      <div v-if="sheetOpen" class="dock-scrim" @click.self="sheetOpen = false">
        <section
          id="appearance-sheet"
          class="dock-sheet surface-overlay"
          role="dialog"
          aria-label="Appearance"
        >
          <header class="dock-sheet-head">
            <p class="dock-sheet-title">Appearance</p>
            <button
              type="button"
              class="dock-btn focus-ring"
              aria-label="Close"
              @click="sheetOpen = false"
            >
              <X class="size-4" aria-hidden="true" />
            </button>
          </header>

          <p class="dock-sheet-label">Material</p>
          <div class="dock-seg" role="radiogroup" aria-label="Material">
            <button
              v-for="m in MATERIALS"
              :key="m"
              type="button"
              role="radio"
              class="dock-seg-btn site-mono focus-ring"
              :aria-checked="m === material"
              @click="setMaterial(m)"
            >
              {{ m }}
            </button>
          </div>

          <p class="dock-sheet-label">Palette</p>
          <div class="dock-grid dock-grid-sheet" role="radiogroup" aria-label="Palette">
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

          <p class="dock-sheet-label">Mode</p>
          <div class="dock-seg" role="radiogroup" aria-label="Mode">
            <button
              v-for="m in MODES"
              :key="m.value"
              type="button"
              role="radio"
              class="dock-seg-btn focus-ring"
              :aria-checked="m.value === theme"
              @click="setMode(m.value)"
            >
              {{ m.label }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dock-wrap {
  position: fixed;
  left: 50%;
  translate: -50% 0;
  bottom: max(16px, calc(env(safe-area-inset-bottom) + 12px));
  z-index: 60;
  view-transition-name: site-dock;
}
.dock-wrap {
  transition:
    transform var(--site-dur-3) var(--site-ease-emph),
    opacity var(--site-dur-2) var(--site-ease-out);
}
.dock-wrap.is-tucked {
  transform: translateY(calc(100% + 32px));
  opacity: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .dock-wrap {
    transition: none;
  }
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
.dock-scrim {
  display: none;
}
@media (max-width: 39.99rem) {
  .dock-wrap {
    inset: 0;
    translate: none;
    pointer-events: none;
    view-transition-name: none;
  }
  .dock-scrim {
    pointer-events: auto;
  }
  .dock {
    display: none;
  }
  .dock-scrim {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: flex-end;
    background: color-mix(in oklab, var(--color-ink) 28%, transparent);
  }
  .dock-sheet {
    width: 100%;
    max-height: 85dvh;
    overflow: auto;
    border-radius: var(--radius-shell, 24px) var(--radius-shell, 24px) 0 0;
    padding: 12px 20px calc(20px + env(safe-area-inset-bottom));
    box-shadow: var(--shadow-overlay);
  }
  .dock-grid-sheet {
    width: 100%;
  }
}
.dock-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.dock-sheet-title {
  font-weight: 600;
}
.dock-sheet-label {
  margin: 16px 0 8px;
  font-size: var(--site-text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}
.dock-seg {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 4px;
  padding: 4px;
  border-radius: var(--radius-control);
  background: color-mix(in oklab, var(--color-ink) 6%, transparent);
}
.dock-seg-btn {
  min-height: 40px;
  border-radius: var(--radius-control);
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
}
.dock-seg-btn[aria-checked='true'] {
  background: var(--color-surface);
  color: var(--color-ink);
  font-weight: 600;
  box-shadow: var(--shadow-control);
}
.dock-sheet-enter-active,
.dock-sheet-leave-active {
  transition: opacity var(--site-dur-2) var(--site-ease-out);
}
.dock-sheet-enter-active .dock-sheet,
.dock-sheet-leave-active .dock-sheet {
  transition: translate var(--site-dur-3) var(--site-ease-emph);
}
.dock-sheet-enter-from,
.dock-sheet-leave-to {
  opacity: 0;
}
.dock-sheet-enter-from .dock-sheet,
.dock-sheet-leave-to .dock-sheet {
  translate: 0 100%;
}
@media (prefers-reduced-motion: reduce) {
  .dock-sheet-enter-active .dock-sheet,
  .dock-sheet-leave-active .dock-sheet {
    transition: none;
  }
}
</style>
