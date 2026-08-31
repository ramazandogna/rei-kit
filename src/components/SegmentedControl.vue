<script setup lang="ts" generic="T extends string | number">
import { useId } from 'vue'

/**
 * A row of mutually exclusive choices.
 *
 * Radio inputs rather than buttons: it is a single choice out of a small set,
 * so arrow-key navigation and the "one of N selected" announcement come free.
 */
const { options } = defineProps<{
  options: readonly { value: T; label: string }[]
}>()

const model = defineModel<T>({ required: true })

const name = useId()
</script>

<template>
  <div class="bg-muted rounded-card flex w-full gap-1 p-1">
    <label v-for="option in options" :key="String(option.value)" class="flex-1 cursor-pointer">
      <input v-model="model" type="radio" :value="option.value" :name="name" class="sr-only" />
      <span
        class="flex h-10 items-center justify-center rounded-xl px-2 text-sm font-medium transition-colors select-none"
        :class="model === option.value ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft'"
      >
        {{ option.label }}
      </span>
    </label>
  </div>
</template>
