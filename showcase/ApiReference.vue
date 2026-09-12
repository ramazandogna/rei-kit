<script setup lang="ts">
import { computed } from 'vue'

import catalogue from './props.generated.json'
import PropTable from './PropTable.vue'

/**
 * Every component the package ships, with its props.
 *
 * The gallery above answers "what does it look like"; this answers "what does
 * it take". Both are generated from the same file, so a component cannot be
 * demonstrated and undocumented, or documented and gone.
 *
 * Grouped by entry point, because which import line a thing comes from is the
 * first question after finding it — and because it is how a reader discovers
 * that `rei-kit/web` exists at all.
 */
const groups = computed(() => {
  const byEntry = new Map<string, typeof catalogue>()
  for (const component of catalogue) {
    const list = byEntry.get(component.entry) ?? []
    list.push(component)
    byEntry.set(component.entry, list)
  }

  const ORDER = ['rei-kit', 'rei-kit/app', 'rei-kit/web', 'rei-kit/pwa']

  return ORDER.filter((entry) => byEntry.has(entry)).map((entry) => ({
    entry,
    items: byEntry.get(entry)!,
  }))
})
</script>

<template>
  <div class="flex flex-col gap-10">
    <section v-for="group in groups" :key="group.entry">
      <h3 class="text-ink font-mono text-sm font-semibold">{{ group.entry }}</h3>
      <p class="text-ink-soft mt-1 text-xs">{{ group.items.length }} bileşen</p>

      <div class="mt-4 flex flex-col gap-3">
        <article
          v-for="item in group.items"
          :id="`api-${item.name}`"
          :key="item.name"
          class="border-hair/70 rounded-card border p-4"
        >
          <h4 class="text-ink font-mono text-sm">{{ item.name }}</h4>
          <p class="text-ink-soft mt-1 max-w-[68ch] text-sm leading-relaxed">{{ item.summary }}</p>
          <PropTable :name="item.name" />
        </article>
      </div>
    </section>
  </div>
</template>
