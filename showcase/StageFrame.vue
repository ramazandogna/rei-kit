<script setup lang="ts">
import { Code, LayoutGrid, Sparkles, X } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import type { Component } from 'vue'

import { MATERIALS } from '../src/index'
import { BaseToolbar } from '../src/web/index'
import AiPromptPanel from './AiPromptPanel.vue'
import { entryByName } from './catalog'
import CodeBlock from './CodeBlock.vue'

/**
 * The preview stage: one live example with an in-stage material switcher
 * (scoped to the stage, the site does not change), an optional side-by-side
 * quad (desktop only, mounted on request), and a code / AI drawer that opens
 * below the stage and never covers it.
 */
const { name, example, code, js } = defineProps<{
  name: string
  example: Component
  code: string
  js?: string | undefined
}>()

const entry = computed(() => entryByName(name))

/* The switcher starts on whatever the site is wearing. It only writes
   data-material on the stage body once you choose one. */
function siteMaterial() {
  const m = typeof document === 'undefined' ? '' : document.documentElement.dataset['material']
  return (MATERIALS as readonly string[]).includes(m ?? '') ? (m as string) : 'quiet'
}
const picked = ref<string | null>(null)
const shownMaterial = computed(() => picked.value ?? siteMaterial())

const WIDE = '(min-width: 48rem)'
const wide = ref(typeof matchMedia === 'function' ? matchMedia(WIDE).matches : true)
let mql: MediaQueryList | undefined
const onWide = (e: MediaQueryListEvent) => {
  wide.value = e.matches
}
onMounted(() => {
  mql = matchMedia(WIDE)
  wide.value = mql.matches
  mql.addEventListener('change', onWide)
})
onBeforeUnmount(() => mql?.removeEventListener('change', onWide))

const quad = ref(false)
const quadOn = computed(() => quad.value && wide.value)
const drawer = ref(false)
const tab = ref<'code' | 'ai'>('code')
const opener = ref<'code' | 'ai'>('code')
const tabIds = ['code', 'ai'] as const

const codeButton = useTemplateRef<HTMLButtonElement>('codeButton')
const aiButton = useTemplateRef<HTMLButtonElement>('aiButton')
const heading = useTemplateRef<HTMLElement>('heading')
const body = useTemplateRef<HTMLElement>('body')
const drawerEl = useTemplateRef<HTMLElement>('drawerEl')

/* The sticky header is handled by scroll-margin-top on the target. */
function reveal(el: HTMLElement | null | undefined) {
  if (!el) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' })
}

function onTabKey(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  tab.value = tab.value === 'code' ? 'ai' : 'code'
  if (event.key === 'Home') tab.value = 'code'
  if (event.key === 'End') tab.value = 'ai'
  void nextTick(() => document.getElementById(`tab-${tab.value}-${name}`)?.focus())
}

async function toggleQuad() {
  quad.value = !quad.value
  await nextTick()
  if (quad.value) reveal(body.value)
}

async function closeDrawer() {
  drawer.value = false
  await nextTick()
  ;(opener.value === 'ai' ? aiButton.value : codeButton.value)?.focus()
}

async function openDrawer(which: 'code' | 'ai') {
  if (drawer.value && tab.value === which) return closeDrawer()
  opener.value = which
  tab.value = which
  drawer.value = true
  await nextTick()
  heading.value?.focus({ preventScroll: true })
  reveal(drawerEl.value)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && drawer.value) {
    event.stopPropagation()
    void closeDrawer()
  }
}
</script>

<template>
  <section class="stage-wrap" :aria-label="`Preview of ${name}`" @keydown="onKeydown">
    <div class="stage" :class="{ 'is-quad-on': quadOn }">
      <BaseToolbar label="Preview tools" class="stage-tools">
        <div class="stage-mats" role="group" aria-label="Material for this preview">
          <button
            v-for="m in MATERIALS"
            :key="m"
            type="button"
            class="stage-mat focus-ring"
            :aria-pressed="!quadOn && shownMaterial === m"
            :disabled="quadOn"
            @click="picked = m"
          >
            {{ m }}
          </button>
        </div>
        <span class="stage-actions">
          <button
            v-if="wide"
            type="button"
            class="stage-tool focus-ring"
            :aria-pressed="quad"
            @click="toggleQuad"
          >
            <LayoutGrid class="size-4" aria-hidden="true" />
            <span>Side by side</span>
          </button>
          <button
            v-if="entry"
            ref="aiButton"
            type="button"
            class="stage-tool focus-ring"
            :aria-expanded="drawer && tab === 'ai'"
            :aria-controls="`code-${name}`"
            @click="openDrawer('ai')"
          >
            <Sparkles class="size-4" aria-hidden="true" />
            <span>AI</span>
          </button>
          <button
            ref="codeButton"
            type="button"
            class="stage-tool focus-ring"
            :aria-expanded="drawer && tab === 'code'"
            :aria-controls="`code-${name}`"
            @click="openDrawer('code')"
          >
            <Code class="size-4" aria-hidden="true" />
            <span>Code</span>
          </button>
        </span>
      </BaseToolbar>

      <div
        ref="body"
        class="stage-body seam-local"
        :class="{ 'is-quad': quadOn, canvas: picked && !quadOn }"
        :data-material="!quadOn && picked ? picked : undefined"
      >
        <template v-if="!quadOn">
          <div class="stage-one"><component :is="example" /></div>
        </template>
        <template v-else>
          <div v-for="m in MATERIALS" :key="m" class="stage-cell canvas" :data-material="m">
            <span class="stage-chip site-mono">{{ m }}</span>
            <component :is="example" />
          </div>
        </template>
      </div>
    </div>

    <div v-if="drawer" :id="`code-${name}`" ref="drawerEl" class="stage-drawer">
      <div class="drawer-bar">
        <h2 ref="heading" class="sr-only" tabindex="-1">
          {{ tab === 'ai' ? 'AI prompt' : 'Code' }} for {{ name }}
        </h2>
        <div
          v-if="entry"
          role="tablist"
          aria-label="Code or AI prompt"
          class="drawer-tabs"
          @keydown="onTabKey"
        >
          <button
            v-for="t in tabIds"
            :id="`tab-${t}-${name}`"
            :key="t"
            type="button"
            role="tab"
            class="drawer-tab focus-ring"
            :aria-selected="tab === t"
            :aria-controls="`panel-${t}-${name}`"
            :tabindex="tab === t ? 0 : -1"
            @click="tab = t"
          >
            {{ t === 'code' ? 'Code' : 'AI' }}
          </button>
        </div>
        <button
          type="button"
          class="drawer-close focus-ring"
          :aria-label="`Close ${tab === 'ai' ? 'AI prompt' : 'code'}`"
          @click="closeDrawer"
        >
          <X class="size-4" aria-hidden="true" />
        </button>
      </div>
      <div class="drawer-scroll">
        <div
          v-show="tab === 'code' || !entry"
          :id="`panel-code-${name}`"
          role="tabpanel"
          :aria-labelledby="`tab-code-${name}`"
        >
          <CodeBlock :code="code" :js="js" :file="`${name}Example.vue`" />
        </div>
        <div
          v-if="entry && tab === 'ai'"
          :id="`panel-ai-${name}`"
          role="tabpanel"
          :aria-labelledby="`tab-ai-${name}`"
        >
          <AiPromptPanel :entry="entry" :example="code" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stage-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.stage,
.stage-drawer {
  scroll-margin-top: 72px;
  scroll-margin-bottom: 16px;
}
.stage {
  position: relative;
  overflow: hidden;
  min-height: 22.5rem;
  border: var(--surface-border-width) solid var(--color-hair);
  border-radius: var(--radius-card);
  background-color: var(--color-canvas);
  background-image: radial-gradient(
    color-mix(in oklab, var(--color-ink) 14%, transparent) 1px,
    transparent 1.5px
  );
  background-size: 24px 24px;
  view-transition-name: stage;
  display: flex;
  flex-direction: column;
}
.stage-tools {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 12px 12px 0;
  padding: 4px;
  border-radius: var(--radius-control);
  background: color-mix(in oklab, var(--color-surface) 90%, transparent);
  border: 1px solid var(--color-hair);
}
.stage-mats,
.stage-actions {
  display: flex;
  gap: 2px;
  min-width: 0;
}
.stage-mat,
.stage-tool {
  display: inline-flex;
  height: 32px;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-control);
  padding: 0 10px;
  font-size: var(--site-text-xs);
  color: var(--color-ink-soft);
}
.stage-mat {
  text-transform: capitalize;
}
.stage-mat:hover:not(:disabled),
.stage-tool:hover {
  color: var(--color-ink);
}
.stage-mat:disabled {
  opacity: 0.45;
}
.stage-mat[aria-pressed='true'],
.stage-tool[aria-pressed='true'],
.stage-tool[aria-expanded='true'] {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.stage-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-width: 0;
  margin: 12px 0 0;
}
.stage-body.canvas {
  background-color: var(--color-canvas);
}
.stage-one {
  /* Definite width, centred content: a chart or table that sizes to its
     container gets the stage's width instead of collapsing to nothing. */
  display: flex;
  width: 100%;
  min-width: 0;
  justify-content: center;
}
@media (min-width: 40rem) {
  .stage-body {
    padding: 48px;
  }
}
/* Phones: the switcher takes a row, the actions the next, the preview gets
   the room it needs, and the code opens under the stage. */
@media (max-width: 39.99rem) {
  .stage {
    min-height: 0;
    margin-inline: -4px;
  }
  .stage-tools {
    margin: 8px 8px 0;
  }
  .stage-mats,
  .stage-actions {
    flex: 1 1 100%;
  }
  .stage-mat,
  .stage-tool {
    flex: 1;
    justify-content: center;
    height: 36px;
  }
  .stage-body {
    min-height: 15rem;
    padding: 24px 16px;
  }
  .stage-one {
    flex-wrap: wrap;
    overflow-x: auto;
  }
  .stage-drawer {
    margin-inline: -4px;
  }
}
.stage-body.is-quad {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  padding: 0;
  background: var(--color-hair);
  align-items: stretch;
}
.stage-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 12rem;
  padding: 40px 24px 24px;
  background: var(--color-canvas);
}
.stage-chip {
  position: absolute;
  top: 10px;
  inset-inline-start: 12px;
  font-size: 12px;
  color: var(--color-ink-soft);
}
.stage-drawer {
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  overflow: hidden;
  background: var(--color-surface);
  border: var(--surface-border-width, 1px) solid var(--color-hair);
  border-radius: var(--radius-card);
}
.drawer-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 8px 0 12px;
  border-bottom: 1px solid var(--color-hair);
  flex: none;
}
.drawer-scroll {
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}
.drawer-tabs {
  display: flex;
  gap: 2px;
}
.drawer-tab {
  height: 32px;
  padding: 0 12px;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  font-size: var(--site-text-xs);
  color: var(--color-ink-soft);
}
.drawer-tab:hover {
  color: var(--color-ink);
}
.drawer-tab[aria-selected='true'] {
  color: var(--color-ink);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}
.drawer-close {
  display: inline-flex;
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  margin-inline-start: auto;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-control);
  color: var(--color-ink-soft);
}
.drawer-close:hover {
  color: var(--color-ink);
  background: color-mix(in oklab, var(--color-ink) 8%, transparent);
}
</style>
