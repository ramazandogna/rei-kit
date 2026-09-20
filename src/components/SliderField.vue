<script setup lang="ts">
import { computed } from 'vue'

import BaseSlider from './BaseSlider.vue'
import NumberInput from './NumberInput.vue'

/**
 * One number, reached either way: dragged along a range or typed exactly.
 *
 * The pair exists because the two controls answer different halves of the
 * same question. A slider is for finding a value — you can see where you are
 * in the range and what "a bit more" looks like — and it is hopeless at
 * landing on 37 out of 500. A number field lands on 37 immediately and tells
 * you nothing about whether 37 is a lot. Anything with a wide range and an
 * exact answer somewhere in it — a price ceiling, an opacity, a timeout —
 * wants both, and apps kept building the pair by hand.
 *
 * ## Both controls carry the same name, and that is on purpose
 *
 * A screen reader announces two controls here, not one, because there are
 * two: each can be focused and each changes the value. Giving them one name
 * is what says they are the same answer rather than two settings that happen
 * to sit together. The number field's label is visually hidden, since the
 * slider's is right above it.
 *
 * ## Typing is allowed to be wrong on the way
 *
 * The field clamps on commit, not on every keystroke: clamping as you type
 * turns "50" into "5" and then into "50" again while you are still typing it
 * — for a range starting at 10, the 5 is rewritten before the 0 arrives.
 * `NumberInput` already holds that line; this passes the range through and
 * stays out of it.
 */
const {
  label,
  min = 0,
  max = 100,
  step = 1,
  decrementLabel,
  incrementLabel,
  hint = '',
  disabled = false,
  format,
} = defineProps<{
  /** Names both controls. Already translated. */
  label: string
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  /** Names the number field's step-down button. Already translated. */
  decrementLabel: string
  /** Names the number field's step-up button. Already translated. */
  incrementLabel: string
  hint?: string | undefined
  disabled?: boolean | undefined
  /**
   * Turns the number into something a person would say — "45 minutes", "₺12".
   *
   * The slider's readout is the number field here, so this is only what a
   * screen reader hears for the slider: `aria-valuetext`, which without it
   * is a bare number and a bare number is not an answer to anything.
   */
  format?: ((value: number) => string) | undefined
}>()

const model = defineModel<number>({ default: 0 })

/**
 * The field's own binding, which can be emptied; the pair's cannot.
 *
 * `NumberInput` hands back `undefined` while the field is empty, because
 * halfway through typing a number there is no number. A slider has no such
 * state — the thumb is always somewhere — so an empty field leaves the value
 * where it was until something is typed, rather than dragging the thumb to
 * zero the moment the last digit is deleted.
 */
const typed = computed<number | undefined>({
  get: () => model.value,
  set: (value) => {
    if (value !== undefined) model.value = value
  },
})
</script>

<template>
  <div class="rk-slider-field">
    <BaseSlider
      v-model="model"
      :label="label"
      :min="min"
      :max="max"
      :step="step"
      :hint="hint"
      :disabled="disabled"
      :format="format"
      :show-value="false"
    />

    <NumberInput
      v-model="typed"
      class="rk-slider-field-number"
      :label="label"
      label-hidden
      :min="min"
      :max="max"
      :step="step"
      :decrement-label="decrementLabel"
      :increment-label="incrementLabel"
      :disabled="disabled"
      size="sm"
    />
  </div>
</template>

<style scoped>
/* The slider takes the room; the field is as wide as its digits need and no
   wider, so the pair does not read as two fields of equal weight. */
.rk-slider-field {
  display: flex;
  flex-wrap: wrap;
  /* Centred rather than bottom-aligned: the slider's block grows when its
     hint wraps to a second line, and aligning to the bottom edge sank the
     field down with it. */
  align-items: center;
  gap: 0.75rem;
}

/* It wraps rather than squeezing: a slider shorter than this is one nobody
   can aim with, and then the field belongs under it instead of beside it.
   Wrapping does that by itself, so it needs no container query -- which
   would have been a rule that silently never matched unless the app had
   declared a container above it. */
.rk-slider-field > :first-child {
  min-width: 12rem;
  flex: 1 1 12rem;
}

.rk-slider-field-number {
  width: 7.5rem;
  flex: 0 1 7.5rem;
}
</style>
