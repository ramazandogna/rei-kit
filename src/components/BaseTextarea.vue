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
  variant = 'default',
} = defineProps<{
  label: string
  error?: string | undefined
  hint?: string | undefined
  labelHidden?: boolean | undefined
  rows?: number | undefined
  /**
   * `sm` tightens the label and the spacing. It does **not** shrink the text:
   * iOS zooms the viewport when it focuses a field under 16px and never zooms
   * back, which is why both phone apps force 16px on form elements in their
   * base layer.
   */
  size?: 'sm' | 'md' | undefined
  /**
   * `unstyled` keeps the wiring and drops the surface.
   *
   * The label, the generated id, `aria-describedby` and the error are what a
   * field is; the border and the height are what it looks like. A search box
   * inside a bordered row, a url field in an editor popover — those places
   * were hand-writing the whole thing to avoid the appearance, and losing the
   * wiring with it.
   *
   * The same reasoning as `BaseButton`'s `unstyled`, and the same test: a
   * primitive is finished when the app can take its behaviour without its
   * paint.
   */
  variant?: 'default' | 'unstyled' | undefined
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
        :class="[
          variant === 'unstyled'
            ? ''
            : 'border-hair bg-surface text-ink rounded-card focus-visible:outline-primary resize-y border px-3 py-2 leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-1',
          'text-base',
          variant !== 'unstyled' && invalid ? 'border-negative' : '',
        ]"
      />
    </template>
  </FormField>
</template>
