<script setup lang="ts" generic="T extends string | number | undefined = string">
import { computed, useSlots } from 'vue'
import type { InputHTMLAttributes } from 'vue'

import FormField from './FormField.vue'
import { useFieldAttrs } from '../composables/use-field-attrs'
import { useBoundValue } from '../composables/use-bound-value'

defineOptions({ inheritAttrs: false })

const { fieldClass, fieldStyle, controlAttrs } = useFieldAttrs()

/**
 * A text field with its label, hint and error already wired to it.
 *
 * Every attribute of a native input — `placeholder`, `autocomplete`,
 * `inputmode` — goes to the input itself, not to the wrapper around it.
 */
const {
  modelValue = undefined,
  label,
  error = '',
  hint = '',
  type = 'text',
  labelHidden = false,
  size = 'md',
  variant = 'default',
} = defineProps<
  {
    /** The value, with `v-model`. Its type is whatever you bind. */
    modelValue?: T | undefined
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

/* `unstyled` is "the wiring without the paint", so it has no surface to
   attach anything to; an addon there would be the paint coming back. */
const slots = useSlots()

const grouped = computed(() => variant !== 'unstyled' && Boolean(slots.prefix || slots.suffix))

/**
 * A number field's value is a number.
 *
 * Typed to `string` alone, `type="number"` forced the caller to keep a string
 * ref and convert on both sides of it — and a component you have to wrap in
 * order to use is one you write yourself instead, which is exactly what the
 * first numeric field tried to reach for it did.
 *
 * Generic rather than `string | number`, so the value is whatever the app
 * bound: a `ref('')` gets strings back and a `ref(0)` numbers, and a
 * `string | undefined` from a form library is accepted as it is.
 */
/**
 * Something attached to the field: a currency mark, a unit, a button.
 *
 * Both of these were written by hand inside this kit before they were a
 * slot — `PasswordInput` positions a toggle over the field and `NumberInput`
 * two steppers — and an app that wanted "€" in front of an amount had to
 * rebuild the whole field to get it, losing the label wiring and
 * `aria-describedby` on the way. That is the gap test, with the kit itself
 * as the app.
 *
 * Given either slot, the border and the ground move to a wrapper and the
 * input goes transparent inside it, so the edge encloses the addon whatever
 * width it is. With neither, the field renders exactly as it did before the
 * slots existed.
 *
 * **What goes in them is yours, including whether it is read out.** A `€`
 * beside a field labelled "Amount" is decoration and belongs behind
 * `aria-hidden`; a unit that is the only place "kilograms" appears is not,
 * and belongs in the label instead. The kit cannot tell which it is.
 */
defineSlots<{
  prefix?: () => unknown
  suffix?: () => unknown
}>()

const emit = defineEmits<{ 'update:modelValue': [value: T] }>()
// The destructured prop is typed by T's constraint, not by T itself — a
// limit of destructuring in a generic component — so it is narrowed here.
const model = useBoundValue<T>(
  () => modelValue as T | undefined,
  (value) => emit('update:modelValue', value),
)
</script>

<template>
  <FormField
    :class="fieldClass"
    :style="fieldStyle"
    :label="label"
    :error="error"
    :hint="hint"
    :label-hidden="labelHidden"
    :size="size"
  >
    <template #default="{ id, describedBy, invalid }">
      <!-- The grouped shape: the wrapper is the control, the input is bare
           inside it. `has-[:focus-visible]` rather than `focus-within` so a
           mouse press does not ring the whole group, which is how the rest
           of the kit behaves. -->
      <div
        v-if="grouped"
        class="control rounded-card has-focus-visible:outline-primary flex items-stretch overflow-hidden has-focus-visible:outline-2 has-focus-visible:outline-offset-1"
        :class="[CONTROL_CLASS, invalid ? 'border-negative' : '']"
      >
        <span v-if="$slots.prefix" class="text-ink-soft flex shrink-0 items-center ps-3">
          <slot name="prefix" />
        </span>

        <input
          :id="id"
          v-model="model"
          :type="type"
          :aria-invalid="invalid"
          :aria-describedby="describedBy"
          v-bind="controlAttrs"
          class="text-ink min-w-0 flex-1 bg-transparent px-3 text-base focus-visible:outline-none"
        />

        <span v-if="$slots.suffix" class="text-ink-soft flex shrink-0 items-center pe-3">
          <slot name="suffix" />
        </span>
      </div>

      <input
        v-else
        :id="id"
        v-model="model"
        :type="type"
        :aria-invalid="invalid"
        :aria-describedby="describedBy"
        v-bind="controlAttrs"
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
