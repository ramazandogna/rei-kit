<script setup lang="ts">
import FormField from './FormField.vue'

defineOptions({ inheritAttrs: false })

const {
  label,
  error = '',
  hint = '',
  type = 'text',
  labelHidden = false,
  size = 'md',
} = defineProps<{
  label: string
  error?: string | undefined
  hint?: string | undefined
  /**
   * Hides the label visually but keeps it for assistive tech. For fields whose
   * surrounding row already names them — dropping the label entirely would
   * leave the input with no accessible name at all.
   */
  labelHidden?: boolean | undefined
  type?: 'text' | 'email' | 'password' | 'number' | undefined
  /** `sm` for a field inside a row rather than in a form of its own. */
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
      <input
        :id="id"
        v-model="model"
        :type="type"
        :aria-invalid="invalid"
        :aria-describedby="describedBy"
        v-bind="$attrs"
        class="border-hair bg-surface text-ink rounded-card focus-visible:outline-primary border px-3 focus-visible:outline-2 focus-visible:outline-offset-1"
        :class="[SIZE_CLASS[size], invalid ? 'border-negative' : '']"
      />
    </template>
  </FormField>
</template>
