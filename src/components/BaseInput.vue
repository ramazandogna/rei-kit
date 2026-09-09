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
  /**
   * Every type a text field can be, because the ones missing were the ones
   * apps needed: `date` and `search` were hand-written three times each and
   * `url` twice, in files that already imported this component.
   */
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'search'
    | 'tel'
    | 'url'
    | 'date'
    | 'time'
    | 'datetime-local'
    | undefined
  /** `sm` for a field inside a row rather than in a form of its own. */
  size?: 'sm' | 'md' | undefined
}>()

/* The control keeps 16px at every size, and that is not a rounding of the
   scale — it is the rule. iOS zooms the viewport when a text field it is
   focusing has a font-size under 16px, and the page never zooms back. Both
   phone consumers had written `input { font-size: 16px }` into their base
   layer to stop exactly this, and a `text-sm` utility from here would have
   overridden it in every app at once.

   So `size` reaches the label and the spacing, through FormField, and leaves
   the typing target alone. `BaseSelect` is free to shrink: a select opens a
   native picker rather than a caret, and does not trigger the zoom. */
const CONTROL_CLASS = 'h-11 text-base'

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
        :class="[CONTROL_CLASS, invalid ? 'border-negative' : '']"
      />
    </template>
  </FormField>
</template>
