<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next'
import { onBeforeUnmount, ref } from 'vue'

/**
 * Copies a piece of text, and says that it did.
 *
 * The saying is the part that is usually missing: a copy button that changes
 * nothing leaves the reader pressing it twice. This swaps its icon and its
 * accessible name for two seconds, and announces the change politely — which
 * is what tells somebody who cannot see the tick.
 *
 * A refusal is reported too, through `error`: a browser without clipboard
 * permission fails silently otherwise, and the next paste is whatever was
 * there before.
 */
const {
  text,
  copyLabel,
  copiedLabel,
  errorLabel = undefined,
  withText = false,
} = defineProps<{
  /** What lands on the clipboard. */
  text: string
  /** The button's name at rest, e.g. "Copy the key". */
  copyLabel: string
  /** Its name for the two seconds after, e.g. "Copied". */
  copiedLabel: string
  /** Said when the browser refuses. Unset, a refusal only leaves it unchanged. */
  errorLabel?: string | undefined
  /** Show the label beside the icon, rather than only to assistive tech. */
  withText?: boolean | undefined
}>()

const emit = defineEmits<{ copied: []; failed: [] }>()

const state = ref<'idle' | 'copied' | 'failed'>('idle')
let timer: ReturnType<typeof setTimeout> | null = null

async function copy() {
  if (timer) clearTimeout(timer)

  try {
    await navigator.clipboard.writeText(text)
    state.value = 'copied'
    emit('copied')
  } catch {
    state.value = 'failed'
    emit('failed')
  }

  timer = setTimeout(() => (state.value = 'idle'), 2000)
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <button
    type="button"
    class="rk-copy control focus-ring"
    :class="{ 'is-copied': state === 'copied', 'with-text': withText }"
    :aria-label="withText ? undefined : state === 'copied' ? copiedLabel : copyLabel"
    @click="copy"
  >
    <Check v-if="state === 'copied'" class="size-4 shrink-0" aria-hidden="true" />
    <Copy v-else class="size-4 shrink-0" aria-hidden="true" />
    <span v-if="withText">{{ state === 'copied' ? copiedLabel : copyLabel }}</span>

    <!-- Said once, when it changes: a live region the button itself owns. -->
    <span class="sr-only" role="status" aria-live="polite">
      {{ state === 'copied' ? copiedLabel : state === 'failed' ? (errorLabel ?? '') : '' }}
    </span>
  </button>
</template>

<style scoped>
.rk-copy {
  display: inline-flex;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--radius-card);
  padding: 0 0.625rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-ink);
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.rk-copy:hover {
  background: var(--color-muted);
}

.rk-copy.is-copied {
  color: var(--color-positive);
}

.rk-copy:not(.with-text) {
  width: 2.25rem;
  padding: 0;
}
</style>
