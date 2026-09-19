<script setup lang="ts">
import { ref } from 'vue'

/**
 * A code sample with a copy button.
 *
 * Every example on this page is meant to be pasted, so copying is the main
 * action and not an extra: one press, the whole block, and a tick that says
 * it worked. The text copied is exactly the text shown.
 */
const { code, lang = 'vue' } = defineProps<{
  code: string
  /** Shown in the corner, so a reader knows which file it goes in. */
  lang?: string
}>()

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    // Clipboard refused: the code is on screen and selectable either way.
  }
}
</script>

<template>
  <div class="cb surface">
    <div class="cb-bar">
      <span class="cb-lang">{{ lang }}</span>
      <button type="button" class="cb-copy focus-ring" @click="copy">
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>
    <pre class="cb-pre"><code>{{ code }}</code></pre>
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
  border-bottom: 1px solid var(--surface-border-color);
  padding: 0.375rem 0.5rem 0.375rem 1rem;
}

.cb-lang {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
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

.cb-pre {
  overflow-x: auto;
  padding: 0.875rem 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-ink);
}
</style>
