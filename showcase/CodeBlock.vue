<script setup lang="ts">
import { copyToClipboard } from './clipboard'
import { computed, ref } from 'vue'

import { highlight } from './highlight'
import type { CodeLang } from './highlight'
import { codeLanguage } from './preferences'

/**
 * A code sample with a copy button — and, given a JavaScript version, a
 * TypeScript/JavaScript switch that every other sample on the page follows.
 *
 * Every example here is meant to be pasted, so copying is the main action:
 * one press, the whole block, and a tick that says it worked. What is copied
 * is exactly what is shown.
 */
const {
  code,
  js = undefined,
  lang = 'vue',
  file = undefined,
  lines = undefined,
} = defineProps<{
  code: string
  /** The same sample in JavaScript. Given, the block offers the switch. */
  js?: string | undefined
  /** Shown in the corner when there is no file name. */
  lang?: string
  /** The file this goes in, shown instead of the language. */
  file?: string | undefined
  /**
   * A fixed height, in lines. For blocks that swap their code in place —
   * behind a tab — so the page under them does not jump with every switch.
   */
  lines?: number | undefined
}>()

const shown = computed(() => (js !== undefined && codeLanguage.value === 'js' ? js : code))

/* Coloured here rather than with a highlighter dependency: the samples are
   a handful of shapes, and tokenising them in a hundred lines keeps the
   colours in the palette's own roles. What is rendered is escaped first. */
const coloured = computed(() =>
  highlight(shown.value, (file?.split('.').pop() ?? lang) as CodeLang),
)
const copied = ref(false)

async function copy() {
  if (!(await copyToClipboard(shown.value))) return
  copied.value = true
  setTimeout(() => (copied.value = false), 1600)
}
</script>

<template>
  <div class="cb surface">
    <div class="cb-bar">
      <span class="cb-lang">{{ file ?? lang }}</span>
      <div class="flex items-center gap-1">
        <div v-if="js !== undefined" class="cb-switch" role="group" aria-label="Language">
          <button
            v-for="option in ['ts', 'js'] as const"
            :key="option"
            type="button"
            class="cb-option focus-ring"
            :aria-pressed="codeLanguage === option"
            @click="codeLanguage = option"
          >
            {{ option === 'ts' ? 'TS' : 'JS' }}
          </button>
        </div>
        <button type="button" class="cb-copy focus-ring" @click="copy">
          {{ copied ? 'Copied ✓' : 'Copy' }}
        </button>
      </div>
    </div>
    <pre
      class="cb-pre"
      :style="lines ? { height: `calc(${lines} * 1.6em + 1.75rem)` } : undefined"
    ><code v-html="coloured" /></pre>
  </div>
</template>

<style scoped>
.cb {
  overflow: hidden;
  border-radius: var(--radius-card);
}

.cb-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-bottom: 1px solid var(--surface-border-color);
  padding: 0.375rem 0.5rem 0.375rem 1rem;
}

.cb-lang {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-ink-soft);
}

.cb-switch {
  display: inline-flex;
  border-radius: 9999px;
  background: var(--color-muted);
  padding: 2px;
}

.cb-option {
  border-radius: 9999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-ink-soft);
}

.cb-option[aria-pressed='true'] {
  background: var(--color-surface);
  color: var(--color-ink);
  box-shadow: var(--shadow-control);
}

.cb-copy {
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-ink);
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.cb-copy:hover {
  background: var(--color-muted);
}

/* The code's colours are the palette's: a tag in the primary, a string in
   the positive, a comment in the soft ink. Change the palette and the code
   changes with the page. */
.cb-pre :deep(.tok-tag) {
  color: var(--color-primary);
}

.cb-pre :deep(.tok-attr) {
  color: var(--color-accent);
}

.cb-pre :deep(.tok-string) {
  color: color-mix(in oklab, var(--color-positive) 80%, var(--color-ink));
}

.cb-pre :deep(.tok-comment) {
  color: var(--color-ink-soft);
  font-style: italic;
}

.cb-pre :deep(.tok-keyword) {
  color: color-mix(in oklab, var(--color-accent) 85%, var(--color-ink));
  font-weight: 600;
}

.cb-pre :deep(.tok-number) {
  color: color-mix(in oklab, var(--color-warning) 70%, var(--color-ink));
}

.cb-pre :deep(.tok-punct) {
  color: var(--color-ink-soft);
}

.cb-pre {
  overflow-x: auto;
  padding: 0.875rem 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-ink);
}
</style>
