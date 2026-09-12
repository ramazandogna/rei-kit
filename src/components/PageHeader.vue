<script setup lang="ts">
/**
 * The bar at the top of a screen: a title with room either side of it.
 *
 * Three fixed columns rather than a flex row, so the title is centred on the
 * screen rather than centred on what is left after the buttons. A back arrow on
 * one side and nothing on the other would otherwise push every title off centre
 * by exactly half a button, which is visible the moment two screens sit next to
 * each other.
 */
const { title } = defineProps<{ title: string }>()
</script>

<template>
  <header class="grid h-12 shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center">
    <div class="justify-self-start"><slot name="left" /></div>

    <h1 class="text-ink flex min-w-0 justify-center text-base font-semibold tabular-nums">
      <slot name="title">
        <span class="truncate">{{ title }}</span>
      </slot>
    </h1>

    <div class="justify-self-end"><slot name="right" /></div>
  </header>
</template>
