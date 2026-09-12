<script lang="ts" setup>
/**
 * A list with nothing in it yet, said kindly.
 *
 * A blank area reads as a page that failed to load, and the reader's first
 * thought is that something is broken rather than that they have not started.
 * So there is always a sentence, and the slot below it is where the way out
 * goes — the button that creates the first one.
 */
const { title, description = '' } = defineProps<{
  title: string
  description?: string | undefined
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 px-6 py-10 text-center">
    <div
      v-if="$slots.icon"
      class="bg-muted text-primary rounded-card flex size-12 items-center justify-center"
    >
      <slot name="icon" />
    </div>

    <h3 class="text-ink text-base font-semibold">{{ title }}</h3>
    <p v-if="description" class="text-ink-soft max-w-[36ch] text-sm">
      {{ description }}
    </p>

    <div v-if="$slots.action" class="mt-2 flex w-full flex-col gap-2">
      <slot name="action" />
    </div>
  </div>
</template>

<style></style>
