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
const { name } = defineProps<{ name: string }>()

const entry = computed(() => catalogue.find((c) => c.name === name))
</script>

<template>
  <details v-if="entry" class="border-hair/70 mt-4 border-t pt-3">
    <summary class="text-ink-soft hover:text-ink cursor-pointer text-xs font-medium">
      {{ entry.props.length }} prop · {{ entry.entry }}
    </summary>

    <div class="mt-3 overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="text-ink-soft">
          <tr>
            <th class="py-1.5 pr-4 font-medium">Prop</th>
            <th class="py-1.5 pr-4 font-medium">Tip</th>
            <th class="py-1.5 pr-4 font-medium">Varsayılan</th>
            <th class="py-1.5 font-medium">Not</th>
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
              }}<span v-if="prop.required" class="text-negative" title="zorunlu">*</span>
            </td>
            <td class="text-ink-soft py-1.5 pr-4 font-mono">{{ prop.type }}</td>
            <td class="text-ink-soft py-1.5 pr-4 font-mono whitespace-nowrap">
              {{ prop.default || '—' }}
            </td>
            <td class="text-ink-soft max-w-[38ch] py-1.5 leading-relaxed">
              {{ prop.description || '—' }}
            </td>
          </tr>
          <tr v-if="entry.props.length === 0">
            <td colspan="4" class="text-ink-soft py-2">Prop almaz — slot ile kullanılır.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>
