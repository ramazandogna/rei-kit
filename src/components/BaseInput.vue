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
  variant = 'default',
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

/**
 * A number field's value is a number.
 *
 * Typed to `string` alone, `type="number"` forced the caller to keep a string
 * ref and convert on both sides of it — and a component you have to wrap in
 * order to use is one you write yourself instead, which is exactly what the
 * first numeric field tried to reach for it did.
 */
const model = defineModel<string | number | undefined>()
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
        :class="[
          variant === 'unstyled'
            ? ''
            : 'border-hair bg-surface text-ink rounded-card focus-visible:outline-primary border px-3 focus-visible:outline-2 focus-visible:outline-offset-1',
          variant === 'unstyled' ? 'text-base' : CONTROL_CLASS,
          variant !== 'unstyled' && invalid ? 'border-negative' : '',
        ]"
      />
    </template>
  </FormField>
</template>
