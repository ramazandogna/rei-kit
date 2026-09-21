<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { ref, type InputHTMLAttributes } from 'vue'

import FormField from './FormField.vue'

defineOptions({ inheritAttrs: false })

/**
 * A password field you can look at.
 *
 * The kit already ships `AuthForm` and `BaseInput type="password"`, which is
 * to say it ships the field and not the one thing every app then adds to it.
 * A password is the only field in a form whose value is hidden from the
 * person typing it, on the device where typing is least reliable — and a
 * generated password pasted into a phone is unverifiable without this. WCAG
 * 3.3.8 asks that authentication not depend on a cognitive function test;
 * being unable to see what you typed is one.
 *
 * The half that breaks, three ways, and all three compile:
 *
 * - **A `<button>` with no `type`.** Inside a form, its default is `submit`,
 *   so looking at the password submits the form — usually with a password
 *   half typed, which then arrives as a failed sign-in attempt.
 * - **A `<span>` or a bare icon.** Not focusable, not pressable by keyboard,
 *   and named nothing.
 * - **A change nobody is told about.** The characters appearing is the whole
 *   feedback, and it is visual only.
 *
 * The third is answered as a toggle button — one name, `aria-pressed` for
 * the state — rather than the swapped "Show"/"Hide" name that is the more
 * common shape. Two reasons. A name that changes under a focus that has not
 * moved is not reliably re-read, which is why every implementation of the
 * swapped-name version ends up adding a live region and two more sentences
 * on top of it; a pressed state on the focused control is announced by every
 * screen reader without one. And the kit has no language of its own, so the
 * cheaper pattern is also the one that asks the app for one string instead
 * of four.
 *
 * The field is never revealed by default and reverts to hidden on nothing:
 * that is deliberate. A component that hid it again on blur would be hiding
 * it at the exact moment the reader moved to the confirmation field to check
 * it against.
 */
const {
  modelValue = '',
  label,
  toggleLabel,
  error = '',
  hint = '',
  labelHidden = false,
  fieldId = undefined,
  size = 'md',
} = defineProps<
  {
    /** The value, with `v-model`. */
    modelValue?: string | undefined
    label: string
    /**
     * The toggle's name, e.g. "Show password". It does not change: the
     * control is pressed while the password is visible, and that state is
     * what a screen reader reads out.
     */
    toggleLabel: string
    error?: string | undefined
    hint?: string | undefined
    labelHidden?: boolean | undefined
    /** The input's `id`, for an `ErrorSummary` that links to this field. */
    fieldId?: string | undefined
    size?: 'sm' | 'md' | undefined
    /* The input's own attributes — `autocomplete`, `placeholder`, `required` —
     typed for strictTemplates. Not `type`, which is this component's whole
     subject, and not `size`. */
  } & /* @vue-ignore */ Omit<InputHTMLAttributes, 'size' | 'type'>
>()

const emit = defineEmits<{ 'update:modelValue': [value: string]; toggle: [visible: boolean] }>()

const visible = ref(false)

function toggle() {
  visible.value = !visible.value
  emit('toggle', visible.value)
}

/* The same 16px rule as `BaseInput`: iOS zooms the viewport for a focused
   field under it and never zooms back. */
const CONTROL_CLASS = 'h-11 text-base'
</script>

<template>
  <FormField
    :label="label"
    :error="error"
    :hint="hint"
    :label-hidden="labelHidden"
    :field-id="fieldId"
    :size="size"
  >
    <template #default="{ id, describedBy, invalid }">
      <div class="relative">
        <input
          :id="id"
          :type="visible ? 'text' : 'password'"
          :value="modelValue"
          :aria-invalid="invalid"
          :aria-describedby="describedBy"
          autocapitalize="none"
          :spellcheck="false"
          v-bind="$attrs"
          class="control text-ink rounded-card focus-visible:outline-primary w-full ps-3 pe-11 focus-visible:outline-2 focus-visible:outline-offset-1"
          :class="[CONTROL_CLASS, invalid ? 'border-negative' : '']"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />

        <button
          type="button"
          class="focus-ring text-ink-soft hover:text-ink rounded-card absolute end-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center"
          :aria-label="toggleLabel"
          :aria-pressed="visible"
          @click="toggle"
        >
          <EyeOff v-if="visible" class="size-4" aria-hidden="true" />
          <Eye v-else class="size-4" aria-hidden="true" />
        </button>
      </div>
    </template>
  </FormField>
</template>
