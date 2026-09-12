<script setup lang="ts">
import { computed, useId } from 'vue'

/**
 * A value picked from a range, where roughly right is the point.
 *
 * A native `input[type="range"]`, painted. That is deliberate: the native
 * control already has the keyboard (arrows, Page Up/Down, Home/End), the
 * pointer, the touch target and the correct announcements, and every
 * hand-rolled slider gives some of that up. What it does not have is a look
 * that matches the rest of the kit, so the look is all that is replaced.
 *
 * `aria-valuetext` is the part worth stopping on. Without it a screen reader
 * reads the number alone — "45" — and a number with no unit is not an answer to
 * anything. Pass `format` and it reads "45 minutes".
 */
const {
  label,
  min = 0,
  max = 100,
  step = 1,
  hint = '',
  disabled = false,
  format,
  showValue = true,
} = defineProps<{
  label: string
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  hint?: string | undefined
  disabled?: boolean | undefined
  /**
   * Turns the number into something a person would say — "45 minutes", "₺12".
   *
   * Used for the visible readout and for `aria-valuetext`, so both say the same
   * thing and neither is a bare number.
   */
  format?: ((value: number) => string) | undefined
  showValue?: boolean | undefined
}>()

const model = defineModel<number>({ default: 0 })

const id = useId()
const hintId = `${id}-hint`

const text = computed(() => (format ? format(model.value) : String(model.value)))
/** Where the fill stops, as a percentage of the track. */
const filled = computed(() => {
  const span = max - min
  return span <= 0 ? 0 : ((model.value - min) / span) * 100
})
</script>

<template>
  <div class="rk-slider">
    <div class="rk-slider-head">
      <label :for="id" class="rk-slider-label">{{ label }}</label>
      <output v-if="showValue" :for="id" class="rk-slider-value">{{ text }}</output>
    </div>

    <input
      :id="id"
      v-model.number="model"
      type="range"
      class="rk-slider-input"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-valuetext="text"
      :aria-describedby="hint ? hintId : undefined"
      :style="{ '--rk-slider-filled': `${filled}%` }"
    />

    <p v-if="hint" :id="hintId" class="rk-slider-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.rk-slider {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rk-slider-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.rk-slider-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
}

.rk-slider-value {
  font-size: 0.875rem;
  color: var(--color-ink-soft);
  font-variant-numeric: tabular-nums;
}

.rk-slider-input {
  width: 100%;
  height: 1.25rem;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.rk-slider-input:disabled {
  opacity: 0.5;
  cursor: default;
}

/* The two engines will not accept these in one rule: an unknown pseudo-element
   invalidates the whole selector, so WebKit and Firefox are written twice. */
.rk-slider-input::-webkit-slider-runnable-track {
  height: 0.375rem;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    var(--color-primary) var(--rk-slider-filled, 0%),
    var(--color-hair) var(--rk-slider-filled, 0%)
  );
}

.rk-slider-input::-moz-range-track {
  height: 0.375rem;
  border-radius: 9999px;
  background: var(--color-hair);
}

.rk-slider-input::-moz-range-progress {
  height: 0.375rem;
  border-radius: 9999px;
  background: var(--color-primary);
}

.rk-slider-input::-webkit-slider-thumb {
  appearance: none;
  margin-top: -0.4375rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: #fff;
  border: 2px solid var(--color-primary);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
}

.rk-slider-input::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-primary);
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
}

.rk-slider-input:focus-visible::-webkit-slider-thumb {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-slider-input:focus-visible::-moz-range-thumb {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-slider-hint {
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}
</style>
