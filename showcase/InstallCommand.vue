<script setup lang="ts">
import { copyToClipboard } from './clipboard'
import { computed, ref } from 'vue'

import { PACKAGE_MANAGERS, command, packageManager } from './preferences'

/**
 * A shell command in the reader's package manager.
 *
 * The choice is shared: pick npm here and every command on the page is npm.
 */
const { kind, args } = defineProps<{
  kind: 'add' | 'add-dev' | 'create'
  args: string
}>()

const text = computed(() => command(kind, args, packageManager.value))
const copied = ref(false)

async function copy() {
  if (!(await copyToClipboard(text.value))) return
  copied.value = true
  setTimeout(() => (copied.value = false), 1600)
}
</script>

<template>
  <div class="ic surface">
    <div class="ic-tabs" role="group" aria-label="Package manager">
      <button
        v-for="pm in PACKAGE_MANAGERS"
        :key="pm"
        type="button"
        class="ic-tab focus-ring"
        :aria-pressed="packageManager === pm"
        @click="packageManager = pm"
      >
        {{ pm }}
      </button>
    </div>
    <div class="ic-line">
      <code><span class="ic-prompt" aria-hidden="true">$ </span>{{ text }}</code>
      <button type="button" class="ic-copy focus-ring" @click="copy">
        {{ copied ? 'Copied ✓' : 'Copy' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.ic {
  overflow: hidden;
  border-radius: var(--radius-card);
}

.ic-tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--surface-border-color);
  padding: 0.375rem 0.5rem;
}

.ic-tab {
  border-radius: 9999px;
  padding: 0.1875rem 0.625rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}

.ic-tab[aria-pressed='true'] {
  background: var(--color-muted);
  color: var(--color-ink);
  font-weight: 600;
}

.ic-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.5rem 0.75rem 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
  color: var(--color-ink);
}

.ic-line code {
  overflow-x: auto;
  white-space: nowrap;
}

.ic-prompt {
  color: var(--color-ink-soft);
  user-select: none;
}

.ic-copy {
  flex-shrink: 0;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
}

.ic-copy:hover {
  background: var(--color-muted);
}
</style>
