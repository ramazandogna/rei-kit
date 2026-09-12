<script setup lang="ts">
import { computed } from 'vue'

/**
 * Moving between pages of a list.
 *
 * A `nav` of buttons rather than links, because this component does not know
 * whether the app pages by route, by query or in memory. It emits a number and
 * the app decides what that means.
 *
 * ## The ellipsis
 *
 * Every page number is unusable past about a dozen, and cutting to
 * "1 … 7 8 9 … 40" is what every list does. The window is a fixed size around
 * the current page and the first and last are always present, so the control
 * never changes width as you move through it — a row of numbers that reflows
 * under the pointer is a row you have to re-aim at.
 *
 * The gap is a `<span>`, not a disabled button: it is not a control, and
 * announcing it as one gives a screen reader something to try to press.
 */
const {
  page,
  pages,
  siblings = 1,
  label = '',
  previousLabel,
  nextLabel,
} = defineProps<{
  /** Current page, 1-based. */
  page: number
  /** How many there are. */
  pages: number
  /** How many numbers to show either side of the current one. */
  siblings?: number | undefined
  /** Accessible name for the landmark. */
  label?: string | undefined
  /**
   * Names for the arrows, already translated.
   *
   * Required, because `‹` is a glyph and not a word: a screen reader reading
   * the arrow announces nothing a person can act on.
   */
  previousLabel: string
  nextLabel: string
}>()

const emit = defineEmits<{ change: [page: number] }>()

const GAP = 'gap' as const

const slots = computed<(number | typeof GAP)[]>(() => {
  if (pages <= 1) return [1]

  const first = 1
  const last = pages

  /* The widest the windowed form ever gets: first, last, the current page, its
     siblings either side, and the two gaps. Below that the window saves
     nothing, and "1 2 … 5" is a worse control than "1 2 3 4 5" — so short lists
     are shown whole rather than cut on principle. */
  if (pages <= siblings * 2 + 5) {
    return Array.from({ length: pages }, (_, i) => i + 1)
  }
  const from = Math.max(first + 1, page - siblings)
  const to = Math.min(last - 1, page + siblings)

  const out: (number | typeof GAP)[] = [first]
  // A gap standing in for a single page is longer than the page it replaces.
  if (from > first + 1) out.push(GAP)
  for (let n = from; n <= to; n++) out.push(n)
  if (to < last - 1) out.push(GAP)
  if (last > first) out.push(last)

  return out
})

const go = (next: number) => {
  if (next >= 1 && next <= pages && next !== page) emit('change', next)
}
</script>

<template>
  <nav class="rk-pager" :aria-label="label || undefined">
    <button
      type="button"
      class="rk-pager-step"
      :disabled="page <= 1"
      :aria-label="previousLabel"
      @click="go(page - 1)"
    >
      ‹
    </button>

    <template v-for="(slot, index) in slots" :key="`${slot}-${index}`">
      <span v-if="slot === 'gap'" class="rk-pager-gap" aria-hidden="true">…</span>
      <button
        v-else
        type="button"
        class="rk-pager-page"
        :class="{ 'is-active': slot === page }"
        :aria-current="slot === page ? 'page' : undefined"
        @click="go(slot)"
      >
        {{ slot }}
      </button>
    </template>

    <button
      type="button"
      class="rk-pager-step"
      :disabled="page >= pages"
      :aria-label="nextLabel"
      @click="go(page + 1)"
    >
      ›
    </button>
  </nav>
</template>

<style scoped>
.rk-pager {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rk-pager-step,
.rk-pager-page {
  display: grid;
  place-items: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  border-radius: var(--radius-cell);
  font-size: 0.875rem;
  color: var(--color-ink-soft);
  transition:
    background-color 150ms,
    color 150ms;
}

.rk-pager-step:hover:not(:disabled),
.rk-pager-page:hover {
  background: var(--color-muted);
  color: var(--color-ink);
}

.rk-pager-step:focus-visible,
.rk-pager-page:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-pager-step:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.rk-pager-page.is-active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 500;
}

.rk-pager-gap {
  display: grid;
  place-items: center;
  min-width: 2rem;
  height: 2rem;
  color: var(--color-ink-soft);
}
</style>
