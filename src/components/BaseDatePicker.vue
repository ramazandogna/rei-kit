<script setup lang="ts" generic="M extends 'single' | 'range' = 'single'">
import { CalendarDays, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import BaseCalendar from './BaseCalendar.vue'
import type { DateRange } from './BaseCalendar.vue'
import BasePopover from './BasePopover.vue'
import FormField from './FormField.vue'
import { fromDateKey } from '../utils/date'
import type { WeekStart } from '../utils/date'
import { formatDate } from '../utils/format'

export interface DatePreset {
  /** Already translated: "Last 7 days", "This month". */
  label: string
  /** The days it stands for, built when it is pressed — so "today" is today. */
  value: () => string | DateRange
}

/**
 * A date, or a stretch of dates, chosen from a calendar in a popover.
 *
 * The field is a button rather than a text input: a typed date is a parsing
 * problem in every locale at once — "03/04" is two different days either
 * side of the Atlantic — and the calendar is the part people reach for
 * anyway. What it shows is `Intl` in the app's locale; what it hands back
 * is the kit's date keys.
 *
 * `presets` are the ready-made answers a report offers: last seven days,
 * this month. They are the app's words and the app's arithmetic, built when
 * pressed so that "today" is today.
 */
const {
  label,
  mode = 'single' as M,
  placeholder = '',
  format = { dateStyle: 'medium' },
  presets = undefined,
  clearLabel = undefined,
  min = undefined,
  max = undefined,
  isDisabled = undefined,
  weekStartsOn = 1,
  previousLabel,
  nextLabel,
  today = undefined,
  error = '',
  hint = '',
  size = 'md',
  labelHidden = false,
  disabled = false,
} = defineProps<{
  label: string
  /** One day, or a stretch from one day to another. */
  mode?: M | undefined
  /** What the field shows while nothing is chosen. */
  placeholder?: string | undefined
  /** How the chosen date reads, through `Intl.DateTimeFormat`. */
  format?: Intl.DateTimeFormatOptions | undefined
  /** Ready-made answers beside the calendar: "Last 7 days", "This month". */
  presets?: readonly DatePreset[] | undefined
  /** Given, the field grows a button that empties it. Its accessible name. */
  clearLabel?: string | undefined
  min?: string | undefined
  max?: string | undefined
  isDisabled?: ((key: string) => boolean) | undefined
  weekStartsOn?: WeekStart | undefined
  /** Accessible name of the calendar's back arrow. */
  previousLabel: string
  /** Accessible name of the calendar's forward arrow. */
  nextLabel: string
  /** Which day the calendar marks as today. Given, so a demo or a test can fix it. */
  today?: string | undefined
  error?: string | undefined
  hint?: string | undefined
  size?: 'sm' | 'md' | undefined
  labelHidden?: boolean | undefined
  disabled?: boolean | undefined
}>()

/* `| undefined` outside the condition, not inside each branch: TypeScript
   can then see that `Value | undefined` is `Value`, which it cannot while
   `M` is still open. */
type Value = (M extends 'range' ? DateRange : string) | undefined

/** The chosen day, or range, with `v-model`. */
const model = defineModel<Value>()

const open = ref(false)

const shown = computed(() => {
  const value = model.value
  if (value === undefined) return ''
  if (typeof value === 'string') return formatDate(fromDateKey(value), format)

  const start = formatDate(fromDateKey(value.start), format)
  if (value.start === value.end) return start

  // An en dash, not a hyphen: it is a span, and it reads as one.
  return `${start} – ${formatDate(fromDateKey(value.end), format)}`
})

function onPicked(next: Value | undefined) {
  model.value = next as Value
  // Single: chosen is done. Range: only once both ends are in, which is the
  // only time the calendar reports one.
  if (mode === 'single' || (next && typeof next === 'object')) open.value = false
}

function applyPreset(preset: DatePreset) {
  model.value = preset.value() as Value
  open.value = false
}

function clear() {
  model.value = undefined as Value
  open.value = false
}
</script>

<template>
  <FormField :label="label" :error="error" :hint="hint" :size="size" :label-hidden="labelHidden">
    <template #default="{ id, describedBy, invalid }">
      <BasePopover v-model="open" class="rk-date" :label="label">
        <!-- Two buttons side by side rather than one inside the other: a
             button nested in a button is not a control a browser or a screen
             reader can make sense of. -->
        <template #trigger="{ props }">
          <div class="rk-date-wrap control" :class="{ 'is-invalid': invalid }">
            <button
              :id="id"
              type="button"
              class="rk-date-field focus-ring"
              :class="{ 'is-empty': !shown }"
              :aria-describedby="describedBy"
              :disabled="disabled"
              v-bind="props"
            >
              <CalendarDays class="size-4 shrink-0" aria-hidden="true" />
              <span class="truncate">{{ shown || placeholder }}</span>
            </button>

            <button
              v-if="clearLabel && shown"
              type="button"
              class="rk-date-clear focus-ring"
              :aria-label="clearLabel"
              :disabled="disabled"
              @click="clear"
            >
              <X class="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </template>

        <div class="rk-date-panel">
          <ul v-if="presets?.length" class="rk-date-presets">
            <li v-for="preset in presets" :key="preset.label">
              <button type="button" class="rk-date-preset focus-ring" @click="applyPreset(preset)">
                {{ preset.label }}
              </button>
            </li>
          </ul>

          <BaseCalendar
            :model-value="model"
            :mode="mode"
            :min="min"
            :max="max"
            :is-disabled="isDisabled"
            :week-starts-on="weekStartsOn"
            :previous-label="previousLabel"
            :next-label="nextLabel"
            v-bind="today ? { today } : {}"
            @update:model-value="onPicked"
          />
        </div>
      </BasePopover>
    </template>
  </FormField>
</template>

<style scoped>
.rk-date {
  display: block;
}

/* Wider than a popover's default: a calendar and a column of presets side by
   side do not fit in 24rem, and the month title wraps in two. */
.rk-date :deep(.rk-popover-panel) {
  max-width: min(34rem, calc(100vw - 1rem));
}

.rk-date-wrap {
  display: flex;
  width: 100%;
  height: 2.75rem;
  align-items: center;
  border-radius: var(--radius-card);
  padding-right: 0.375rem;
}

.rk-date-field {
  display: flex;
  min-width: 0;
  flex: 1;
  height: 100%;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--radius-card);
  padding: 0 0.75rem;
  text-align: left;
  font-size: 1rem;
  color: var(--color-ink);
}

.rk-date-field.is-empty {
  color: var(--color-ink-soft);
}

.rk-date-wrap.is-invalid {
  --surface-border-color: var(--color-negative);
}

.rk-date-field:disabled {
  opacity: 0.5;
}

.rk-date-clear {
  display: grid;
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  color: var(--color-ink-soft);
}

.rk-date-clear:hover {
  background: var(--color-muted);
  color: var(--color-ink);
}

.rk-date-clear:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* As wide as its contents rather than as narrow as they will go: in a flex
   panel the calendar shrinks, and a squeezed month title wraps in two. */
.rk-date-panel {
  display: flex;
  width: max-content;
  max-width: 100%;
  gap: 0.75rem;
}

.rk-date-panel :deep(.rk-cal) {
  width: 17rem;
}

.rk-date-presets {
  display: flex;
  min-width: 8rem;
  flex-direction: column;
  gap: 2px;
  border-right: 1px solid var(--surface-border-color);
  padding-right: 0.75rem;
}

.rk-date-preset {
  width: 100%;
  border-radius: var(--radius-cell);
  padding: 0.375rem 0.5rem;
  text-align: left;
  font-size: 0.8125rem;
  color: var(--color-ink);
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.rk-date-preset:hover {
  background: var(--color-muted);
}

@media (max-width: 30rem) {
  .rk-date-panel {
    flex-direction: column;
  }

  .rk-date-presets {
    flex-direction: row;
    flex-wrap: wrap;
    border-right: 0;
    border-bottom: 1px solid var(--surface-border-color);
    padding-right: 0;
    padding-bottom: 0.5rem;
  }

  .rk-date-preset {
    width: auto;
  }
}
</style>
