<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { Component } from 'vue'

/**
 * One line in a settings card.
 *
 * `as` decides the element: a row that navigates has to be a button, and a row
 * that merely holds a control must not be, or the control becomes unreachable.
 */
const {
  label,
  description = '',
  icon = undefined,
  interactive = false,
  stacked = false,
} = defineProps<{
  label: string
  description?: string
  icon?: Component | undefined
  /** Renders the row as a button with a chevron. */
  interactive?: boolean
  /** Puts the control on its own line below the label, for wide controls. */
  stacked?: boolean
}>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    class="flex w-full items-center gap-3 px-4 py-3 text-left"
    :class="[
      interactive ? 'hover:bg-muted/60 transition-colors active:scale-[0.99]' : '',
      stacked ? 'flex-col items-stretch gap-3' : '',
    ]"
    @click="interactive && emit('click')"
  >
    <div class="flex items-center gap-3">
      <span
        v-if="icon"
        class="bg-muted text-ink-soft flex size-9 shrink-0 items-center justify-center rounded-xl"
        aria-hidden="true"
      >
        <component :is="icon" class="size-[18px]" />
      </span>

      <div class="min-w-0 flex-1">
        <p class="text-ink text-sm font-medium">{{ label }}</p>
        <p v-if="description" class="text-ink-soft mt-0.5 text-xs leading-snug">
          {{ description }}
        </p>
      </div>

      <div v-if="!stacked" class="shrink-0"><slot /></div>

      <ChevronRight v-if="interactive" class="text-ink-soft size-4 shrink-0" aria-hidden="true" />
    </div>

    <div v-if="stacked"><slot /></div>
  </component>
</template>
