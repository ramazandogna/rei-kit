<script setup lang="ts">
/**
 * A titled run of settings rows.
 *
 * The heading is a real `h2` rather than styled text, because a settings screen
 * is long and the headings are how somebody moves through it without reading
 * all of it. Uppercase and quiet in the design, structural in the markup.
 */
defineProps<{ title: string }>()
</script>

<template>
  <section class="flex flex-col gap-2">
    <h2 class="text-ink-soft px-1 text-xs font-semibold tracking-wide uppercase">{{ title }}</h2>

    <!-- One card per group, rows divided by hairlines. Loose fields floating on
         the page gave no sense of what belonged with what. -->
    <div class="border-hair bg-surface rounded-card divide-hair divide-y overflow-hidden border">
      <slot />
    </div>
  </section>
</template>
