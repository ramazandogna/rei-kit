<script setup lang="ts" generic="T extends string | number | undefined = string">
import type { InputHTMLAttributes } from 'vue'

import FormField from './FormField.vue'

defineOptions({ inheritAttrs: false })

/**
 * A text field with its label, hint and error already wired to it.
 *
 * Every attribute of a native input — `placeholder`, `autocomplete`,
 * `inputmode` — goes to the input itself, not to the wrapper around it.
 */
const {
  label,
  error = '',
  hint = '',
  type = 'text',
  labelHidden = false,
  size = 'md',
  variant = 'default',
} = defineProps<
  {
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
    /* The input's own attributes — `placeholder`, `autocomplete`, `inputmode` —
     typed for strictTemplates and passed to the input through `$attrs`. Not
     `size` and `type`, which are this component's own. */
  } & /* @vue-ignore */ Omit<InputHTMLAttributes, 'size' | 'type'>
>()

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
 *
 * Generic rather than `string | number`, so the model is whatever the app
 * bound: a `ref('')` gets strings back and a `ref(0)` numbers. The union
 * could not be written into either under strictTemplates. The default
 * is still `undefined` at runtime — the cast only tells Vue what a field
 * emits once typed into, which is a value of the bound type, never nothing. (`as never`, because
 * Vue cannot resolve a default's type for an open generic.)
 */
const model = defineModel<Exclude<T, undefined>>({ default: undefined as never })
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
            : 'control text-ink rounded-card focus-visible:outline-primary px-3 focus-visible:outline-2 focus-visible:outline-offset-1',
          variant === 'unstyled' ? 'text-base' : CONTROL_CLASS,
          variant !== 'unstyled' && invalid ? 'border-negative' : '',
        ]"
      />
    </template>
  </FormField>
</template>
