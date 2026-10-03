<script setup lang="ts">
import { ref } from 'vue'
import { useBoundValue } from '../composables/use-bound-value'
import FormField from './FormField.vue'
import { useFieldAttrs } from '../composables/use-field-attrs'

/**
 * A multi-line field.
 *
 * `rows` rather than an auto-growing box: a textarea that resizes as it is
 * typed into moves everything below it, and in a form that means the button
 * the writer is heading for keeps sliding away. Growth is left to the browser's
 * own resize handle, which the writer controls.
 */
defineOptions({ inheritAttrs: false })

const { fieldClass, fieldStyle, controlAttrs } = useFieldAttrs()

const {
  modelValue = undefined,
  label,
  error = '',
  hint = '',
  labelHidden = false,
  rows = 4,
  size = 'md',
  variant = 'default',
  fieldId = undefined,
  controlClass = undefined,
} = defineProps<{
  /** The text, with `v-model`. */
  modelValue?: string | undefined
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
  /**
   * Ties the generated id to a name you choose, so `ErrorSummary` can link
   * to this field. Its links point at nothing without it, and the kit's
   * own `FormField` has taken one since 2.22.0 while the fields built on
   * it did not — which left building a form out of these and summarising
   * its errors impossible without hand-writing the control.
   */
  fieldId?: string | undefined
  /**
   * Classes for the control itself, rather than for the field around it.
   *
   * `class` lands on the field, because that is where Vue puts a
   * component's class and because a layout class means "space this field".
   * That leaves `variant="unstyled"` with no way to paint the control it
   * just stripped — the point of stripping it — which is why an app with a
   * large amount field wrote the whole thing by hand instead.
   *
   * It appends, so with the default variant a conflict is settled by
   * Tailwind's own order rather than by writing it here; reach for it with
   * `unstyled`, where there is nothing to settle.
   */
  controlClass?: string | undefined
}>()

/* Declared by hand rather than with defineModel: it accepts `undefined` and
   emits only strings, which defineModel cannot type both ways. See
   `use-bound-value.ts`. */
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const model = useBoundValue(
  () => modelValue,
  (value) => emit('update:modelValue', value),
)
const control = ref<HTMLTextAreaElement | null>(null)

/**
 * Focus the control, for a caller that owns when it happens.
 *
 * A `ref` on a component gives the component and not the element, so without
 * this a field cannot be focused at all — which is why an app that focuses
 * its amount field when a sheet opens, and again when the amount is
 * rejected, wrote the whole field by hand instead and said so in a comment.
 * That is the gap test, with the reason already written down.
 *
 * `ErrorSummary` has exposed `focus` since it existed, for the same need
 * from the other end.
 */
function focus() {
  control.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <FormField
    :field-id="fieldId"
    :class="fieldClass"
    :style="fieldStyle"
    :label="label"
    :error="error"
    :hint="hint"
    :label-hidden="labelHidden"
    :size="size"
  >
    <template #default="{ id, describedBy, invalid }">
      <textarea
        :id="id"
        ref="control"
        v-model="model"
        :rows="rows"
        :aria-invalid="invalid"
        :aria-describedby="describedBy"
        v-bind="controlAttrs"
        :class="[
          variant === 'unstyled'
            ? ''
            : 'control text-ink rounded-card focus-visible:outline-primary resize-y px-3 py-2 leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-1',
          'text-base',
          variant !== 'unstyled' && invalid ? 'border-negative' : '',
          controlClass,
        ]"
      />
    </template>
  </FormField>
</template>
