<script setup lang="ts" generic="V extends string = string">
import { computed, useId } from 'vue'

import BaseCheckbox from './BaseCheckbox.vue'

/** One answer in a group of checkboxes. */
export interface CheckboxOption<V extends string = string> {
  value: V
  label: string
  /** A reason this one cannot be chosen, shown under its label. */
  hint?: string | undefined
  disabled?: boolean | undefined
}

/**
 * Several answers from a set that is all on screen.
 *
 * The counterpart to `BaseRadioGroup`, and the gap it filled: a radio group
 * is one answer, a listbox with `multiple` is a long list that scrolls, and
 * between them sat the commonest form control there is — four or five boxes
 * under one question. Every app wrote it by hand, and each hand-written
 * version dropped the same two things.
 *
 * The first is the `fieldset` and `legend`. A label points at one element,
 * and what is being named here is the question rather than any single answer;
 * with a plain heading above a column of boxes, a reader hears five options
 * and nothing about what they are options for.
 *
 * The second is the count. The group's value is a list, and the only thing on
 * screen saying how long it is now is the boxes themselves — which a reader
 * moving through them one at a time cannot see. `selectAllLabel` is the other
 * half of that: a box standing for the rest, `indeterminate` while some of
 * them are chosen, which is a DOM property with no markup for it and so the
 * part every copy got wrong.
 */
const {
  options,
  legend,
  error = '',
  hint = '',
  legendHidden = false,
  selectAllLabel = '',
  disabled = false,
  columns = 1,
} = defineProps<{
  options: readonly CheckboxOption<V>[]
  legend: string
  /** Shown under the group, and it marks every box invalid. */
  error?: string | undefined
  hint?: string | undefined
  /**
   * Hides the question but keeps it as the group's accessible name — for a
   * group whose surroundings already ask it. Dropping the legend instead
   * leaves the set named nothing at all.
   */
  legendHidden?: boolean | undefined
  /**
   * Adds a box above the others that chooses or clears all of them, named by
   * this string. Empty means no such box: it earns its place on a list long
   * enough that ticking each one is work, and gets in the way on three.
   *
   * It never chooses a disabled option, so pressing it twice is not a way to
   * select something the form has ruled out.
   */
  selectAllLabel?: string | undefined
  /** Disables every box, including the select-all. */
  disabled?: boolean | undefined
  /**
   * Lay the boxes out in two columns from the `sm` breakpoint. One column on
   * a phone either way: a two-column list of checkboxes on a 390px screen is
   * two columns of truncated labels.
   */
  columns?: 1 | 2 | undefined
}>()

const model = defineModel<V[]>({ default: () => [] })

const id = useId()
const errorId = `${id}-error`
const hintId = `${id}-hint`

const describedBy = computed(() => {
  if (error) return errorId
  if (hint) return hintId
  return undefined
})

const choosable = computed(() => options.filter((option) => !option.disabled))

const allChosen = computed(
  () =>
    choosable.value.length > 0 &&
    choosable.value.every((option) => model.value.includes(option.value)),
)

const someChosen = computed(
  () => !allChosen.value && choosable.value.some((option) => model.value.includes(option.value)),
)

/* Writes a whole array rather than pushing: the model may be a prop from the
   parent, and mutating it in place would change the parent's object without
   an emit — which works until the parent keeps it frozen or watches it. */
function toggle(value: V, chosen: boolean) {
  model.value = chosen
    ? [...model.value, value]
    : model.value.filter((chosenValue) => chosenValue !== value)
}

/* Keeps whatever is already chosen among the disabled ones: a box the form
   has ruled out is not something "select all" may change, in either
   direction. */
function toggleAll(chosen: boolean) {
  const locked = model.value.filter((value) =>
    options.some((option) => option.value === value && option.disabled),
  )

  model.value = chosen ? [...locked, ...choosable.value.map((option) => option.value)] : locked
}
</script>

<template>
  <fieldset
    class="flex flex-col gap-2"
    :aria-describedby="describedBy"
    :aria-invalid="Boolean(error)"
  >
    <legend class="text-ink mb-1 text-sm font-medium" :class="legendHidden ? 'sr-only' : ''">
      {{ legend }}
    </legend>

    <BaseCheckbox
      v-if="selectAllLabel"
      :model-value="allChosen"
      :label="selectAllLabel"
      :indeterminate="someChosen"
      :disabled="disabled || choosable.length === 0"
      class="border-hair/70 border-b pb-2"
      @update:model-value="toggleAll"
    />

    <div class="grid gap-2" :class="columns === 2 ? 'sm:grid-cols-2' : ''">
      <BaseCheckbox
        v-for="option in options"
        :key="option.value"
        :model-value="model.includes(option.value)"
        :label="option.label"
        :hint="option.hint ?? ''"
        :disabled="disabled || option.disabled"
        @update:model-value="(chosen: boolean) => toggle(option.value, chosen)"
      />
    </div>

    <p v-if="error" :id="errorId" class="text-negative text-xs">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="text-ink-soft text-xs">{{ hint }}</p>
  </fieldset>
</template>
