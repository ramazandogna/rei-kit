<script setup lang="ts">
export interface DescriptionItem {
  /** What it is: "Status", "Created". Already translated. */
  term: string
  /** What it says. Use the slot named after `key` for anything but text. */
  description?: string | undefined
  /** Names the slot that draws this row's value. */
  key?: string | undefined
}

/**
 * Pairs of "what it is" and "what it says": the summary at the top of a
 * detail page, the facts under an invoice.
 *
 * A `<dl>`, which is the element for exactly this and almost never used: a
 * grid of divs says nothing about which text names which value, and a
 * screen reader reads it as a wall. Here each pair is a `dt` and a `dd`, so
 * "Status: paid" is heard as one thing.
 *
 * Values that are not plain text — a badge, a link, a date — come from the
 * slot named after the row's `key`.
 */
const { items, layout = 'stacked' } = defineProps<{
  items: readonly DescriptionItem[]
  /** `inline` puts the term beside its value; `stacked` puts it above. */
  layout?: 'stacked' | 'inline' | undefined
}>()

defineSlots<{
  /** A row's value, named for its `key`. */
  [key: string]: (props: { item: DescriptionItem }) => unknown
}>()
</script>

<template>
  <dl class="rk-dl" :class="`is-${layout}`">
    <div v-for="item in items" :key="item.key ?? item.term" class="rk-dl-row">
      <dt class="rk-dl-term">{{ item.term }}</dt>
      <dd class="rk-dl-value">
        <slot :name="item.key ?? item.term" :item="item">{{ item.description }}</slot>
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.rk-dl {
  display: grid;
  gap: 0.75rem;
}

.rk-dl.is-inline {
  gap: 0.5rem;
}

.rk-dl-row {
  display: grid;
  gap: 0.125rem;
}

/* Inline from a tablet up: below that a term and its value side by side
   leave neither enough room to read. */
@media (min-width: 40rem) {
  .is-inline .rk-dl-row {
    grid-template-columns: minmax(6rem, 12rem) minmax(0, 1fr);
    gap: 1rem;
    align-items: baseline;
  }
}

.rk-dl-term {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-ink-soft);
}

.rk-dl-value {
  font-size: 0.875rem;
  color: var(--color-ink);
}
</style>
