<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

import FormField from './FormField.vue'

/**
 * A native `<select>`, wearing the kit's field.
 *
 * Native on purpose. A custom listbox has to reimplement typeahead, the
 * keyboard, and the way a phone lifts the options into its own picker — and it
 * gets one of them wrong. What is worth replacing is the chrome, so the arrow
 * is drawn and the browser's own is removed.
 *
 * Options are passed rather than slotted so the value can be anything and the
 * label can be a translated string the kit never sees.
 */
const {
  label,
  options,
  error = '',
  hint = '',
  labelHidden = false,
  placeholder = '',
  size = 'md',
} = defineProps<{
  label: string
  options: readonly { value: string; label: string; disabled?: boolean | undefined }[]
  error?: string | undefined
  hint?: string | undefined
  labelHidden?: boolean | undefined
  /**
   * An unselectable first row, for a field with no sensible default.
   *
   * Disabled rather than merely empty: an empty option that can be chosen lets
   * someone go back to having answered nothing, which no form wants.
   */
  placeholder?: string | undefined
  /**
   * `sm` for a select that filters or sorts rather than answers a form.
   *
   * Every hand-written select across the three consuming apps was this one.
   */
  size?: 'sm' | 'md' | undefined
}>()

/* The control's own scale. `md` states the type size the kit had been leaving
   to whatever the host page happened to set — two consumers force 16px on
   form elements to stop iOS zooming, a third does not, so the same component
   rendered at two sizes depending on the app. */
const SIZE_CLASS = {
  sm: 'h-9 text-sm',
  md: 'h-11 text-base',
} as const

const model = defineModel<string | undefined>()
</script>

<template>
  <FormField :label="label" :error="error" :hint="hint" :label-hidden="labelHidden" :size="size">
    <template #default="{ id, describedBy, invalid }">
      <div class="relative">
        <select
          :id="id"
          v-model="model"
          :aria-invalid="invalid"
          :aria-describedby="describedBy"
          class="border-hair bg-surface text-ink rounded-card focus-visible:outline-primary w-full appearance-none border py-0 pr-10 pl-3 focus-visible:outline-2 focus-visible:outline-offset-1"
          :class="[SIZE_CLASS[size], invalid ? 'border-negative' : '']"
        >
          <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
          <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </select>

        <ChevronDown
          class="text-ink-soft pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>
    </template>
  </FormField>
</template>
