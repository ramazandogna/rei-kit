<script setup lang="ts">
/**
 * The frame every sign-in screen sits in.
 *
 * A brand mark, a narrow column, and the language links pinned to the bottom.
 * The two phone apps had this file character for character — thirty-seven
 * lines, no difference at all — and the only thing either would want to change
 * is what goes in the slots.
 *
 * The language links matter more than they look. Sign-in is the first screen a
 * new user sees and Settings is behind it, so without a way to switch here,
 * somebody who does not read the browser's language cannot get to one.
 */
defineSlots<{
  /** The brand mark. */
  brand?: () => unknown
  /** The form. */
  default: () => unknown
  /** The language links, or anything else that belongs at the foot. */
  foot?: () => unknown
}>()
</script>

<template>
  <div
    class="flex min-h-0 w-full flex-1 flex-col items-center gap-8 overflow-y-auto px-6 pt-10 pb-10"
  >
    <slot name="brand" />

    <main class="w-full max-w-[22rem]">
      <slot />
    </main>

    <div v-if="$slots.foot" class="mt-auto">
      <slot name="foot" />
    </div>
  </div>
</template>
