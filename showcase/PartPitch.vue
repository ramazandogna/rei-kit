<script setup lang="ts">
import { computed } from 'vue'

/**
 * A line of copy where a backtick means code.
 *
 * The pitches are authored in `*-parts.ts` as plain strings and were rendered
 * as text, so nine of them printed their backticks: "and with
 * `dismissible: false` neither does". Every other part of the page sets code
 * in a `<code>`, so the markdown was both visible and inconsistent.
 *
 * Split rather than `v-html`: the strings are ours, but a component that
 * interpolates HTML is one somebody later hands a string from a prop.
 */
const { text } = defineProps<{ text: string }>()

/* Odd indices are what sat between a pair of backticks. */
const runs = computed(() =>
  text.split('`').map((run, index) => ({ run, code: index % 2 === 1, key: index })),
)
</script>

<template>
  <p>
    <template v-for="part in runs" :key="part.key">
      <code v-if="part.code" class="rounded-cell control px-1 py-0.5 font-mono text-[0.8em]">{{
        part.run
      }}</code>
      <template v-else>{{ part.run }}</template>
    </template>
  </p>
</template>
