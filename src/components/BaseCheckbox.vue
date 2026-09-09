<script setup lang="ts">
import { computed, useId } from 'vue'

/**
 * A single checkbox, with its label beside it.
 *
 * Deliberately not built on `FormField`. That component stacks a label above
 * its control, which is right for every field where the control is a box you
 * type into and wrong here: a checkbox is read as one sentence with a mark in
 * front of it, and putting the words above the box breaks the association a
 * sighted reader makes before they get to the accessible name.
 *
 * The whole row is the label, so the words are part of the hit target. On a
 * phone that is the difference between a control and a coin toss.
 */
const {
  label,
  error = '',
  hint = '',
  disabled = false,
  size = 'md',
} = defineProps<{
  label: string
  error?: string | undefined
  hint?: string | undefined
  disabled?: boolean | undefined
  /**
   * `md` is a setting: a line the reader came here to change, in ink.
   * `sm` is an aside — "remember me" under a sign-in form, "show the ones I
   * have learned" above a list — quieter and tighter.
   *
   * The two are not a guess. Of the five hand-written checkboxes across the
   * three consuming apps, four were the aside and one was the setting, and
   * they differed in exactly these two ways.
   */
  size?: 'sm' | 'md' | undefined
}>()

const model = defineModel<boolean>({ default: false })

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
    <label
      :for="id"
      class="flex items-center"
      :class="[size === 'sm' ? 'gap-2' : 'gap-3', disabled ? 'opacity-50' : 'cursor-pointer']"
    >
      <input
        :id="id"
        v-model="model"
        type="checkbox"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy"
        class="accent-primary focus-visible:outline-primary size-4 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
      />
      <span class="text-sm" :class="size === 'sm' ? 'text-ink-soft' : 'text-ink'">
        {{ label }}
      </span>
    </label>

    <p v-if="error" :id="errorId" class="text-negative text-xs">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="text-ink-soft text-xs">{{ hint }}</p>
  </div>
</template>
