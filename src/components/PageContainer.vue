<script setup lang="ts">
import { computed } from 'vue'

/**
 * One measure, centred, with the page's gutters.
 *
 * The first thing a desktop app needs and the last thing a kit built for
 * phones thinks to provide — a 430 px shell has no use for a maximum width, so
 * this was missing, and the consuming app wrote `max-w-[1200px] mx-auto px-6`
 * into every layout instead. Written once it costs nothing; written eleven
 * times it is eleven chances for one page to be forty pixels narrower than the
 * rest, which is the kind of thing nobody can name and everybody can see.
 *
 * Two widths rather than one, because a page and a passage are different
 * problems: `wide` is the page, `reading` is a column of prose at the width
 * type wants to be read at.
 */
const { width = 'wide', as = 'div' } = defineProps<{
  /** `wide` for a page, `reading` for prose, `full` to opt out. */
  width?: 'wide' | 'reading' | 'full'
  /** The element to render. `main`, `section` and `article` all belong here. */
  as?: string
}>()

const WIDTHS = {
  wide: 'max-w-[75rem]',
  // ~68 characters. Longer than this and the eye loses the line it was on.
  reading: 'max-w-[68ch]',
  full: '',
} as const

const measure = computed(() => WIDTHS[width])
</script>

<template>
  <component :is="as" class="mx-auto w-full px-5 sm:px-8" :class="measure">
    <slot />
  </component>
</template>
