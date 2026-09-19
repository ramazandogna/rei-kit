<script setup lang="ts">
import { NEUTRAL } from './tones'
import { ref } from 'vue'

import {
  BaseBadge,
  BaseButton,
  BaseSwitch,
  MATERIALS,
  PALETTES,
  ProgressBar,
  SectionHeading,
  StatCard,
  useMaterial,
  usePalette,
} from '../src/index'
import type { Material } from '../src/index'

/**
 * The three axes, each shown in isolation.
 *
 * Every material tile sets its own `data-material`, so the four sit side by
 * side whatever the page is set to — the same attribute an app sets once on
 * `<html>`. Every palette tile does the same with `data-palette`. Choosing one
 * applies it to the whole page, which is the real demonstration.
 */
const material = useMaterial()
const palette = usePalette()
const on = ref(true)

const MATERIAL_COPY: Record<Material, { title: string; body: string; tag: string }> = {
  quiet: {
    title: 'Quiet',
    tag: 'minimalism',
    body: 'Hairline edges, tinted fills, depth you barely notice. The default, and the one that gets out of the way.',
  },
  glass: {
    title: 'Glass',
    tag: 'glassmorphism',
    body: 'Frosted surfaces lit along the rim, over a page with colour to see through — the spatial look. Falls back to solid for readers who ask for less transparency.',
  },
  brutal: {
    title: 'Brutal',
    tag: 'neo-brutalism',
    body: 'Two-pixel ink borders, hard offset shadows, square corners. Buttons press into their own shadow.',
  },
  soft: {
    title: 'Soft',
    tag: 'claymorphism',
    body: 'Rounded and raised, lit from above, with a little spring — neumorphism that keeps a real edge, so depth is never the only boundary.',
  },
}

const pie = (swatch: readonly string[]) =>
  `conic-gradient(from -45deg, ${swatch[0]} 0 25%, ${swatch[1]} 0 50%, ${swatch[2]} 0 75%, ${swatch[3]} 0)`
</script>

<template>
  <section id="axes" class="axes">
    <div class="axes-intro">
      <SectionHeading :tone="NEUTRAL" label="Three axes" />
      <h2 class="axes-title">Change how it looks without touching a component.</h2>
      <p class="axes-lead">
        Colour, material and motion are separate. A palette redefines the eleven colour roles; a
        material redefines what a surface is made of; motion lives in tokens both of them can tune.
        Components read the tokens and never ask which is active.
      </p>
    </div>

    <!-- ─────────────────────────── Materials ─────────────────────────── -->
    <h3 class="axes-sub">Materials</h3>
    <div class="axes-materials">
      <button
        v-for="m in MATERIALS"
        :key="m"
        type="button"
        class="tile canvas"
        :class="{ 'is-active': material === m }"
        :data-material="m"
        :aria-pressed="material === m"
        @click="material = m"
      >
        <span class="tile-card surface">
          <span class="tile-head">
            <span class="text-ink text-base font-semibold">{{ MATERIAL_COPY[m].title }}</span>
            <BaseBadge :tone="material === m ? 'primary' : 'neutral'">
              {{ material === m ? 'active' : MATERIAL_COPY[m].tag }}
            </BaseBadge>
          </span>
          <span class="text-ink-soft block text-left text-xs leading-relaxed">
            {{ MATERIAL_COPY[m].body }}
          </span>
          <span class="tile-controls">
            <span
              class="bg-primary text-on-primary rounded-card px-3 py-1.5 text-xs font-medium shadow-(--shadow-control)"
            >
              Primary
            </span>
            <span class="control text-ink rounded-card px-3 py-1.5 text-xs font-medium"
              >Secondary</span
            >
          </span>
        </span>
      </button>
    </div>

    <!-- ─────────────────────────── Palettes ─────────────────────────── -->
    <h3 class="axes-sub">Palettes</h3>
    <p class="axes-note">
      Seven well-known open palettes by their official values, and three of the kit's own. The
      on-colour for every filled role is chosen by measurement, and every text pairing in both modes
      clears WCAG AA — a palette that fails one does not ship.
    </p>
    <div class="axes-palettes">
      <button
        v-for="p in PALETTES"
        :key="p.name"
        type="button"
        class="pal"
        :class="{ 'is-active': palette === p.name }"
        :data-palette="p.name"
        :aria-pressed="palette === p.name"
        @click="palette = p.name"
      >
        <span class="pal-inner surface">
          <span class="pal-swatch" :style="{ background: pie(p.swatch) }" aria-hidden="true" />
          <span class="min-w-0 text-left">
            <span class="text-ink block truncate text-sm font-semibold">{{ p.label }}</span>
            <span class="text-ink-soft block truncate text-[0.6875rem]">{{ p.origin }}</span>
          </span>
          <span class="pal-strip" aria-hidden="true">
            <span class="bg-primary" />
            <span class="bg-accent" />
            <span class="bg-positive" />
            <span class="bg-warning" />
            <span class="bg-negative" />
          </span>
        </span>
      </button>
    </div>

    <!-- ─────────────────────────── Live ─────────────────────────── -->
    <h3 class="axes-sub">All three, live</h3>
    <div class="axes-live">
      <div class="surface-raised rounded-card flex flex-col gap-4 p-5">
        <div class="grid grid-cols-2 gap-3">
          <StatCard value="92%" label="On time" trend="up" />
          <StatCard value="4" label="Overdue" trend="down" />
        </div>
        <ProgressBar :value="23" :max="28" label="Progress" />
        <BaseSwitch v-model="on" label="Notifications" hint="The switch is the commit" />
        <div class="flex flex-wrap gap-2">
          <BaseButton size="sm">Primary</BaseButton>
          <BaseButton size="sm" variant="secondary">Secondary</BaseButton>
          <BaseButton size="sm" variant="accent">Accent</BaseButton>
          <BaseButton size="sm" variant="danger">Delete</BaseButton>
        </div>
      </div>

      <div class="axes-code">
        <pre
          class="surface rounded-card"
        ><code><span class="c">/* main.css — the whole kit, all four materials and ten palettes */</span>
@import 'tailwindcss';
@import 'rei-kit/mobile.css';</code></pre>
        <pre class="surface rounded-card"><code><span class="c">&lt;!-- pick once… --&gt;</span>
&lt;html data-material="<b>{{ material }}</b>"
      data-palette="<b>{{ palette }}</b>"&gt;</code></pre>
        <pre class="surface rounded-card"><code><span class="c">// …or let people choose</span>
const material = useMaterial()
material.value = '<b>{{ material }}</b>'</code></pre>
      </div>
    </div>
  </section>
</template>

<style scoped>
.axes {
  padding-top: 4rem;
}

.axes-intro {
  max-width: 44rem;
}

.axes-title {
  margin-top: 1rem;
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--color-ink);
}

.axes-lead,
.axes-note {
  margin-top: 1rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-ink-soft);
}

.axes-note {
  max-width: 46rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.axes-sub {
  margin-top: 3rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

.axes-materials {
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr));
}

/* Each tile is its own little page: the `canvas` utility gives glass its
   colour to blur, set by the tile's own material rather than the page's. */
.tile {
  display: block;
  border-radius: calc(var(--radius-card) + 10px);
  padding: 1.25rem;
  outline-offset: 3px;
  background-attachment: scroll;
  transition: transform var(--duration-base) var(--ease-standard);
}

.tile:hover {
  transform: translateY(-2px);
}

.tile:focus-visible {
  outline: 2px solid var(--color-primary);
}

.tile.is-active {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.tile-card {
  display: flex;
  min-height: 11.5rem;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: var(--radius-card);
  padding: 1rem;
}

.tile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.tile-controls {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
}

.axes-palettes {
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(min(13rem, 100%), 1fr));
}

/* Each palette card carries its own `data-palette`, so its colours are the
   palette's own even while the page is in another. */
.pal {
  display: block;
  border-radius: var(--radius-card);
  background: var(--color-canvas);
  padding: 0.375rem;
  transition: transform var(--duration-base) var(--ease-standard);
}

.pal:hover {
  transform: translateY(-2px);
}

.pal:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.pal.is-active {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.pal-inner {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.25rem 0.75rem;
  border-radius: calc(var(--radius-card) - 4px);
  padding: 0.75rem;
}

.pal-swatch {
  grid-row: span 2;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-ink) 10%, transparent);
  transition: transform var(--duration-slow) var(--ease-standard);
}

.pal:hover .pal-swatch {
  transform: rotate(90deg);
}

.pal-strip {
  grid-column: 2;
  display: flex;
  gap: 3px;
}

.pal-strip span {
  height: 0.375rem;
  flex: 1;
  border-radius: 9999px;
}

.axes-live {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

@media (min-width: 56rem) {
  .axes-live {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}

.axes-code {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.axes-code pre {
  overflow-x: auto;
  padding: 1rem 1.125rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-ink);
}

.axes-code .c {
  color: var(--color-ink-soft);
}

.axes-code b {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
