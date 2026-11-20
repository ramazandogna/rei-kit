<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'

/**
 * One cell of a `BentoGrid`: a card that can span columns and rows, with a
 * title, a description, a visual that takes the room left, and a footer.
 *
 * The surface is `BaseCard`'s, so every material and palette reaches it.
 * `interactive` is for a cell that is wholly a link or button target (put the
 * link inside, on the title): it lifts on hover, except for a reader who asked
 * for less motion.
 *
 * @example
 * ```vue
 * <BentoCell :col="2" :row="2" title="Themes" description="Ten palettes.">
 *   <template #visual><Swatches /></template>
 * </BentoCell>
 * ```
 */
const {
  col = 1,
  row = 1,
  title = undefined,
  description = undefined,
  titleLevel = 3,
  interactive = false,
} = defineProps<{
  /** Columns to span, 1 to 4. Clamped to the grid's. */
  col?: 1 | 2 | 3 | 4 | undefined
  /** Rows to span, 1 to 3. */
  row?: 1 | 2 | 3 | undefined
  title?: string | undefined
  description?: string | undefined
  /** Heading level for the title, 2 to 6. */
  titleLevel?: 2 | 3 | 4 | 5 | 6 | undefined
  /** Lift on hover. */
  interactive?: boolean | undefined
}>()

const grid = inject<Ref<{ tag: string; columns: number }> | null>('rei-bento', null)

const tag = computed(() => grid?.value.tag ?? 'div')
const span = computed(() => Math.min(col, grid?.value.columns ?? 4))
</script>

<template>
  <component
    :is="tag"
    class="bc surface rounded-card"
    :class="[`bc-c${span}`, `bc-r${row}`, interactive ? 'bc--interactive' : '']"
  >
    <div v-if="$slots.visual" class="bc-visual"><slot name="visual" /></div>
    <div v-if="title || description || $slots.default" class="bc-text">
      <component :is="`h${titleLevel}`" v-if="title" class="bc-title">{{ title }}</component>
      <p v-if="description" class="bc-desc">{{ description }}</p>
      <slot />
    </div>
    <div v-if="$slots.footer" class="bc-foot"><slot name="footer" /></div>
  </component>
</template>

<style scoped>
.bc {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  overflow: hidden;
  padding: 1.5rem;
}

.bc-c1 {
  grid-column: span 1;
}
.bc-c2 {
  grid-column: span 2;
}
.bc-c3 {
  grid-column: span 3;
}
.bc-c4 {
  grid-column: span 4;
}
.bc-r1 {
  grid-row: span 1;
}
.bc-r2 {
  grid-row: span 2;
}
.bc-r3 {
  grid-row: span 3;
}

.bc-visual {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.bc-title {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.3;
  font-weight: 600;
  color: var(--color-ink);
}

.bc-desc {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-ink-soft);
}

.bc--interactive {
  transition:
    translate var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}
.bc--interactive:hover {
  translate: 0 -2px;
  --surface-shadow: var(--shadow-raised);
}

@media (max-width: 1023px) {
  .bc-c3,
  .bc-c4 {
    grid-column: span 2;
  }
}

@media (max-width: 639px) {
  .bc {
    grid-column: auto !important;
    grid-row: auto !important;
    min-height: var(--bg-row-h);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bc--interactive {
    transition: none;
  }
  .bc--interactive:hover {
    translate: none;
  }
}
</style>
