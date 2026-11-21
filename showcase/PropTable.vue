<script setup lang="ts">
import { computed } from 'vue'

import catalogue from './props.generated.json'

/**
 * One component's props, read out of the source rather than written by hand.
 *
 * A prop table maintained by hand is a prop table that is wrong by the second
 * release — and being wrong is worse than being absent, because a reader trusts
 * it. `scripts/extract-props.mjs` regenerates this before every showcase build,
 * so the page and the compiler are reading the same text.
 */
const { name, open = false } = defineProps<{ name: string; open?: boolean }>()

const entry = computed(() => catalogue.find((c) => c.name === name))
</script>

<template>
  <details v-if="entry" :open="open" class="border-hair/70 mt-4 border-t pt-3">
    <summary class="text-ink-soft hover:text-ink cursor-pointer text-xs font-medium">
      {{ entry.props.length }} {{ entry.props.length === 1 ? 'prop' : 'props' }} · {{ entry.entry }}
    </summary>

    <div class="mt-3 overflow-x-auto">
      <table class="ptable w-full text-left text-xs">
        <thead class="text-ink-soft">
          <tr>
            <th class="py-1.5 pr-4 font-medium">Prop</th>
            <th class="py-1.5 pr-4 font-medium">Type</th>
            <th class="py-1.5 pr-4 font-medium">Default</th>
            <th class="py-1.5 font-medium">Note</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="prop in entry.props"
            :key="prop.name"
            class="border-hair/40 border-t align-top"
          >
            <td class="text-ink py-1.5 pr-4 font-mono whitespace-nowrap">
              {{ prop.name
              }}<span v-if="prop.required" class="text-negative" title="required">*</span>
            </td>
            <td class="text-ink-soft py-1.5 pr-4 font-mono" data-label="Type">{{ prop.type }}</td>
            <td class="text-ink-soft py-1.5 pr-4 font-mono whitespace-nowrap" data-label="Default">
              {{ prop.default || '—' }}
            </td>
            <td class="text-ink-soft max-w-[38ch] py-1.5 leading-relaxed" data-label="Note">
              {{ prop.description || '—' }}
            </td>
          </tr>
          <tr v-if="entry.props.length === 0">
            <td colspan="4" class="text-ink-soft py-2">Takes no props — driven by slots.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>

<style scoped>
/* A four-column table on a phone is four slivers of text. Under 40rem each
   prop becomes a small card: the name as its heading, the rest labelled. */
@media (max-width: 39.99rem) {
  .ptable thead {
    display: none;
  }
  .ptable,
  .ptable tbody,
  .ptable tr,
  .ptable td {
    display: block;
    width: 100%;
    max-width: none;
  }
  .ptable tr {
    padding: 12px 0;
  }
  .ptable td {
    padding: 2px 0;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .ptable td:first-child {
    font-size: 0.875rem;
    padding-bottom: 6px;
  }
  .ptable td[data-label]::before {
    content: attr(data-label);
    display: inline-block;
    min-width: 4.5rem;
    color: var(--color-ink-soft);
    opacity: 0.7;
    font-family: var(--font-sans, system-ui);
  }
}
</style>
