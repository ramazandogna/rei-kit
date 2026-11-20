<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { BaseBadge, BaseButton, BaseCard, BaseInput, EmptyState } from '../../src/index'
import { CATEGORIES, ENTRIES, ENTRY_LABEL, plain } from '../catalog'

/**
 * Every component as a lightweight card: name, one-line summary, entry. No
 * live previews: a hundred and twenty demos at once is the page this route
 * replaced, and the Stage on each component page is where they live.
 */
const query = ref('')

const found = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return ENTRIES
  return ENTRIES.filter(
    (e) => e.name.toLowerCase().includes(needle) || e.summary.toLowerCase().includes(needle),
  )
})

const groups = computed(() =>
  [...CATEGORIES, 'More']
    .map((category) => ({
      category,
      id: `cat-${category.toLowerCase().replaceAll(' ', '-')}`,
      items: found.value.filter((e) => e.category === category),
    }))
    .filter((g) => g.items.length > 0),
)

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
      <div class="cat-filter">
        <BaseInput
          v-model="query"
          type="search"
          label="Filter components"
          placeholder="combobox, date, table…"
        />
      </div>
      <nav class="cat-chips" aria-label="Categories">
        <a v-for="g in groups" :key="g.id" :href="`#${g.id}`" class="cat-chip focus-ring">{{
          g.category
        }}</a>
      </nav>
    </header>

    <EmptyState
      v-if="groups.length === 0"
      title="No component matches"
      :description="`Nothing is called or described as “${query}”.`"
    >
      <template #action>
        <BaseButton variant="secondary" @click="query = ''">Clear filter</BaseButton>
      </template>
    </EmptyState>

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
        <li v-for="e in g.items" :key="e.name">
          <RouterLink :to="`/c/${e.name}`" class="cat-card-link" @click="morph">
            <BaseCard interactive as="span" class="cat-card">
              <span class="cat-name site-mono" data-name>{{ e.name }}</span>
              <span class="cat-sum">{{ plain(e.summary) }}</span>
              <BaseBadge class="cat-badge">{{ ENTRY_LABEL[e.entry] ?? e.entry }}</BaseBadge>
            </BaseCard>
          </RouterLink>
        </li>
      </ul>
    </section>
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
  margin-bottom: 32px;
}
.cat-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cat-filter {
  max-width: 28rem;
}
.cat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cat-chip {
  border: 1px solid var(--color-hair);
  border-radius: var(--radius-control);
  padding: 4px 12px;
  font-size: var(--site-text-xs);
  color: var(--color-ink-soft);
}
.cat-chip:hover {
  color: var(--color-ink);
  border-color: var(--color-primary);
}
.cat-group {
  margin-top: 48px;
  scroll-margin-top: 72px;
}
.cat-count {
  font-size: var(--site-text-xs);
  font-weight: 400;
  color: var(--color-ink-soft);
  margin-inline-start: 8px;
}
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.cat-card-link {
  display: block;
  height: 100%;
  border-radius: var(--radius-card);
}
.cat-card {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}
.cat-name {
  font-size: 16px;
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
  color: var(--color-ink-soft);
}
.cat-badge {
  margin-top: auto;
}
</style>
