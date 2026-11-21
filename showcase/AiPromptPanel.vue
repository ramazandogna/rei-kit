<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import { CopyButton } from '../src/index'
import { buildPrompt, suggestedGoal } from './ai-prompt'
import type { Entry } from './catalog'

/** The AI tab: a goal, the prompt it makes, and two ways to take it away. */
const { entry, example } = defineProps<{ entry: Entry; example?: string | undefined }>()

const goal = ref(suggestedGoal(entry))
const prompt = computed(() => buildPrompt(entry, goal.value, example))
const claudeUrl = computed(() => `https://claude.ai/new?q=${encodeURIComponent(prompt.value)}`)
const id = useId()
</script>

<template>
  <div class="ai">
    <label :for="`${id}-goal`" class="ai-label">What are you building?</label>
    <input
      :id="`${id}-goal`"
      v-model="goal"
      type="text"
      class="ai-goal focus-ring"
      autocomplete="off"
    />
    <label :for="`${id}-prompt`" class="ai-label">Prompt</label>
    <textarea
      :id="`${id}-prompt`"
      class="ai-prompt site-mono focus-ring"
      readonly
      rows="10"
      :value="prompt"
      spellcheck="false"
    />
    <div class="ai-actions">
      <CopyButton :text="prompt" copy-label="Copy prompt" copied-label="Copied" with-text />
      <a :href="claudeUrl" target="_blank" rel="noopener" class="ai-open focus-ring">
        Open in Claude<span class="sr-only"> (opens in a new tab)</span>
      </a>
      <p class="ai-note">Built in your browser. Nothing is sent anywhere until you click.</p>
    </div>
  </div>
</template>

<style scoped>
.ai {
  display: grid;
  gap: 8px;
  padding: 12px 16px 16px;
}
.ai-label {
  font-size: var(--site-text-xs);
  color: var(--color-ink-soft);
}
.ai-goal,
.ai-prompt {
  width: 100%;
  border: 1px solid var(--color-hair);
  border-radius: var(--radius-control);
  background: var(--color-canvas);
  color: var(--color-ink);
}
.ai-goal {
  height: 38px;
  padding: 0 12px;
}
.ai-prompt {
  resize: vertical;
  padding: 10px 12px;
  font-size: 12.5px;
  line-height: 1.55;
  white-space: pre;
  overflow: auto;
}
.ai-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}
.ai-open {
  display: inline-flex;
  height: 36px;
  align-items: center;
  border-radius: var(--radius-control);
  padding: 0 14px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: var(--site-text-sm, 14px);
  font-weight: 500;
}
.ai-note {
  flex-basis: 100%;
  font-size: var(--site-text-xs);
  color: var(--color-ink-soft);
}
@media (max-width: 39.99rem) {
  .ai-prompt {
    white-space: pre-wrap;
  }
}
@media (min-width: 40rem) {
  .ai-note {
    flex-basis: auto;
  }
}
</style>
