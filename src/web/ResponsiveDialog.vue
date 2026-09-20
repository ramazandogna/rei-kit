<script setup lang="ts">
import { computed } from 'vue'

import BaseSheet from '../components/BaseSheet.vue'
import { useMediaQuery } from '../composables/use-media-query'
import BaseModal from './BaseModal.vue'

/**
 * One question, asked the way the screen it lands on expects: a modal on a
 * wide screen, a sheet from the bottom edge on a phone.
 *
 * The two are the same thing at different sizes, and apps keep writing both
 * and choosing between them by hand — which is two markups, two sets of
 * labels and one of them usually left behind.
 *
 * The query is read after mount rather than during render: a server has no
 * screen, and a layout guessed there and swapped on hydration is a page that
 * jumps. Until it is known, it is the sheet — the narrow answer, because the
 * narrow one fits on both.
 */
const {
  title,
  closeLabel,
  subtitle = '',
  tone = 'default',
  dismissible = true,
  breakpoint = '48rem',
} = defineProps<{
  /** The dialog's heading, and its accessible name. Already translated. */
  title: string
  /** Accessible name of the close button. */
  closeLabel: string
  /** A line under the title, on the sheet. */
  subtitle?: string | undefined
  /** `alert` makes the wide one an `alertdialog`: an answer is required. */
  tone?: 'default' | 'alert' | undefined
  dismissible?: boolean | undefined
  /** Where it turns from a sheet into a modal. Any media width. */
  breakpoint?: string | undefined
}>()

defineSlots<{
  /** The body. */
  default: () => unknown
  /** Buttons, at the foot. */
  actions?: () => unknown
}>()

/** Open or closed, with `v-model`. */
const open = defineModel<boolean>({ default: false })

const wide = useMediaQuery(`(min-width: ${breakpoint})`)
const asModal = computed(() => wide.value)
</script>

<template>
  <BaseModal
    v-if="asModal"
    v-model="open"
    :title="title"
    :close-label="closeLabel"
    :tone="tone"
    :dismissible="dismissible"
  >
    <slot />

    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
  </BaseModal>

  <BaseSheet v-else v-model="open" :title="title" :subtitle="subtitle" :close-label="closeLabel">
    <slot />

    <div v-if="$slots.actions" class="rk-responsive-actions">
      <slot name="actions" />
    </div>
  </BaseSheet>
</template>

<style scoped>
/* The sheet has no actions slot of its own: on a phone the buttons belong in
   the flow, at the end of what they are about, within reach of a thumb. */
.rk-responsive-actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  padding-top: 1rem;
}
</style>
