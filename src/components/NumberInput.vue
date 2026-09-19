<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

import FormField from './FormField.vue'

/**
 * A number, typed or stepped — a quantity, a price, a count of minutes.
 *
 * `<input type="number">` is what everyone reaches for and nearly everyone
 * regrets: it accepts "e", scrolls the value when the page is scrolled over
 * it, and hands back an empty string for anything it does not like. This is
 * a text field that only settles on numbers, with a minus and a plus beside
 * it, and the spin-button keyboard: arrows step, Page Up and Down step ten
 * at a time, Home and End go to the limits.
 *
 * Typing is free while the field has focus — "-", "1." and "" are all fine
 * halfway through a number. On leaving it, the value is clamped to `min` and
 * `max` and rounded to the precision of `step`, so 0.1 + 0.2 lands on 0.3.
 */
const {
  label,
  min = -Infinity,
  max = Infinity,
  step = 1,
  decrementLabel,
  incrementLabel,
  error = '',
  hint = '',
  size = 'md',
  labelHidden = false,
  disabled = false,
} = defineProps<{
  label: string
  min?: number | undefined
  max?: number | undefined
  /** One press of a button or an arrow key. Its decimals set the rounding. */
  step?: number | undefined
  /** Accessible name of the minus button, e.g. "Decrease". */
  decrementLabel: string
  /** Accessible name of the plus button, e.g. "Increase". */
  incrementLabel: string
  error?: string | undefined
  hint?: string | undefined
  size?: 'sm' | 'md' | undefined
  labelHidden?: boolean | undefined
  disabled?: boolean | undefined
}>()

/** The number, with `v-model`. `undefined` while the field is empty. */
const model = defineModel<number | undefined>()

const places = computed(() => (String(step).split('.')[1] ?? '').length)

const settle = (value: number) =>
  Number(Math.min(max, Math.max(min, value)).toFixed(Math.min(places.value, 20)))

/* What the field shows. Kept apart from the model so a half-typed "1." is
   not rewritten to "1" under the reader's cursor. */
const draft = ref(model.value === undefined ? '' : String(model.value))

watch(model, (value) => {
  const shown = draft.value === '' ? undefined : Number(draft.value)
  if (shown !== value) draft.value = value === undefined ? '' : String(value)
})

function onInput(event: Event) {
  const text = (event.target as HTMLInputElement).value.replace(',', '.')
  draft.value = text
  if (text.trim() === '') {
    model.value = undefined
    return
  }

  const value = Number(text)
  if (Number.isFinite(value)) model.value = value
}

function commit() {
  if (model.value === undefined) {
    draft.value = ''
    return
  }
  setTo(model.value)
}

function setTo(value: number) {
  model.value = settle(value)
  draft.value = String(model.value)
}

function stepBy(times: number) {
  if (disabled) return
  const start = model.value ?? (Number.isFinite(min) ? min : 0)
  setTo(start + step * times)
}

function onKeydown(event: KeyboardEvent) {
  const keys: Record<string, () => void> = {
    ArrowUp: () => stepBy(1),
    ArrowDown: () => stepBy(-1),
    PageUp: () => stepBy(10),
    PageDown: () => stepBy(-10),
    Home: () => {
      if (Number.isFinite(min)) setTo(min)
    },
    End: () => {
      if (Number.isFinite(max)) setTo(max)
    },
  }
  const action = keys[event.key]
  if (!action) return
  event.preventDefault()
  action()
}

const atMin = computed(() => model.value !== undefined && model.value <= min)
const atMax = computed(() => model.value !== undefined && model.value >= max)
</script>

<template>
  <FormField :label="label" :error="error" :hint="hint" :size="size" :label-hidden="labelHidden">
    <template #default="{ id, describedBy, invalid }">
      <div class="rk-number control" :class="{ 'is-invalid': invalid, 'is-disabled': disabled }">
        <button
          type="button"
          class="rk-number-step focus-ring"
          :aria-label="decrementLabel"
          :disabled="disabled || atMin"
          tabindex="-1"
          @click="stepBy(-1)"
        >
          <Minus class="size-4" aria-hidden="true" />
        </button>
        <input
          :id="id"
          :value="draft"
          type="text"
          inputmode="decimal"
          role="spinbutton"
          autocomplete="off"
          class="rk-number-field"
          :aria-valuenow="model"
          :aria-valuemin="Number.isFinite(min) ? min : undefined"
          :aria-valuemax="Number.isFinite(max) ? max : undefined"
          :aria-invalid="invalid"
          :aria-describedby="describedBy"
          :disabled="disabled"
          @input="onInput"
          @blur="commit"
          @keydown="onKeydown"
        />
        <button
          type="button"
          class="rk-number-step focus-ring"
          :aria-label="incrementLabel"
          :disabled="disabled || atMax"
          tabindex="-1"
          @click="stepBy(1)"
        >
          <Plus class="size-4" aria-hidden="true" />
        </button>
      </div>
    </template>
  </FormField>
</template>

<style scoped>
/* The buttons are out of the Tab order: the keyboard already has the arrows,
   and three stops for one number is two too many. They stay reachable by
   pointer and by touch, which is who they are for. */
.rk-number {
  display: flex;
  align-items: center;
  height: 2.75rem;
  border-radius: var(--radius-card);
  padding: 0 0.25rem;
}

.rk-number:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.rk-number.is-invalid {
  --surface-border-color: var(--color-negative);
}

.rk-number.is-disabled {
  opacity: 0.5;
}

.rk-number-field {
  min-width: 0;
  flex: 1;
  background: transparent;
  text-align: center;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  outline: none;
}

.rk-number-step {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: calc(var(--radius-card) - 4px);
  color: var(--color-ink);
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.rk-number-step:hover:not(:disabled) {
  background: var(--color-muted);
}

.rk-number-step:disabled {
  opacity: 0.35;
}
</style>
