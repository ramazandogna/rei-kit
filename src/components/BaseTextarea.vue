<script setup lang="ts">
import FormField from './FormField.vue'

/**
 * A multi-line field.
 *
 * `rows` rather than an auto-growing box: a textarea that resizes as it is
 * typed into moves everything below it, and in a form that means the button
 * the writer is heading for keeps sliding away. Growth is left to the browser's
 * own resize handle, which the writer controls.
 */
defineOptions({ inheritAttrs: false })

const {
  label,
  error = '',
  hint = '',
  labelHidden = false,
  rows = 4,
  size = 'md',
} = defineProps<{
  label: string
  error?: string | undefined
  hint?: string | undefined
  labelHidden?: boolean | undefined
  rows?: number | undefined
  /** `sm` for editing in place, inside a row that is already small. */
  size?: 'sm' | 'md' | undefined
}>()

const model = defineModel<string | undefined>()
</script>

<template>
  <FormField :label="label" :error="error" :hint="hint" :label-hidden="labelHidden" :size="size">
    <template #default="{ id, describedBy, invalid }">
      <textarea
        :id="id"
        v-model="model"
        :rows="rows"
        :aria-invalid="invalid"
        :aria-describedby="describedBy"
        v-bind="$attrs"
        class="border-hair bg-surface text-ink rounded-card focus-visible:outline-primary resize-y border px-3 py-2 leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-1"
        :class="[size === 'sm' ? 'text-sm' : 'text-base', invalid ? 'border-negative' : '']"
      />
    </template>
  </FormField>
</template>
