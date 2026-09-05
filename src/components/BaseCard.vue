<script setup lang="ts">
/**
 * A surface with a border, and optionally a head and a foot.
 *
 * Every app here had written this div. That is not a crisis on its own — it is
 * four classes — but it is four classes that were slightly different in each,
 * so a card on one screen had a heavier border than a card on the next and
 * nobody could say why.
 *
 * `interactive` is for a card that is a link or a button: it adds the lift and
 * the press, and it is opt-in because a card holding a form should not move
 * when the pointer crosses it.
 */
const { interactive = false, as = 'div' } = defineProps<{
  interactive?: boolean
  as?: string
}>()
</script>

<template>
  <component
    :is="as"
    class="border-hair bg-surface rounded-card border"
    :class="
      interactive
        ? 'transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm'
        : ''
    "
  >
    <div v-if="$slots.head" class="border-hair/70 border-b px-5 py-4">
      <slot name="head" />
    </div>

    <div class="px-5 py-4">
      <slot />
    </div>

    <div v-if="$slots.foot" class="border-hair/70 bg-muted/30 border-t px-5 py-3.5">
      <slot name="foot" />
    </div>
  </component>
</template>
