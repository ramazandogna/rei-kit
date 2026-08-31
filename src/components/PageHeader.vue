<script setup lang="ts">
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
