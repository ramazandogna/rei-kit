<script setup lang="ts">
import { computed } from 'vue'

import { formatDate } from '../utils/format'
import BaseAvatar from './BaseAvatar.vue'
import ToneDot from './ToneDot.vue'

/**
 * One message in a conversation: the person's in a coloured bubble on the end
 * side, the assistant's on a surface with its avatar, a system note as quiet
 * centred text.
 *
 * It is an `<article>` named for its sender. While `streaming` it is marked
 * busy, which holds back the live announcement until the reply is complete —
 * a screen reader is not read a sentence one word at a time. Actions (copy,
 * retry) appear on hover and whenever focus is inside; they are yours.
 *
 * @example
 * ```vue
 * <ChatMessage from="assistant" name="Rei" time="2026-01-01T10:00:00Z">Hello!</ChatMessage>
 * ```
 */
const {
  from,
  name = undefined,
  avatar = undefined,
  time = undefined,
  status = undefined,
  errorLabel = 'Not sent',
  streaming = false,
} = defineProps<{
  from: 'user' | 'assistant' | 'system'
  name?: string | undefined
  avatar?: string | undefined
  time?: string | Date | undefined
  status?: 'sending' | 'sent' | 'error' | undefined
  errorLabel?: string | undefined
  /** The reply is still arriving. */
  streaming?: boolean | undefined
}>()

defineSlots<{
  default?: () => unknown
  /** Buttons shown on hover and focus: copy, retry. */
  actions?: () => unknown
  meta?: () => unknown
}>()

const when = computed(() => {
  if (time === undefined) return ''
  const date = time instanceof Date ? time : new Date(time)

  return Number.isNaN(date.getTime()) ? String(time) : formatDate(date, { timeStyle: 'short' })
})
</script>

<template>
  <article class="cm" :class="`cm--${from}`" :aria-label="name ?? from" :aria-busy="streaming">
    <BaseAvatar
      v-if="from === 'assistant'"
      class="cm-avatar"
      size="sm"
      :name="name ?? from"
      :src="avatar"
    />
    <div class="cm-main">
      <div class="cm-bubble">
        <div class="cm-body">
          <slot /><span v-if="streaming" class="cm-caret" aria-hidden="true">▍</span>
        </div>
      </div>
      <div v-if="when || status === 'error' || $slots.meta || $slots.actions" class="cm-foot">
        <time v-if="when" class="cm-time">{{ when }}</time>
        <ToneDot v-if="status === 'error'" fill="bg-negative" :label="errorLabel" />
        <slot name="meta" />
        <span v-if="$slots.actions" class="cm-actions"><slot name="actions" /></span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.cm {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  min-width: 0;
}

.cm-main {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
  max-width: min(36rem, 80%);
}

.cm-bubble {
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius-card);
  overflow-wrap: anywhere;
}

.cm-body {
  white-space: pre-wrap;
}

.cm-foot {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.5rem;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}

.cm-actions {
  display: inline-flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-standard);
}
.cm:hover .cm-actions,
.cm:focus-within .cm-actions {
  opacity: 1;
}
@media (hover: none) {
  .cm-actions {
    opacity: 1;
  }
}

/* user: the end side */
.cm--user {
  justify-content: flex-end;
}
.cm--user .cm-main {
  margin-inline-start: auto;
  justify-items: end;
}
.cm--user .cm-bubble {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-end-start-radius: var(--radius-cell);
  box-shadow: var(--shadow-control);
}

/* assistant: the start side, on a surface */
.cm--assistant .cm-bubble {
  background-color: color-mix(in oklab, var(--color-surface) var(--surface-opacity), transparent);
  color: var(--color-ink);
  border: var(--surface-border-width) solid var(--color-hair);
  border-end-end-radius: var(--radius-cell);
  backdrop-filter: var(--surface-backdrop);
  -webkit-backdrop-filter: var(--surface-backdrop);
}
:where([data-material='brutal']) .cm--assistant .cm-bubble {
  box-shadow: var(--shadow-card);
  border-color: var(--color-ink);
}

/* system: a note, no bubble */
.cm--system {
  justify-content: center;
  text-align: center;
}
.cm--system .cm-main {
  max-width: 100%;
  justify-items: center;
}
.cm--system .cm-bubble {
  padding: 0;
  font-size: 0.8125rem;
  color: var(--color-ink-soft);
}

.cm-caret {
  animation: cm-blink 1s steps(2) infinite;
}
@keyframes cm-blink {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cm-caret {
    animation: none;
  }
  .cm-actions {
    transition: none;
  }
}
</style>
