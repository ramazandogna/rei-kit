<script setup lang="ts">
import { Clock } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import BaseListbox from './BaseListbox.vue'
import BasePopover from './BasePopover.vue'
import FormField from './FormField.vue'
import { formatDate } from '../utils/format'

/**
 * A time of day, chosen from two columns.
 *
 * The value is `HH:mm` on a 24-hour clock, the same way dates are
 * `YYYY-MM-DD`: one shape in and out, whatever the reader's locale does on
 * screen. What they see is `Intl` — "14:30" in Istanbul and "2:30 PM" in
 * Chicago — and neither of those is what the app stores.
 *
 * Two listboxes rather than a text field, for the reason the date picker is
 * a button: a typed time is a parsing problem in every locale at once, and
 * the two columns are one Tab stop each with the arrows inside them.
 */
const {
  label,
  hoursLabel,
  minutesLabel,
  placeholder = '',
  step = 15,
  min = undefined,
  max = undefined,
  error = '',
  hint = '',
  size = 'md',
  labelHidden = false,
  disabled = false,
} = defineProps<{
  label: string
  /** The hour column's accessible name, e.g. "Hour". */
  hoursLabel: string
  /** The minute column's accessible name. */
  minutesLabel: string
  /** What the field shows while nothing is chosen. */
  placeholder?: string | undefined
  /** Minutes between the choices in the second column. */
  step?: number | undefined
  /** The earliest time that can be chosen, as `HH:mm`. */
  min?: string | undefined
  max?: string | undefined
  error?: string | undefined
  hint?: string | undefined
  size?: 'sm' | 'md' | undefined
  labelHidden?: boolean | undefined
  disabled?: boolean | undefined
}>()

/** The time as `HH:mm`, with `v-model`. */
const model = defineModel<string | undefined>()

const open = ref(false)

const pad = (value: number) => String(value).padStart(2, '0')

/** A real date, only so `Intl` can say the time in the reader's own clock. */
const asDate = (time: string) => {
  const [hour = '0', minute = '0'] = time.split(':')
  return new Date(2000, 0, 1, Number(hour), Number(minute))
}

const shown = computed(() =>
  model.value === undefined
    ? ''
    : formatDate(asDate(model.value), { hour: '2-digit', minute: '2-digit' }),
)

const inRange = (time: string) => {
  if (min !== undefined && time < min) return false
  if (max !== undefined && time > max) return false
  return true
}

const chosenHour = computed(() => model.value?.split(':')[0] ?? '')
const chosenMinute = computed(() => model.value?.split(':')[1] ?? '')

const hours = computed(() =>
  Array.from({ length: 24 }, (_, index) => {
    const value = pad(index)
    // An hour is offered when any minute in it can be chosen.
    const usable = minutes.value.some((one) => inRange(`${value}:${one.value}`))

    return {
      value,
      // The hour alone: the minutes are the column beside it. In a 12-hour
      // locale this is "2 PM", in a 24-hour one "14".
      label: formatDate(asDate(`${value}:00`), { hour: 'numeric' }),
      disabled: !usable,
    }
  }),
)

const minutes = computed(() =>
  Array.from({ length: Math.ceil(60 / step) }, (_, index) => {
    const value = pad(index * step)

    return {
      value,
      label: value,
      disabled: chosenHour.value !== '' && !inRange(`${chosenHour.value}:${value}`),
    }
  }),
)

function pickHour(next: string | undefined) {
  if (next === undefined) return
  model.value = `${next}:${chosenMinute.value || pad(0)}`
}

function pickMinute(next: string | undefined) {
  if (next === undefined) return
  model.value = `${chosenHour.value || pad(0)}:${next}`
  open.value = false
}
</script>

<template>
  <FormField :label="label" :error="error" :hint="hint" :size="size" :label-hidden="labelHidden">
    <template #default="{ id, describedBy, invalid }">
      <BasePopover v-model="open" class="rk-time" :label="label">
        <template #trigger="{ props }">
          <button
            :id="id"
            type="button"
            class="rk-time-field control focus-ring"
            :class="{ 'is-invalid': invalid, 'is-empty': !shown }"
            :aria-describedby="describedBy"
            :disabled="disabled"
            v-bind="props"
          >
            <Clock class="size-4 shrink-0" aria-hidden="true" />
            <span class="truncate">{{ shown || placeholder }}</span>
          </button>
        </template>

        <div class="rk-time-columns">
          <BaseListbox
            :model-value="chosenHour"
            :options="hours"
            :label="hoursLabel"
            height="12rem"
            @update:model-value="pickHour"
          />
          <BaseListbox
            :model-value="chosenMinute"
            :options="minutes"
            :label="minutesLabel"
            height="12rem"
            @update:model-value="pickMinute"
          />
        </div>
      </BasePopover>
    </template>
  </FormField>
</template>

<style scoped>
.rk-time {
  display: block;
}

.rk-time-field {
  display: flex;
  width: 100%;
  height: 2.75rem;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--radius-card);
  padding: 0 0.75rem;
  text-align: left;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.rk-time-field.is-empty {
  color: var(--color-ink-soft);
}

.rk-time-field.is-invalid {
  --surface-border-color: var(--color-negative);
}

.rk-time-field:disabled {
  opacity: 0.5;
}

.rk-time-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 0.5rem;
  width: 14rem;
}
</style>
