<script setup lang="ts">
import { computed, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const {
  label,
  error = '',
  hint = '',
  type = 'text',
  labelHidden = false,
} = defineProps<{
  label: string
  error?: string | undefined
  hint?: string | undefined
  /**
   * Hides the label visually but keeps it for assistive tech. For fields whose
   * surrounding row already names them — dropping the label entirely would
   * leave the input with no accessible name at all.
   */
  labelHidden?: boolean
  type?: 'text' | 'email' | 'password' | 'number'
}>()

const model = defineModel<string | undefined>()

const id = useId()
const errorId = `${id}-error`
const hintId = `${id}-hint`

const describedBy = computed(() => {
  if (error) return errorId
  if (hint) return hintId
  return undefined
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-ink text-sm font-medium" :class="labelHidden ? 'sr-only' : ''">
      {{ label }}
    </label>

    <input
      :id="id"
      v-model="model"
      :type="type"
      :aria-invalid="Boolean(error)"
      :aria-describedby="describedBy"
      v-bind="$attrs"
      class="border-hair bg-surface text-ink rounded-card focus-visible:outline-primary h-11 border px-3 focus-visible:outline-2 focus-visible:outline-offset-1"
      :class="error ? 'border-negative' : ''"
    />

    <p v-if="error" :id="errorId" class="text-negative text-xs">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="text-ink-soft text-xs">{{ hint }}</p>
  </div>
</template>
