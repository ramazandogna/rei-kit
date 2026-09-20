<script setup lang="ts">
import { computed } from 'vue'

/**
 * A keyboard key, or a chord of them: `⌘ K`, `Ctrl Shift P`.
 *
 * `<kbd>` is the element the browser and assistive tech already understand,
 * so this is that element with the kit's surface on it. A chord is separate
 * keys with a joiner between them rather than one long key, which is how a
 * screen reader reads it as three things to press.
 *
 * The keys are the app's words — `⌘` on a Mac and `Ctrl` elsewhere is a
 * decision about the reader's machine, not about this component.
 */
const {
  keys,
  joiner = '',
  size = 'md',
} = defineProps<{
  /** One key, or the keys of a chord: `['⌘', 'K']`. */
  keys: string | readonly string[]
  /** Drawn between the keys — "+", "then". Empty, they simply sit apart. */
  joiner?: string | undefined
  size?: 'sm' | 'md' | undefined
}>()

const list = computed(() => (typeof keys === 'string' ? [keys] : keys))
</script>

<template>
  <span class="rk-kbd" :class="`is-${size}`">
    <template v-for="(key, index) in list" :key="key">
      <span v-if="index > 0 && joiner" class="rk-kbd-joiner" aria-hidden="true">{{ joiner }}</span>
      <kbd class="rk-kbd-key control">{{ key }}</kbd>
    </template>
  </span>
</template>

<style scoped>
.rk-kbd {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.rk-kbd-key {
  display: inline-grid;
  min-width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  border-radius: var(--radius-cell);
  padding: 0 0.375rem;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  color: var(--color-ink-soft);
}

.is-sm .rk-kbd-key {
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  font-size: 0.6875rem;
}

.rk-kbd-joiner {
  font-size: 0.6875rem;
  color: var(--color-ink-soft);
}
</style>
