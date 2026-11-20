<script setup lang="ts">
import { computed, provide } from 'vue'

/**
 * A grid of cells of different sizes, for a page that wants to show several
 * things at once without making them all the same shape.
 *
 * Cells are placed in document order and never reflowed (no `dense`), so what
 * a keyboard or screen-reader user meets is what a sighted one reads, left to
 * right and top to bottom. Pick `as="ul"` and the cells become list items.
 *
 * Under 640px it is one column of full-width cells; up to 1023px, at most two.
 * A cell asking for more columns than exist is clamped.
 *
 * @example
 * ```vue
 * <BentoGrid>
 *   <BentoCell :col="2" title="Fast" description="No dependencies." />
 *   <BentoCell title="Accessible" />
 * </BentoGrid>
 * ```
 */
const {
  columns = 4,
  rowHeight = '11rem',
  gap = 'md',
  as = 'div',
} = defineProps<{
  /** Columns on a wide screen. */
  columns?: 2 | 3 | 4 | undefined
  /** Height of one row; a cell with `row="2"` is twice this plus a gap. */
  rowHeight?: string | undefined
  gap?: 'sm' | 'md' | 'lg' | undefined
  /** `ul` makes the grid a list and each cell a list item. */
  as?: 'div' | 'ul' | undefined
}>()

const GAP = { sm: '0.5rem', md: '1rem', lg: '1.5rem' } as const

provide(
  'rei-bento',
  computed(() => ({ tag: as === 'ul' ? 'li' : 'div', columns })),
)
</script>

<template>
  <component
    :is="as"
    class="bg-grid"
    :class="`bg-cols-${columns}`"
    :style="{ '--bg-row-h': rowHeight, '--bg-gap': GAP[gap] }"
  >
    <slot />
  </component>
</template>

<style scoped>
.bg-grid {
  display: grid;
  gap: var(--bg-gap);
  grid-auto-rows: var(--bg-row-h);
  grid-auto-flow: row;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
}

.bg-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
.bg-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1023px) {
  .bg-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 639px) {
  .bg-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
}
</style>
