<script setup lang="ts">
import { computed, ref } from 'vue'

import CodeBlock from './CodeBlock.vue'
import examples from './examples.generated.json'
import PartPitch from './PartPitch.vue'
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

  const ORDER = ['rei-kit', 'rei-kit/web', 'rei-kit/app', 'rei-kit/pwa', 'rei-kit/motion']

  return ORDER.filter((entry) => byEntry.has(entry)).map((entry) => ({
    entry,
    items: byEntry.get(entry)!,
  }))
})

/* Every component has one — a test fails otherwise — and it is a real file,
   type-checked with this page, so what a reader copies compiles. */
const exampleFor = (name: string) => examples.find((example) => example.name === name)

/* One hundred and six components in one document: the command palette finds
   them, and somebody who arrived from a search for "vue combobox" never
   learns it exists. A filter in the section itself needs no shortcut. */
const query = ref('')

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return groups.value

  return groups.value
    .map((group) => ({
      entry: group.entry,
      items: group.items.filter(
        (item) =>
          item.name.toLowerCase().includes(needle) || item.summary.toLowerCase().includes(needle),
      ),
    }))
    .filter((group) => group.items.length > 0)
})

const found = computed(() => filtered.value.reduce((total, group) => total + group.items.length, 0))
</script>

<template>
  <div class="flex flex-col gap-10">
    <div
      class="surface rounded-card sticky top-24 z-10 flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3"
    >
      <label for="api-filter" class="text-ink shrink-0 text-sm font-medium">
        Find a component
      </label>
      <input
        id="api-filter"
        v-model="query"
        type="search"
        placeholder="combobox, date, table…"
        class="control rounded-control border-hair text-ink focus-visible:outline-primary min-h-11 w-full border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
      />
      <p class="text-ink-soft shrink-0 text-xs tabular-nums" aria-live="polite">
        {{ found }} of {{ catalogue.length }}
      </p>
    </div>

    <p v-if="found === 0" class="text-ink-soft text-sm">
      Nothing matches “{{ query }}”. Every component is listed under its entry point above.
    </p>

    <section v-for="group in filtered" :key="group.entry">
      <h3 class="text-ink font-mono text-sm font-semibold">{{ group.entry }}</h3>
      <p class="text-ink-soft mt-1 text-xs">{{ group.items.length }} components</p>

      <div class="mt-4 flex flex-col gap-3">
        <article
          v-for="item in group.items"
          :id="`api-${item.name}`"
          :key="item.name"
          class="surface rounded-card p-4 sm:p-5"
        >
          <h4 class="text-ink font-mono text-sm">{{ item.name }}</h4>
          <PartPitch
            class="text-ink-soft mt-1 max-w-[68ch] text-sm leading-relaxed"
            :text="item.summary"
          />
          <CodeBlock
            v-if="exampleFor(item.name)"
            class="mt-4"
            :code="exampleFor(item.name)!.ts"
            :js="exampleFor(item.name)!.js"
            :file="`${item.name}Example.vue`"
          />
          <PropTable :name="item.name" />
        </article>
      </div>
    </section>
  </div>
</template>
