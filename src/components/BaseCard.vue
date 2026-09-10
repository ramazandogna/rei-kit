<script setup lang="ts">
/**
 * A surface with a border, and optionally a head and a foot.
 *
 * Every app here had written this div. That is not a crisis on its own — it is
 * four classes — but it is four classes that were slightly different in each,
 * so a card on one screen had a heavier border than a card on the next and
 * nobody could say why.
 *
 * With no head and no foot there is no wrapper div: the padding lands on the
 * card itself and the card *is* the element. That matters more than a saved
 * node — most cards in the apps lay their contents out (`flex items-center
 * gap-4`, `flex flex-col gap-3`), and with a wrapper in the way those classes
 * reach the border and not the content, so the app has to add back the div
 * this component exists to remove. One that makes you do that is one you skip.
 *
 * `interactive` is for a card that is a link or a button: it adds the lift and
 * the press, and it is opt-in because a card holding a form should not move
 * when the pointer crosses it.
 */
const {
  interactive = false,
  as = 'div',
  padding = 'md',
} = defineProps<{
  interactive?: boolean | undefined
  as?: string | undefined
  /**
   * How much room the card gives its contents.
   *
   * This component shipped with `px-5 py-4` baked in and was then used by
   * nobody, across three apps and thirty-five hand-written card surfaces —
   * which used `p-3` six times, `p-4` six times, `p-5` five times and `p-1`
   * four times, and not once the pair this insisted on. A card that fixes its
   * padding cannot be reached for, which is the same mistake `PageContainer`
   * made with its width and `size="sm"` made with its height.
   *
   * `none` is for a card that holds a list: the rows own the padding, and the
   * dividers have to reach the border.
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | undefined
}>()

const BODY = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
} as const

/* The head and the foot follow the body, so a card cannot be tight around its
   contents and loose around its title. */
const HEAD = {
  none: '',
  sm: 'px-3 py-2.5',
  md: 'px-4 py-3',
  lg: 'px-5 py-4',
} as const
</script>

<template>
  <component
    :is="as"
    class="border-hair bg-surface rounded-card border"
    :class="[
      interactive
        ? 'transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm'
        : '',
      $slots.head || $slots.foot ? '' : BODY[padding],
    ]"
  >
    <div v-if="$slots.head" class="border-hair/70 border-b" :class="HEAD[padding]">
      <slot name="head" />
    </div>

    <div v-if="$slots.head || $slots.foot" :class="BODY[padding]"><slot /></div>
    <slot v-else />

    <div v-if="$slots.foot" class="border-hair/70 bg-muted/30 border-t" :class="HEAD[padding]">
      <slot name="foot" />
    </div>
  </component>
</template>
