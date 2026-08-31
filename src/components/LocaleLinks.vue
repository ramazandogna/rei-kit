<script setup lang="ts" generic="L extends string">
/**
 * A flat language switcher for screens with no Settings behind them.
 *
 * The list and the labels are props: only the app knows which languages it
 * ships, and endonyms — each language written in itself — are what make the
 * right option legible to someone who cannot read the current interface.
 */
const {
  locales,
  labels,
  label = '',
} = defineProps<{
  locales: readonly L[]
  /** Endonyms, e.g. `{ en: 'English', tr: 'Türkçe' }`. */
  labels: Record<L, string>
  /** Accessible name for the group. */
  label?: string
}>()

/**
 * Two-way bound rather than taking the runtime's ref as a prop: props are not
 * unwrapped in a template and cannot be assigned to, so the ref would compare
 * against itself and the click handler would not compile.
 */
const preference = defineModel<'system' | L>({ required: true })
</script>

<template>
  <nav class="flex flex-wrap items-center justify-center gap-1" :aria-label="label || undefined">
    <button
      v-for="locale in locales"
      :key="locale"
      type="button"
      :lang="locale"
      class="rounded-full px-2.5 py-1.5 text-xs transition-colors"
      :class="
        preference === locale ? 'bg-muted text-ink font-semibold' : 'text-ink-soft hover:text-ink'
      "
      :aria-pressed="preference === locale"
      @click="preference = locale"
    >
      {{ labels[locale] }}
    </button>
  </nav>
</template>
