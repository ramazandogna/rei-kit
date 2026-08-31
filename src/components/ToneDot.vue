<script setup lang="ts">
/**
 * A small coloured dot, optionally labelled.
 *
 * Takes the colour as a class rather than a category, so an app can key it off
 * whatever its own domain calls a category — habit kinds, expense types,
 * priorities — without this component knowing about any of them.
 */
const { fill, label = '' } = defineProps<{
  /** Background utility for the dot, e.g. `bg-positive`. */
  fill: string
  /** Optional text after the dot. Omit for a bare marker. */
  label?: string
}>()
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <span class="size-2 rounded-full" :class="fill" />
    <span v-if="label" class="text-ink-soft text-xs font-medium">{{ label }}</span>
  </span>
</template>
