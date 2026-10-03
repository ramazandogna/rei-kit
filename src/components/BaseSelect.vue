<script setup lang="ts" generic="T extends string | number">
import { ref } from 'vue'
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
 * Options are passed rather than slotted so the label can be a translated
 * string the kit never sees.
 *
 * Generic over the value, because a select whose value must be a string makes
 * every consumer with numbered options write conversion glue on both sides of
 * it — and a component you have to wrap to use is one you write yourself
 * instead. A day of the month is a number.
 */
const {
  label,
  options,
  error = '',
  hint = '',
  labelHidden = false,
  placeholder = '',
  size = 'md',
  variant = 'default',
  fieldId = undefined,
  controlClass = undefined,
} = defineProps<{
  label: string
  options: readonly { value: T; label: string; disabled?: boolean | undefined }[]
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

/* The scale is typographic, not dimensional. Both sizes keep the 44px touch
   target — of the five hand-written controls this replaces, none was shorter
   than 40px and two were exactly 44, and a select that filters a list is
   pressed with the same thumb as one that answers a form. What changes is the
   type, and with it how loudly the field asks to be read. */
const SIZE_CLASS = {
  sm: 'h-11 text-sm',
  md: 'h-11 text-base',
} as const

const model = defineModel<T | undefined>()
const control = ref<HTMLSelectElement | null>(null)

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
    :label="label"
    :error="error"
    :hint="hint"
    :label-hidden="labelHidden"
    :size="size"
  >
    <template #default="{ id, describedBy, invalid }">
      <div class="relative">
        <select
          :id="id"
          ref="control"
          v-model="model"
          :aria-invalid="invalid"
          :aria-describedby="describedBy"
          class="w-full appearance-none"
          :class="[
            variant === 'unstyled'
              ? ''
              : 'control text-ink rounded-card focus-visible:outline-primary py-0 pr-10 pl-3 focus-visible:outline-2 focus-visible:outline-offset-1',
            variant === 'unstyled' ? '' : SIZE_CLASS[size],
            variant !== 'unstyled' && invalid ? 'border-negative' : '',
            controlClass,
          ]"
        >
          <option v-if="placeholder" :value="undefined" disabled>{{ placeholder }}</option>
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
