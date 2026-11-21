<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { BaseBadge, BaseButton, BaseInput, EmptyState } from '../../src/index'
import { CATEGORIES, ENTRIES, ENTRY_LABEL, plain } from '../catalog'
import { ART_SPRITE, NEW, artFor } from '../catalog-art'

/**
 * Every component as a lightweight card: name, one-line summary, entry. No
 * live previews: a hundred and twenty demos at once is the page this route
 * replaced, and the Stage on each component page is where they live.
 */
const query = ref('')
/* A category is a filter, not an anchor: on a phone, scrolling past seven
   groups to reach the one you tapped is the problem, and a `#id` link is a
   route change under hash routing. */
const active = ref<string | null>(null)
const top = ref<HTMLElement | null>(null)
function choose(category: string | null) {
  active.value = active.value === category ? null : category
  top.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

const found = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return ENTRIES
  return ENTRIES.filter(
    (e) => e.name.toLowerCase().includes(needle) || e.summary.toLowerCase().includes(needle),
  )
})

const all = computed(() =>
  [...CATEGORIES, 'More']
    .map((category) => ({
      category,
      id: `cat-${category.toLowerCase().replaceAll(' ', '-')}`,
      items: found.value.filter((e) => e.category === category),
    }))
    .filter((g) => g.items.length > 0),
)
const groups = computed(() =>
  active.value ? all.value.filter((g) => g.category === active.value) : all.value,
)
/* Re-keying the list on the filter replays the entrance cascade. */
const filterKey = computed(() => `${active.value ?? '*'}|${query.value.trim().toLowerCase()}`)
const shown = computed(() => groups.value.reduce((n, g) => n + g.items.length, 0))

/* The clicked card's name takes the view-transition name the component page's
   heading carries, so the title morphs between the two. */
function morph(event: MouseEvent) {
  const el = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('[data-name]')
  if (el) el.style.viewTransitionName = 'page-title'
}
</script>

<template>
  <div class="site-page cat">
    <header class="cat-head">
      <div class="cat-title">
        <h1 class="site-h1">Components</h1>
        <BaseBadge tone="primary">{{ ENTRIES.length }}</BaseBadge>
      </div>
      <p class="cat-sub">
        {{ ENTRIES.length }} accessible Vue parts across {{ CATEGORIES.length }} categories, each
        restyled by your palette and material. Pick one to see it live.
      </p>
      <div class="cat-filter">
        <BaseInput
          v-model="query"
          type="search"
          label="Filter components"
          placeholder="combobox, date, table…"
        />
      </div>
    </header>

    <div ref="top" class="cat-bar">
      <div class="cat-chips" role="group" aria-label="Filter by category">
        <button
          type="button"
          class="cat-chip focus-ring"
          :aria-pressed="active === null"
          @click="choose(null)"
        >
          All <span class="site-mono">{{ found.length }}</span>
        </button>
        <button
          v-for="g in all"
          :key="g.id"
          type="button"
          class="cat-chip focus-ring"
          :aria-pressed="active === g.category"
          @click="choose(g.category)"
        >
          {{ g.category }} <span class="site-mono">{{ g.items.length }}</span>
        </button>
      </div>
      <p class="sr-only" aria-live="polite">{{ shown }} components shown</p>
    </div>

    <EmptyState
      v-if="groups.length === 0"
      title="No component matches"
      :description="`Nothing is called or described as “${query}”.`"
    >
      <template #action>
        <BaseButton variant="secondary" @click="((query = ''), (active = null))">
          Clear filter
        </BaseButton>
      </template>
    </EmptyState>

    <!-- eslint-disable-next-line vue/no-v-html -- a static, build-time sprite -->
    <svg class="cat-sprite" aria-hidden="true" v-html="ART_SPRITE" />
    <div :key="filterKey">
      <section
        v-for="g in groups"
        :id="g.id"
        :key="g.id"
        class="cat-group"
        :aria-labelledby="`${g.id}-h`"
      >
        <h2 :id="`${g.id}-h`" class="site-h3">
          {{ g.category }} <span class="cat-count site-mono">{{ g.items.length }}</span>
        </h2>
        <ul class="cat-grid">
          <li
            v-for="(e, i) in g.items"
            :key="e.name"
            class="cat-item"
            :style="{ '--i': Math.min(i, 17) }"
          >
            <RouterLink :to="`/c/${e.name}`" class="cat-card focus-ring" @click="morph">
              <svg class="cat-art" aria-hidden="true">
                <use :href="`#${artFor(e.name, e.category)}`" />
              </svg>
              <span class="cat-name site-mono" data-name>{{ e.name }}</span>
              <span class="cat-sum">{{ plain(e.summary) }}</span>
              <span class="cat-meta">
                <span class="cat-tag site-mono">{{ ENTRY_LABEL[e.entry] ?? e.entry }}</span>
                <span v-if="NEW.has(e.name)" class="cat-tag cat-new">New</span>
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cat {
  padding-top: 32px;
}
.cat-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 8px;
}
.cat-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cat-filter {
  max-width: 28rem;
}
.cat-bar {
  position: sticky;
  top: 56px;
  z-index: 5;
  margin: 0 -16px;
  padding: 10px 16px;
  scroll-margin-top: 56px;
  background: color-mix(in oklab, var(--color-canvas) 88%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.cat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
@media (max-width: 39.99rem) {
  /* One swipeable row instead of four wrapped lines of chips. */
  .cat-chips {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    scroll-snap-type: x proximity;
  }
  .cat-chip {
    flex: none;
    scroll-snap-align: start;
  }
}
.cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  border: 1px solid var(--color-hair);
  border-radius: 9999px;
  padding: 4px 14px;
  font-size: var(--site-text-xs);
  color: var(--color-ink-soft);
  background: var(--color-surface);
  transition:
    background-color var(--site-dur-1) var(--site-ease-out),
    color var(--site-dur-1) var(--site-ease-out);
}
.cat-chip .site-mono {
  opacity: 0.6;
}
.cat-chip[aria-pressed='true'] {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}
.cat-chip:hover {
  color: var(--color-ink);
  border-color: var(--color-primary);
}
.cat-group {
  margin-top: 32px;
  scroll-margin-top: 72px;
}
.cat-count {
  font-size: var(--site-text-xs);
  font-weight: 400;
  color: var(--color-ink-soft);
  margin-inline-start: 8px;
}
.cat-sub {
  max-width: 40rem;
  margin: 0;
  color: var(--color-ink-soft);
  font-size: var(--site-text-sm);
}
.cat-sprite {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
.cat-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 16px;
}
@media (min-width: 40rem) {
  .cat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 60rem) {
  .cat-grid {
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  }
}
.cat-item {
  animation: cat-in 280ms var(--site-ease-out) both;
  animation-delay: calc(var(--i) * 25ms);
}
@keyframes cat-in {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .cat-item {
    animation: none;
  }
}
.cat-card {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 6px;
  padding: 10px 10px 14px;
  border: var(--surface-border-width, 1px) solid var(--color-hair);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  color: inherit;
  text-decoration: none;
  transition: transform var(--site-dur-2) var(--site-ease-out);
}
/* The glow is a pre-painted layer that only fades: opacity is all hover costs. */
.cat-card::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--color-primary) 55%, transparent),
    0 12px 32px -12px color-mix(in oklab, var(--color-primary) 45%, transparent);
  transition: opacity var(--site-dur-2) var(--site-ease-out);
}
.cat-card:hover {
  transform: translateY(-3px);
}
.cat-card:hover::after,
.cat-card:focus-visible::after {
  opacity: 1;
}
.cat-art {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 7;
  margin-bottom: 6px;
  border-radius: calc(var(--radius-card) * 0.7);
  background:
    radial-gradient(
      120% 90% at 0% 0%,
      color-mix(in oklab, var(--color-primary) 12%, transparent),
      transparent 60%
    ),
    radial-gradient(
      90% 90% at 100% 100%,
      color-mix(in oklab, var(--color-accent, var(--color-primary)) 10%, transparent),
      transparent 60%
    ),
    var(--color-canvas);
  transition: opacity var(--site-dur-2) var(--site-ease-out);
}
.cat-card:hover .cat-art {
  opacity: 0.92;
}
.cat-name,
.cat-sum,
.cat-meta {
  padding-inline: 6px;
}
.cat-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-ink);
}
.cat-sum {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: var(--site-text-sm);
  line-height: 1.45;
  color: var(--color-ink-soft);
}
.cat-meta {
  display: flex;
  gap: 6px;
  margin-top: auto;
  padding-top: 6px;
}
.cat-tag {
  border: 1px solid var(--color-hair);
  border-radius: 9999px;
  padding: 1px 8px;
  font-size: 11px;
  color: var(--color-ink-soft);
}
.cat-new {
  border-color: transparent;
  background: color-mix(in oklab, var(--color-primary) 14%, transparent);
  color: var(--color-primary);
  font-weight: 600;
}
</style>

<style scoped>
/* Phones: a compact row per component — drawing on the left, words on the
   right — so a category fits on a screen instead of one card per screen. */
@media (max-width: 39.99rem) {
  .cat-card {
    display: grid;
    grid-template-columns: 88px 1fr;
    grid-template-rows: auto auto auto;
    column-gap: 14px;
    row-gap: 4px;
    align-items: start;
    padding: 10px;
  }
  .cat-art {
    grid-row: 1 / span 3;
    width: 88px;
    height: 72px;
    aspect-ratio: auto;
    margin: 0;
  }
  .cat-sum {
    font-size: 0.8125rem;
  }
}
</style>
