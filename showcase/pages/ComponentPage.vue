<script setup lang="ts">
import { applyHead, applyRouteHead } from '../head'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, watch } from 'vue'
import type { Component } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { BaseBadge, BaseCard, BaseKbd, CopyButton } from '../../src/index'
import { BaseBreadcrumb } from '../../src/web/index'
import { a11yFor } from '../a11y'
import { ENTRY_LABEL, REPO, entryByName, neighboursOf, plain, sourcePath } from '../catalog'
import examples from '../examples.generated.json'
import PartPitch from '../PartPitch.vue'
import PropTable from '../PropTable.vue'
import { siblingsOf } from '../siblings'
import StageFrame from '../StageFrame.vue'
import { BASICS_PARTS } from '../basics-parts'
import { DESK_PARTS } from '../desk-parts'
import { FORM_PARTS } from '../form-parts'
import { MOTION_PARTS } from '../motion-parts'
import { NAV_PARTS } from '../nav-parts'
import { OVERLAY_PARTS } from '../overlay-parts'
import NotFound from './NotFound.vue'

/**
 * One component: a head, the Stage, the API, accessibility notes, siblings
 * and neighbours. Everything is read from the generated JSON, the example
 * files and `a11y.ts`; the preview is the example file itself.
 */
const route = useRoute()
const loaders = import.meta.glob<{ default: Component }>('../examples/*.vue')

const name = computed(() => String(route.params['name']))
const entry = computed(() => entryByName(name.value))
const nb = computed(() => neighboursOf(name.value))
const prev = computed(() => nb.value.prev)
const next = computed(() => nb.value.next)
const nextLabel = computed(() =>
  nb.value.wraps
    ? 'Back to the start'
    : nb.value.nextCategory
      ? `Next category · ${next.value?.category ?? ''}`
      : 'Next',
)
const router = useRouter()

/* ← / → move through the catalog unless the arrows already mean something
   where focus is (a field, a toolbar, a tablist, a slider, a menu…). */
const OWN_ARROWS =
  'input,textarea,select,[contenteditable],[role=toolbar],[role=tablist],[role=slider],[role=menu],[role=menubar],[role=listbox],[role=tree],[role=radiogroup],[role=grid],[role=spinbutton],dialog,[aria-modal=true]'
function onKey(event: KeyboardEvent) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
    return
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  if ((event.target as Element | null)?.closest?.(OWN_ARROWS)) return
  const to = event.key === 'ArrowLeft' ? prev.value : next.value
  if (to) void router.push(`/c/${to.name}`)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const example = computed(() => {
  const load = loaders[`../examples/${name.value}.vue`]
  return load ? defineAsyncComponent(load) : undefined
})
const sample = computed(() => examples.find((e) => e.name === name.value))

/* The part lists carry a sentence on what each part is for; where one
   exists it is the better lead. */
const PARTS = [
  ...BASICS_PARTS,
  ...MOTION_PARTS,
  ...FORM_PARTS,
  ...OVERLAY_PARTS,
  ...NAV_PARTS,
  ...DESK_PARTS,
] as { label: string; pitch?: string }[]
const pitch = computed(() => PARTS.find((p) => p.label === name.value)?.pitch)

const importLine = computed(() =>
  entry.value ? `import { ${entry.value.name} } from '${entry.value.entry}'` : '',
)
const a11y = computed(() => a11yFor(name.value))
const siblings = computed(() => siblingsOf(name.value))
const crumbs = computed(() => [
  { label: 'Components', to: '/components' },
  { label: entry.value?.category ?? '' },
])

watch(
  entry,
  (e) => {
    if (!e) return applyRouteHead('404')
    applyHead({
      title: `${e.name} — Vue 3 component — rei-kit`,
      description: `${plain(e.summary)} Accessible, typed and themed for Tailwind CSS 4. Import from ${e.entry}.`,
      path: `c/${e.name}`,
    })
  },
  { immediate: true },
)
</script>

<template>
  <NotFound v-if="!entry" />

  <article v-else class="cpage site-page">
    <header class="cpage-head">
      <BaseBreadcrumb :items="crumbs" label="Breadcrumb" />
      <h1 class="site-h1 site-mono cpage-title">{{ entry.name }}</h1>
      <p class="site-lead">{{ plain(entry.summary) }}</p>
      <div class="cpage-meta">
        <div class="cpage-import surface">
          <code class="site-mono">{{ importLine }}</code>
          <CopyButton
            :text="importLine"
            copy-label="Copy import"
            copied-label="Copied"
            error-label="Could not copy"
          />
        </div>
        <BaseBadge tone="primary">{{ ENTRY_LABEL[entry.entry] ?? entry.entry }}</BaseBadge>
        <a
          class="cpage-source site-mono"
          :href="`${REPO}/blob/main/${sourcePath(entry)}`"
          target="_blank"
          rel="noopener"
          >Source</a
        >
      </div>
      <PartPitch v-if="pitch" class="cpage-pitch" :text="pitch" />
    </header>

    <StageFrame
      v-if="example && sample"
      :key="entry.name"
      :name="entry.name"
      :example="example"
      :code="sample.ts"
      :js="sample.js"
    />

    <nav class="cpage-pair" aria-label="Previous and next component">
      <RouterLink v-if="prev" :to="`/c/${prev.name}`" class="pair-link surface focus-ring">
        <ArrowLeft class="size-4" aria-hidden="true" />
        <span class="site-mono">{{ prev.name }}</span>
        <kbd class="pair-key" aria-hidden="true">←</kbd>
      </RouterLink>
      <span v-else />
      <RouterLink
        v-if="next"
        :to="`/c/${next.name}`"
        class="pair-link surface focus-ring is-next"
        :class="{ 'is-boundary': nb.nextCategory || nb.wraps }"
      >
        <kbd class="pair-key" aria-hidden="true">→</kbd>
        <span class="pair-text">
          <small v-if="nb.nextCategory || nb.wraps">{{ nextLabel }}</small>
          <span class="site-mono">{{ next.name }}</span>
        </span>
        <ArrowRight class="size-4" aria-hidden="true" />
      </RouterLink>
    </nav>

    <section class="cpage-sec" aria-labelledby="h-api">
      <h2 id="h-api" class="site-h3">API</h2>
      <PropTable :name="entry.name" open />

      <template v-if="entry.slots.length">
        <h3 class="cpage-sub">Slots</h3>
        <PropTable :name="entry.name" section="slots" open />
      </template>
      <template v-if="entry.emits.length">
        <h3 class="cpage-sub">Emits</h3>
        <PropTable :name="entry.name" section="emits" open />
      </template>
    </section>

    <section class="cpage-sec" aria-labelledby="h-a11y">
      <h2 id="h-a11y" class="site-h3">Accessibility</h2>
      <table v-if="a11y.keyboard" class="cpage-keys">
        <caption class="sr-only">
          Keyboard
        </caption>
        <tbody>
          <tr v-for="[keys, action] in a11y.keyboard" :key="action">
            <th scope="row">
              <BaseKbd v-for="k in keys" :key="k" :keys="[k]" class="cpage-kbd" />
            </th>
            <td>{{ action }}</td>
          </tr>
        </tbody>
      </table>
      <ul class="cpage-notes">
        <li v-for="n in a11y.notes" :key="n">{{ n }}</li>
      </ul>
    </section>

    <section v-if="siblings" class="cpage-sec" aria-labelledby="h-which">
      <h2 id="h-which" class="site-h3">Which one?</h2>
      <BaseCard>
        <ul class="cpage-which">
          <li v-for="s in siblings" :key="s.name">
            <RouterLink
              class="site-mono"
              :to="`/c/${s.name}`"
              :aria-current="s.name === entry.name ? 'page' : undefined"
              >{{ s.name }}</RouterLink
            >
            <span>{{ s.use }}</span>
          </li>
        </ul>
      </BaseCard>
    </section>

    <nav class="cpage-pn" aria-label="More components">
      <RouterLink v-if="prev" :to="`/c/${prev.name}`" class="cpage-pn-link surface">
        <ArrowLeft class="size-4" aria-hidden="true" />
        <span
          ><small>Previous</small><b class="site-mono">{{ prev.name }}</b></span
        >
      </RouterLink>
      <span v-else />
      <RouterLink
        v-if="next"
        :to="`/c/${next.name}`"
        class="cpage-pn-link surface is-next"
        :class="{ 'is-boundary': nb.nextCategory || nb.wraps }"
      >
        <span
          ><small>{{ nextLabel }}</small
          ><b class="site-mono">{{ next.name }}</b></span
        >
        <ArrowRight class="size-4" aria-hidden="true" />
      </RouterLink>
    </nav>
  </article>
</template>

<style scoped>
.cpage {
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}
.cpage-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cpage-title {
  view-transition-name: page-title;
  max-width: 100%;
  /* Long names (BaseCheckboxGroup, ResponsiveDialog) must never push the
     page sideways on a phone. */
  font-size: clamp(1.75rem, 8vw, var(--site-text-h1));
  overflow-wrap: anywhere;
}
.cpage-head :deep(nav) {
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}
.cpage-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.cpage-import {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 8px;
  border-radius: var(--radius-control);
  padding: 4px 4px 4px 12px;
  font-size: var(--site-text-sm);
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}
@media (max-width: 39.99rem) {
  .cpage {
    gap: 32px;
    padding-top: 16px;
  }
  .cpage-import {
    display: flex;
    width: 100%;
    font-size: var(--site-text-xs);
  }
  .cpage-import > :first-child {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .cpage-pn {
    grid-template-columns: 1fr;
  }
  .cpage-keys th,
  .cpage-keys td {
    padding-right: 10px;
  }
}
.cpage-source {
  font-size: var(--site-text-xs);
  color: var(--color-primary);
  text-decoration: underline;
}
.cpage-pitch {
  max-width: 60ch;
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
}
.cpage-sec {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cpage-sub {
  margin-top: 16px;
  font-weight: 600;
}
.cpage-keys {
  font-size: var(--site-text-sm);
  border-collapse: collapse;
}
.cpage-keys th,
.cpage-keys td {
  padding: 6px 16px 6px 0;
  text-align: start;
  vertical-align: top;
}
.cpage-keys th {
  display: flex;
  gap: 4px;
  font-weight: 400;
}
.cpage-notes {
  list-style: disc;
  padding-inline-start: 20px;
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
  max-width: 70ch;
}
.cpage-which {
  display: grid;
  gap: 12px;
  font-size: var(--site-text-sm);
}
.cpage-which li {
  display: grid;
  gap: 2px;
}
@media (min-width: 40rem) {
  .cpage-which li {
    grid-template-columns: 12rem 1fr;
    gap: 16px;
  }
}
.cpage-which a {
  color: var(--color-primary);
  text-decoration: underline;
}
.cpage-which span {
  color: var(--color-ink-soft);
}
.cpage-pn {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.cpage-pn-link {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: var(--radius-card);
  padding: 16px;
}
.cpage-pn-link.is-next {
  justify-content: flex-end;
  text-align: end;
}
.cpage-pn-link small {
  display: block;
  font-size: var(--site-text-xs);
  color: var(--color-ink-soft);
}
.cpage-pn-link.is-boundary,
.pair-link.is-boundary {
  border: 2px solid var(--color-primary);
}
.cpage-pn-link.is-boundary small,
.pair-link.is-boundary small {
  color: var(--color-primary);
  font-weight: 600;
}
.cpage-pair {
  /* Pulled up under the stage; the page gap is 48px, a pair belongs to it. */
  margin-top: -28px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.pair-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 40px;
  padding: 6px 12px;
  border-radius: var(--radius-control);
  font-size: var(--site-text-sm);
  color: var(--color-ink);
}
.pair-link:hover {
  color: var(--color-primary);
}
.pair-link > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pair-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.25;
}
.pair-link small {
  font-size: 11px;
  color: var(--color-ink-soft);
}
.pair-key {
  padding: 0 5px;
  border: 1px solid var(--color-hair);
  border-radius: 4px;
  font-size: 11px;
  color: var(--color-ink-soft);
}
@media (max-width: 39.99rem) {
  .pair-key {
    display: none;
  }
  .cpage-pair {
    margin-top: -16px;
  }
}
.cpage-pn-link:hover b {
  color: var(--color-primary);
}
</style>
