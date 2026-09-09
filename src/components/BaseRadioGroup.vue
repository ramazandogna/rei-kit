<script setup lang="ts">
import { computed, useId } from 'vue'

/**
 * A set of radios, and the reason there is no `BaseRadio`.
 *
 * One radio on its own is not a control — it is half of a choice that cannot
 * be unmade, and every real use is a group. So the group is the component.
 *
 * `fieldset` and `legend` rather than a label: a label points at one element,
 * and the thing being named here is the question, not any single answer. Left
 * as a plain label, a screen reader reads the options with no idea what they
 * are options for.
 */
const {
  legend,
  options,
  error = '',
  hint = '',
  legendHidden = false,
} = defineProps<{
  legend: string
  options: readonly { value: string; label: string; disabled?: boolean | undefined }[]
  error?: string | undefined
  hint?: string | undefined
  legendHidden?: boolean | undefined
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
  <fieldset class="flex flex-col gap-1.5" :aria-describedby="describedBy">
    <legend class="text-ink mb-1.5 text-sm font-medium" :class="legendHidden ? 'sr-only' : ''">
      {{ legend }}
    </legend>

    <label
      v-for="option in options"
      :key="option.value"
      class="flex items-center gap-3"
      :class="option.disabled ? 'opacity-50' : 'cursor-pointer'"
    >
      <input
        v-model="model"
        type="radio"
        :name="id"
        :value="option.value"
        :disabled="option.disabled"
        class="accent-primary focus-visible:outline-primary size-4 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
      />
      <span class="text-ink text-sm">{{ option.label }}</span>
    </label>

    <p v-if="error" :id="errorId" class="text-negative text-xs">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="text-ink-soft text-xs">{{ hint }}</p>
  </fieldset>
</template>
