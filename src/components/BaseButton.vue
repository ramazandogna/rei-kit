<script setup lang="ts">
const {
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
} = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | undefined
  size?: 'sm' | 'md' | undefined
  loading?: boolean | undefined
  disabled?: boolean | undefined
  type?: 'button' | 'submit' | undefined
}>()

const VARIANT_CLASS = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  /*
   * An action that is real but not the one being urged.
   *
   * `ghost` had been standing in for this and cannot: with no border and no
   * fill it reads as text, so "Save draft" sitting next to "Publish" looked
   * like a caption rather than the other half of a choice. Ghost is for a
   * control that should recede until it is wanted — a toolbar, a menu row —
   * and that is a different job.
   */
  secondary: 'border-hair bg-surface text-ink border hover:bg-muted',
  ghost: 'bg-transparent text-ink hover:bg-muted',
  danger: 'bg-negative text-white hover:bg-negative/90',
} as const

const SIZE_CLASS = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
} as const
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    class="rounded-card focus-visible:outline-primary inline-flex items-center justify-center gap-2 font-medium transition-transform duration-100 select-none focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
    :class="[VARIANT_CLASS[variant], SIZE_CLASS[size]]"
  >
    <span
      v-if="loading"
      class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
