<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { formatNumber } from '../utils/format'
import { nextFrame } from './environment'

/**
 * A number whose digits roll to their new value, like an odometer or a note
 * counter.
 *
 * Each digit is a column of 0–9 moved into place, so going from 19 to 20
 * turns the tens over rather than redrawing the whole number — the eye
 * follows what changed. Positions are counted from the right, which keeps the
 * units column the units column when the number grows a digit, and keeps a
 * thousands separator where it was.
 *
 * Formatting is `Intl.NumberFormat`, so currency, percent, grouping and
 * decimals are the locale's, and change with it. A screen reader hears the
 * value once, as formatted text; the rolling columns are hidden from it.
 *
 * On a server, and for a reader who asked for less motion, it is the number
 * and nothing else.
 */
const {
  value,
  from = undefined,
  format = undefined,
  locale = undefined,
} = defineProps<{
  /** The number to show. Change it and the digits roll to the new one. */
  value: number
  /**
   * Where the digits start when the component mounts, so a count can roll up
   * as the page opens. Unset, the first frame is already the value.
   */
  from?: number | undefined
  /** Passed to `Intl.NumberFormat`: `{ style: 'currency', currency: 'TRY' }`, decimals, grouping. */
  format?: Intl.NumberFormatOptions | undefined
  /** A BCP 47 tag. Unset, the kit's active formatting locale. */
  locale?: string | undefined
}>()

const shown = ref(from ?? value)

const text = (n: number) =>
  locale === undefined ? formatNumber(n, format) : formatNumber(n, format, locale)

/** What a screen reader hears: the destination, never a digit mid-roll. */
const label = computed(() => text(value))

const columns = computed(() => {
  const chars = Array.from(text(shown.value))

  return chars.map((char, index) => ({
    // From the right: the units stay the units when a digit is added in front.
    key: chars.length - index,
    char,
    digit: /[0-9]/.test(char) ? Number(char) : null,
  }))
})

let cancel: (() => void) | null = null

onMounted(() => {
  if (from === undefined) return
  // Two frames: the first paints `from`, so the second has somewhere to roll from.
  cancel = nextFrame(() => {
    cancel = nextFrame(() => (shown.value = value))
  })
})

watch(
  () => value,
  (next) => {
    cancel?.()
    shown.value = next
  },
)

onBeforeUnmount(() => cancel?.())
</script>

<template>
  <span class="rk-ticker">
    <span class="sr-only">{{ label }}</span>
    <span class="rk-ticker-track" aria-hidden="true">
      <template v-for="column in columns" :key="column.key">
        <span
          v-if="column.digit !== null"
          class="rk-ticker-digit"
          :style="{ '--rk-ticker-order': column.key }"
        >
          <span
            class="rk-ticker-strip"
            :style="{ transform: `translateY(${column.digit * -10}%)` }"
          >
            <span v-for="n in 10" :key="n">{{ n - 1 }}</span>
          </span>
        </span>
        <span v-else class="rk-ticker-char">{{ column.char }}</span>
      </template>
    </span>
  </span>
</template>

<style scoped>
/* A line height of its own, so a column is exactly one digit tall without
   depending on `lh` units or on whatever line height the parent set. */
.rk-ticker {
  display: inline-flex;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.rk-ticker-track {
  display: inline-flex;
  white-space: pre;
}

.rk-ticker-digit {
  display: inline-block;
  height: 1.15em;
  overflow: hidden;
}

/* Twice the slowest token: a roll is read, not glanced at. The small delay
   per column, units first, is what makes it feel mechanical rather than
   swapped. Both are tokens, so reduced motion takes them to zero. */
.rk-ticker-strip {
  display: flex;
  flex-direction: column;
  transition: transform calc(var(--duration-slower) * 2) var(--ease-standard);
  transition-delay: calc(var(--duration-fast) / 5 * (var(--rk-ticker-order) - 1));
}

.rk-ticker-strip > span {
  height: 1.15em;
}
</style>
