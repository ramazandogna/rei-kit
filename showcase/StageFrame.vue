<script setup lang="ts">
import { Code, LayoutGrid } from 'lucide-vue-next'
import { nextTick, ref, useTemplateRef } from 'vue'
import type { Component } from 'vue'

import { MATERIALS } from '../src/index'
import { BaseToolbar } from '../src/web/index'
import CodeBlock from './CodeBlock.vue'

/**
 * The preview stage: one big live example, a Quad that shows it in all four
 * materials, and a code drawer that is closed on every visit.
 *
 * The example file is the realistic usage; there is no second block. Quad
 * mounts four independent instances only while it is on, so the default
 * page carries one.
 */
const { name, example, code, js } = defineProps<{
  name: string
  example: Component
  code: string
  js?: string | undefined
}>()

function readQuad() {
  try {
    return localStorage.getItem('rei-quad') === '1'
  } catch {
    return false
  }
}
const quad = ref(readQuad())
const quadKey = ref(0)
const drawer = ref(false)
const codeButton = useTemplateRef<HTMLButtonElement>('codeButton')
const heading = useTemplateRef<HTMLElement>('heading')

function toggleQuad() {
  quad.value = !quad.value
  quadKey.value++
  try {
    localStorage.setItem('rei-quad', quad.value ? '1' : '0')
  } catch {
    // Remembering is a convenience.
  }
}

async function toggleCode() {
  drawer.value = !drawer.value
  await nextTick()
  if (drawer.value) heading.value?.focus()
  else codeButton.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && drawer.value) {
    event.stopPropagation()
    void toggleCode()
  }
}
</script>

<template>
  <section
    class="stage"
    :class="{ 'has-drawer': drawer }"
    :aria-label="`Preview of ${name}`"
    @keydown="onKeydown"
  >
    <BaseToolbar label="Preview tools" class="stage-tools">
      <button type="button" class="stage-tool focus-ring" :aria-pressed="quad" @click="toggleQuad">
        <LayoutGrid class="size-4" aria-hidden="true" />
        <span>Compare materials</span>
      </button>
      <button
        ref="codeButton"
        type="button"
        class="stage-tool focus-ring"
        :aria-expanded="drawer"
        :aria-controls="`code-${name}`"
        @click="toggleCode"
      >
        <Code class="size-4" aria-hidden="true" />
        <span>Code</span>
      </button>
    </BaseToolbar>

    <div :key="quadKey" class="stage-body seam-local" :class="{ 'is-quad': quad }">
      <template v-if="!quad">
        <div class="stage-one"><component :is="example" /></div>
      </template>
      <template v-else>
        <div v-for="m in MATERIALS" :key="m" class="stage-cell canvas" :data-material="m">
          <span class="stage-chip site-mono">{{ m }}</span>
          <component :is="example" />
        </div>
      </template>
    </div>

    <div v-if="drawer" :id="`code-${name}`" class="stage-drawer seam-up">
      <h2 ref="heading" class="sr-only" tabindex="-1">Code for {{ name }}</h2>
      <CodeBlock :code="code" :js="js" :file="`${name}Example.vue`" />
    </div>
  </section>
</template>

<style scoped>
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
.stage.has-drawer {
  min-height: 40rem;
}
.stage-tools {
  position: relative;
  z-index: 2;
  align-self: flex-end;
  display: flex;
  gap: 4px;
  margin: 12px 12px 0;
  padding: 4px;
  border-radius: var(--radius-control);
  background: color-mix(in oklab, var(--color-surface) 90%, transparent);
  border: 1px solid var(--color-hair);
}
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
.stage-tool:hover {
  color: var(--color-ink);
}
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
/* Phones: the tools become a full-width bar, the preview gets the room it
   needs instead of a fixed tall box, and the code opens under the preview
   rather than on top of it. */
@media (max-width: 39.99rem) {
  .stage,
  .stage.has-drawer {
    min-height: 0;
    margin-inline: -4px;
  }
  .stage-tools {
    align-self: stretch;
    margin: 8px 8px 0;
  }
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
  .stage-cell {
    min-height: 10rem;
    padding: 36px 16px 16px;
  }
  .stage-drawer {
    position: static;
    max-height: 60vh;
  }
}
.stage-body.is-quad {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  padding: 0;
  background: var(--color-hair);
  align-items: stretch;
  margin-top: 12px;
}
@media (min-width: 48rem) {
  .stage-body.is-quad {
    grid-template-columns: 1fr 1fr;
  }
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
  position: absolute;
  inset: auto 0 0 0;
  z-index: 3;
  max-height: min(60%, 30rem);
  overflow: auto;
  background: var(--color-surface);
  border-top: 1px solid var(--color-hair);
  box-shadow: var(--shadow-overlay);
}
</style>
