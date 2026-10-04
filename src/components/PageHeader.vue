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
const { title, as = 'h1' } = defineProps<{
  title: string
  /**
   * The element the title is, when `h1` is not it.
   *
   * A screen's title is the page's one `h1`, which is the default. It is the
   * wrong answer in two places: a screen rendered inside another page — a
   * documentation site, a preview, a phone frame beside three others — and a
   * header that sits under a heading that already owns the rank. Both put a
   * second `h1` in the document, which is how this kit's own showcase ended
   * up with three.
   */
  as?: 'h1' | 'h2' | 'h3' | 'p' | undefined
}>()
</script>

<template>
  <header class="grid h-12 shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center">
    <div class="justify-self-start"><slot name="left" /></div>

    <component
      :is="as"
      class="text-ink flex min-w-0 justify-center text-base font-semibold tabular-nums"
    >
      <slot name="title">
        <span class="truncate">{{ title }}</span>
      </slot>
    </component>

    <div class="justify-self-end"><slot name="right" /></div>
  </header>
</template>
