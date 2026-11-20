<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'

import {
  MATERIALS,
  PALETTES,
  applyMaterial,
  applyPalette,
  useMaterial,
  usePalette,
} from '../src/index'
import SampleScreen from './SampleScreen.vue'
import { seam } from './seam'

/**
 * 4 materials x 10 palettes = 40 looks, 80 with dark. A matrix of tiles, each
 * wearing its own look. Hover or focus previews on the sample only; Enter,
 * Space or click keeps it for the site, through the Seam.
 */
const material = useMaterial()
const palette = usePalette()

const preview = ref<{ m: string; p: string } | null>(null)
const shown = computed(() => preview.value ?? { m: material.value, p: palette.value })

const at = ref({ r: Math.max(0, MATERIALS.indexOf(material.value)), c: 0 })
const grid = useTemplateRef<HTMLElement>('grid')

function keep(m: (typeof MATERIALS)[number], p: string) {
  seam(() => {
    material.value = m
    palette.value = p
    applyMaterial(m)
    applyPalette(p)
  })
}

async function focusAt(r: number, c: number) {
  at.value = { r, c }
  await nextTick()
  grid.value?.querySelector<HTMLElement>(`[data-r="${r}"][data-c="${c}"]`)?.focus()
}

function onKey(event: KeyboardEvent, r: number, c: number) {
  const R = MATERIALS.length
  const C = PALETTES.length
  const rtl = getComputedStyle(event.currentTarget as Element).direction === 'rtl'
  let nr = r
  let nc = c
  switch (event.key) {
    case 'ArrowRight':
      nc = Math.min(C - 1, Math.max(0, c + (rtl ? -1 : 1)))
      break
    case 'ArrowLeft':
      nc = Math.min(C - 1, Math.max(0, c + (rtl ? 1 : -1)))
      break
    case 'ArrowDown':
      nr = Math.min(R - 1, r + 1)
      break
    case 'ArrowUp':
      nr = Math.max(0, r - 1)
      break
    case 'Home':
      nc = 0
      break
    case 'End':
      nc = C - 1
      break
    default:
      return
  }
  event.preventDefault()
  void focusAt(nr, nc)
}
</script>

<template>
  <section id="looks" class="looks site-page site-section" aria-labelledby="looks-h">
    <p class="site-eyebrow">The three axes</p>
    <h2 id="looks-h" class="site-h2">4 materials × 10 palettes × light and dark.</h2>
    <p class="site-lead looks-sub">Same markup. Pick a tile to preview, press Enter to keep it.</p>

    <div class="looks-grid">
      <div
        class="looks-sample canvas"
        :data-material="shown.m"
        :data-palette="shown.p"
        aria-live="off"
      >
        <SampleScreen />
      </div>

      <div class="looks-matrix-wrap" role="region" aria-label="Looks matrix" tabindex="-1">
        <div ref="grid" class="looks-matrix" role="group" aria-label="Material and palette">
          <span />
          <span v-for="p in PALETTES" :key="p.name" class="looks-col" :title="p.label">
            <i
              :style="{
                background: `conic-gradient(from -45deg, ${p.swatch[0]} 0 25%, ${p.swatch[1]} 0 50%, ${p.swatch[2]} 0 75%, ${p.swatch[3]} 0)`,
              }"
            />
            <span class="sr-only">{{ p.label }}</span>
          </span>
          <template v-for="(m, r) in MATERIALS" :key="m">
            <span class="looks-row site-mono">{{ m }}</span>
            <span
              v-for="(p, c) in PALETTES"
              :key="p.name"
              class="looks-tile-wrap"
              :data-material="m"
              :data-palette="p.name"
            >
              <button
                type="button"
                class="looks-tile focus-ring"
                :data-r="r"
                :data-c="c"
                :aria-label="`${m}, ${p.name}`"
                :aria-pressed="material === m && palette === p.name"
                :tabindex="at.r === r && at.c === c ? 0 : -1"
                @mouseenter="preview = { m, p: p.name }"
                @mouseleave="preview = null"
                @focus="((preview = { m, p: p.name }), (at = { r, c }))"
                @blur="preview = null"
                @keydown="onKey($event, r, c)"
                @click="keep(m, p.name)"
              />
            </span>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.looks-sub {
  margin-top: 12px;
}
.looks-grid {
  display: grid;
  gap: 32px;
  margin-top: 32px;
}
@media (min-width: 64rem) {
  .looks-grid {
    grid-template-columns: 5fr 7fr;
    align-items: center;
    gap: 48px;
  }
}
.looks-sample {
  display: flex;
  justify-content: center;
  padding: 32px 16px;
  border: 1px solid var(--color-hair);
  border-radius: var(--radius-card);
  color: var(--color-ink);
}
.looks-matrix-wrap {
  overflow-x: auto;
  padding: 8px 4px;
}
.looks-matrix {
  display: grid;
  grid-template-columns: 4.5rem repeat(10, 36px);
  gap: 8px;
  align-items: center;
  width: max-content;
}
.looks-col {
  display: grid;
  place-items: center;
}
.looks-col i {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-ink) 15%, transparent);
}
.looks-row {
  font-size: var(--site-text-xs);
  color: var(--color-ink-soft);
}
.looks-tile-wrap {
  display: block;
}
.looks-tile {
  display: block;
  width: 36px;
  height: 36px;
  cursor: pointer;
  border: var(--surface-border-width, 1px) solid var(--surface-border-color, var(--color-hair));
  border-radius: var(--radius-control);
  background: linear-gradient(135deg, var(--color-canvas) 50%, var(--color-primary) 50%);
  box-shadow: var(--shadow-control, none);
  transition: scale var(--site-dur-1) var(--site-ease-out);
}
.looks-tile:hover {
  scale: 1.1;
}
.looks-tile[aria-pressed='true'] {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
</style>
