<script setup lang="ts">
import { computed } from 'vue'

const {
  rows = 3,
  rowHeight = 'h-14',
  label = 'Loading…',
} = defineProps<{
  rows?: number
  /**
   * How tall each row is, as either a utility class (`h-20`) or a CSS length
   * (`5rem`, `72px`, `var(--row)`).
   *
   * Both are accepted because the class-only version failed silently: a length
   * passed here landed in `class` as `5rem`, which is not a class, so the rows
   * had no height and the placeholder rendered as nothing at all. A loading
   * state that shows an empty page is worse than no loading state, because it
   * looks like the page is finished and empty.
   */
  rowHeight?: string
  label?: string
}>()

/** A length starts with a digit, a dot, or opens a CSS function. */
const isLength = computed(() => /^(?:[.\d]|calc\(|var\(|clamp\(|min\(|max\()/.test(rowHeight))
</script>

<template>
  <div role="status" class="flex flex-col gap-1">
    <span class="sr-only">{{ label }}</span>

    <div
      v-for="row in rows"
      :key="row"
      class="bg-muted rounded-card animate-pulse"
      :class="isLength ? undefined : rowHeight"
      :style="isLength ? { height: rowHeight } : undefined"
      aria-hidden="true"
    />
  </div>
</template>
