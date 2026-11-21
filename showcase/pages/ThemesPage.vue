<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  BaseSwitch,
  BaseTable,
  MATERIALS,
  PALETTES,
  SegmentedControl,
  applyMaterial,
  applyPalette,
  applyTheme,
  useMaterial,
  usePalette,
  useTheme,
} from '../../src/index'
import type { Material, ThemePreference } from '../../src/index'
import CodeBlock from '../CodeBlock.vue'
import SampleScreen from '../SampleScreen.vue'
import { seam } from '../seam'

/**
 * The three axes as an explorer. Every choice applies to the whole site at
 * once, through the Seam like every other appearance change, so the page you
 * are looking at is the preview.
 */
const siteMaterial = useMaterial()
const sitePalette = usePalette()
const siteTheme = useTheme()
const rtl = ref(false)

const material = computed<Material>({
  get: () => siteMaterial.value,
  set: (next) =>
    seam(() => {
      siteMaterial.value = next
      applyMaterial(next)
    }),
})
const palette = computed<string>({
  get: () => sitePalette.value,
  set: (next) =>
    seam(() => {
      sitePalette.value = next
      applyPalette(next)
    }),
})
const mode = computed<ThemePreference>({
  get: () => siteTheme.value,
  set: (next) =>
    seam(() => {
      siteTheme.value = next
      applyTheme(next)
    }),
})

const dark = computed(() => mode.value === 'dark')

const materials = MATERIALS.map((m) => ({ value: m, label: m }))
const modes: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const html = computed(
  () =>
    `<html data-material="${material.value}" data-palette="${palette.value}"${dark.value ? ' class="dark"' : ''}>`,
)
const css = `@import 'rei-kit/tokens.css';
@import 'rei-kit/materials.css';
@import 'rei-kit/palettes.css';`
const js = computed(
  () =>
    `applyMaterial('${material.value}')\napplyPalette('${palette.value}')\napplyTheme('${mode.value}')`,
)

const rows = PALETTES.map((p) => ({
  name: p.label,
  origin: p.origin,
  key: p.name,
  light: '',
  dark: '',
}))
const cols = [
  { key: 'name', label: 'Palette' },
  { key: 'origin', label: 'Origin' },
  { key: 'light', label: 'Light roles' },
  { key: 'dark', label: 'Dark roles' },
] as const
const ROLES = [
  'primary',
  'accent',
  'positive',
  'negative',
  'warning',
  'canvas',
  'surface',
  'muted',
  'ink',
  'inkSoft',
  'hair',
] as const
const pie = (swatch: readonly string[]) =>
  `conic-gradient(from -45deg, ${swatch[0]} 0 25%, ${swatch[1]} 0 50%, ${swatch[2]} 0 75%, ${swatch[3]} 0)`
const byKey = (key: string) => PALETTES.find((p) => p.name === key)!
</script>

<template>
  <div class="site-page th">
    <h1 class="site-h1">Themes</h1>
    <p class="site-lead">Four materials, ten palettes, light and dark. Same markup.</p>

    <div class="th-grid">
      <div class="th-controls">
        <div class="th-field">
          <span class="th-label" id="th-m">Material</span>
          <SegmentedControl v-model="material" :options="materials" aria-labelledby="th-m" />
        </div>
        <div class="th-field">
          <span class="th-label">Palette</span>
          <div class="th-picker" role="radiogroup" aria-label="Palette">
            <button
              v-for="p in PALETTES"
              :key="p.name"
              type="button"
              role="radio"
              class="th-opt focus-ring"
              :aria-checked="p.name === palette"
              @click="palette = p.name"
            >
              <span class="th-dot" :style="{ background: pie(p.swatch) }" aria-hidden="true" />
              <span>{{ p.label }}</span>
            </button>
          </div>
        </div>
        <div class="th-field">
          <span class="th-label" id="th-mode">Mode</span>
          <SegmentedControl v-model="mode" :options="modes" aria-labelledby="th-mode" />
        </div>
        <BaseSwitch v-model="rtl" label="Right to left" />
        <p class="th-note" role="status">Applies to the whole site as you choose.</p>
      </div>

      <div class="th-sample canvas" :dir="rtl ? 'rtl' : 'ltr'">
        <SampleScreen />
      </div>
    </div>

    <section class="th-sec" aria-labelledby="th-use">
      <h2 id="th-use" class="site-h2">Use it</h2>
      <div class="th-code">
        <CodeBlock :code="html" lang="html" />
        <CodeBlock :code="css" lang="css" />
        <CodeBlock :code="js" lang="ts" />
      </div>
    </section>

    <section class="th-sec" aria-labelledby="th-pal">
      <h2 id="th-pal" class="site-h2">Palettes</h2>
      <BaseTable caption="Palettes" caption-hidden row-key="key" :columns="cols" :rows="rows">
        <template #light="{ row }">
          <span class="th-sw">
            <i
              v-for="r in ROLES"
              :key="r"
              :style="{ background: byKey(row.key).light[r] }"
              :title="r"
            />
          </span>
        </template>
        <template #dark="{ row }">
          <span class="th-sw">
            <i
              v-for="r in ROLES"
              :key="r"
              :style="{ background: byKey(row.key).dark[r] }"
              :title="r"
            />
          </span>
        </template>
      </BaseTable>
    </section>
  </div>
</template>

<style scoped>
.th {
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.th > .site-lead {
  margin-top: -20px;
}
.th-grid {
  display: grid;
  gap: 24px;
}
@media (min-width: 64rem) {
  .th-grid {
    grid-template-columns: 4fr 8fr;
  }
}
.th-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
}
.th-field {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 8px;
}
.th-label {
  font-size: var(--site-text-xs);
  font-family: var(--site-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink-soft);
}
.th-picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 4px;
}
.th-opt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border-radius: var(--radius-control);
  padding: 4px 0;
  font-size: 11px;
  color: var(--color-ink-soft);
}
.th-opt[aria-checked='true'] {
  color: var(--color-ink);
  font-weight: 600;
}
.th-opt[aria-checked='true'] .th-dot {
  box-shadow:
    0 0 0 2px var(--color-canvas),
    0 0 0 4px var(--color-primary);
}
.th-dot {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
}
.th-note {
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
}
.th-sample {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24rem;
  padding: 32px 16px;
  border: 1px solid var(--color-hair);
  border-radius: var(--radius-card);
  color: var(--color-ink);
}
.th-sec {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 32px;
}
.th-code {
  display: grid;
  gap: 12px;
}
.th-sw {
  display: inline-flex;
  gap: 2px;
}
.th-sw i {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-ink) 18%, transparent);
}
</style>
