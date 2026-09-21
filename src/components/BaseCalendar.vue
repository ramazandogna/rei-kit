<script setup lang="ts" generic="M extends 'single' | 'range' = 'single'">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

import { addDays, fromDateKey, toDateKey, todayKey } from '../utils/date'
import type { WeekStart } from '../utils/date'
import { horizontalStep } from '../utils/direction'
import { formatDate } from '../utils/format'

export interface DateRange {
  /** `YYYY-MM-DD`, always local. */
  start: string
  end: string
}

/**
 * A month of days, for choosing one or a stretch of them.
 *
 * Dates are the kit's date keys — `YYYY-MM-DD`, always local — and never
 * `Date` objects across the boundary. `toISOString()` on a late evening in
 * Istanbul is tomorrow, which is the bug `toDateKey` exists to prevent, and
 * a component that handed back `Date`s would hand that bug to every app.
 *
 * The keyboard is the date-grid pattern: the arrows move a day and a week,
 * Home and End go to the ends of the week, Page Up and Down change the
 * month, and with Shift, the year. Only one day is in the Tab order at a
 * time, so a calendar is one stop rather than thirty-one.
 *
 * Every name a screen reader reads — the month, the weekdays, each day —
 * comes from `Intl` in the app's own locale. The two arrows are the only
 * words the app has to pass, because "previous" has no date to build it
 * from.
 */
const {
  mode = 'single' as M,
  min = undefined,
  max = undefined,
  isDisabled = undefined,
  weekStartsOn = 1,
  previousLabel,
  nextLabel,
  today = todayKey(),
} = defineProps<{
  /** One day, or a stretch from one day to another. */
  mode?: M | undefined
  /** The earliest day that can be chosen, as `YYYY-MM-DD`. */
  min?: string | undefined
  max?: string | undefined
  /** Days to rule out inside the range — weekends, days already booked. */
  isDisabled?: ((key: string) => boolean) | undefined
  /** `1` Monday, `0` Sunday. */
  weekStartsOn?: WeekStart | undefined
  /** Accessible name of the back arrow, e.g. "Previous month". */
  previousLabel: string
  /** Accessible name of the forward arrow. */
  nextLabel: string
  /** Which day is marked as today. Given, so a test or a demo can fix it. */
  today?: string | undefined
}>()

/* `| undefined` outside the condition, not inside each branch: TypeScript
   can then see that `Value | undefined` is `Value`, which it cannot while
   `M` is still open. */
type Value = (M extends 'range' ? DateRange : string) | undefined

/** The chosen day, or the chosen range, with `v-model`. */
const model = defineModel<Value>()

const single = computed(() => (mode === 'single' ? (model.value as string | undefined) : undefined))
const range = computed(() =>
  mode === 'range' ? (model.value as DateRange | undefined) : undefined,
)

/* Which month is on screen, and which day the keyboard is on. They move
   together: stepping off the edge of a month turns the page. */
const focused = ref(single.value ?? range.value?.start ?? today)
const view = ref<'days' | 'months' | 'years'>('days')
const grid = useTemplateRef<HTMLElement>('grid')

/** Set while a range is half chosen, to paint what hovering would take. */
const pendingStart = ref<string | null>(null)
const hovered = ref<string | null>(null)

const focusedDate = computed(() => fromDateKey(focused.value))
const year = computed(() => focusedDate.value.getFullYear())
const month = computed(() => focusedDate.value.getMonth())

const monthTitle = computed(() => formatDate(focusedDate.value, { month: 'long', year: 'numeric' }))

/** The weekday headings, in the app's locale, starting on the chosen day. */
const weekdays = computed(() => {
  // 2024-01-07 was a Sunday, so this walks a real week in the right order.
  const sunday = new Date(2024, 0, 7)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(sunday)
    date.setDate(sunday.getDate() + ((i + weekStartsOn) % 7))
    return {
      short: formatDate(date, { weekday: 'short' }),
      long: formatDate(date, { weekday: 'long' }),
    }
  })
})

/** Six weeks, always: a calendar that changes height as you page it jumps. */
const weeks = computed(() => {
  const first = new Date(year.value, month.value, 1)
  const offset = (first.getDay() - weekStartsOn + 7) % 7
  let cursor = addDays(toDateKey(first), -offset)

  return Array.from({ length: 6 }, () =>
    Array.from({ length: 7 }, () => {
      const key = cursor
      cursor = addDays(cursor, 1)
      return key
    }),
  )
})

const months = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    index: i,
    label: formatDate(new Date(year.value, i, 1), { month: 'short' }),
    long: formatDate(new Date(year.value, i, 1), { month: 'long' }),
  })),
)

/** A block of twelve years, the one the focused year falls in. */
const years = computed(() => {
  const start = Math.floor(year.value / 12) * 12
  return Array.from({ length: 12 }, (_, i) => start + i)
})

const outside = (key: string) => fromDateKey(key).getMonth() !== month.value

function disabled(key: string) {
  if (min !== undefined && key < min) return true
  if (max !== undefined && key > max) return true
  return isDisabled?.(key) ?? false
}

/* What a day looks like: chosen, an end of the range, or inside it —
   including the stretch the pointer is hovering over while a range is half
   made, which is what makes the second click land where it looks like it
   will. */
const edges = computed(() => {
  if (mode !== 'range') return null
  if (pendingStart.value) {
    const other = hovered.value ?? pendingStart.value
    return pendingStart.value <= other
      ? { start: pendingStart.value, end: other }
      : { start: other, end: pendingStart.value }
  }
  return range.value ?? null
})

function stateOf(key: string) {
  if (mode === 'single') return single.value === key ? 'selected' : ''
  const span = edges.value
  if (!span) return ''
  if (key === span.start || key === span.end) return 'selected'
  return key > span.start && key < span.end ? 'inside' : ''
}

function choose(key: string) {
  if (disabled(key)) return
  focused.value = key

  if (mode === 'single') {
    model.value = key as Value
    return
  }

  if (!pendingStart.value) {
    pendingStart.value = key
    return
  }

  const start = pendingStart.value <= key ? pendingStart.value : key
  const end = pendingStart.value <= key ? key : pendingStart.value
  pendingStart.value = null
  hovered.value = null
  model.value = { start, end } as Value
}

async function moveTo(key: string) {
  focused.value = key
  await nextTick()
  grid.value?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
}

function shiftMonths(count: number) {
  const date = new Date(year.value, month.value + count, 1)
  // The same day of the month where it exists: the 31st of a 30-day month
  // lands on the 30th rather than spilling into the next one.
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(focusedDate.value.getDate(), last))
  return toDateKey(date)
}

function onKeydown(event: KeyboardEvent) {
  const key = event.key
  /* A week runs the way the language does, so in Arabic the day to the left
     of today is tomorrow. Up and down cross whole weeks and are the same
     either way. */
  const along = horizontalStep(key, event.currentTarget as Element)
  const jumps: Record<string, () => string> = {
    ArrowLeft: () => addDays(focused.value, along),
    ArrowRight: () => addDays(focused.value, along),
    ArrowUp: () => addDays(focused.value, -7),
    ArrowDown: () => addDays(focused.value, 7),
    Home: () =>
      addDays(focused.value, -((fromDateKey(focused.value).getDay() - weekStartsOn + 7) % 7)),
    End: () =>
      addDays(focused.value, 6 - ((fromDateKey(focused.value).getDay() - weekStartsOn + 7) % 7)),
    PageUp: () => shiftMonths(event.shiftKey ? -12 : -1),
    PageDown: () => shiftMonths(event.shiftKey ? 12 : 1),
  }

  const next = jumps[key]
  if (!next) return

  event.preventDefault()
  void moveTo(next())
}

/** The arrows move a month, a year, or twelve years — whatever is on screen. */
function step(direction: 1 | -1) {
  if (view.value === 'days') return moveTo(shiftMonths(direction))
  const years = view.value === 'months' ? 1 : 12
  return moveTo(toDateKey(new Date(year.value + direction * years, month.value, 1)))
}

/** Down one view: years pick a year, months pick a month and land on days. */
function chooseYear(value: number) {
  void moveTo(toDateKey(new Date(value, month.value, 1)))
  view.value = 'months'
}

function chooseMonth(index: number) {
  void moveTo(toDateKey(new Date(year.value, index, 1)))
  view.value = 'days'
}

function cycleView() {
  view.value = view.value === 'days' ? 'months' : view.value === 'months' ? 'years' : 'days'
}

/* Following the value: a date chosen elsewhere — a preset, a text field —
   turns the page to it. */
watch(
  () => [single.value, range.value?.start] as const,
  ([day, start]) => {
    const next = day ?? start
    if (next) focused.value = next
  },
)
</script>

<template>
  <div class="rk-cal">
    <div class="rk-cal-head">
      <button
        type="button"
        class="rk-cal-arrow focus-ring"
        :aria-label="previousLabel"
        @click="step(-1)"
      >
        <ChevronLeft class="size-4" aria-hidden="true" />
      </button>

      <button
        type="button"
        class="rk-cal-title focus-ring"
        :aria-expanded="view !== 'days'"
        @click="cycleView"
      >
        {{ view === 'years' ? `${years[0]} – ${years[11]}` : monthTitle }}
      </button>

      <button
        type="button"
        class="rk-cal-arrow focus-ring"
        :aria-label="nextLabel"
        @click="step(1)"
      >
        <ChevronRight class="size-4" aria-hidden="true" />
      </button>
    </div>

    <!-- Days -->
    <div v-if="view === 'days'" class="rk-cal-weekdays" aria-hidden="true">
      <span v-for="day in weekdays" :key="day.long">{{ day.short }}</span>
    </div>

    <div
      v-if="view === 'days'"
      ref="grid"
      class="rk-cal-grid"
      role="grid"
      :aria-label="monthTitle"
      @keydown="onKeydown"
      @pointerleave="hovered = null"
    >
      <div v-for="(week, index) in weeks" :key="index" class="rk-cal-week" role="row">
        <!-- Selection belongs to the cell, not to the button inside it:
             `role="button"` does not support `aria-selected`, so a reader
             was told nothing at all about which day is chosen. -->
        <div
          v-for="key in week"
          :key="key"
          role="gridcell"
          class="rk-cal-cell"
          :aria-selected="stateOf(key) === 'selected'"
        >
          <button
            type="button"
            class="rk-cal-day"
            :class="[stateOf(key) && `is-${stateOf(key)}`, { 'is-outside': outside(key) }]"
            :tabindex="key === focused ? 0 : -1"
            :disabled="disabled(key)"
            :aria-label="formatDate(fromDateKey(key), { dateStyle: 'full' })"
            :aria-current="key === today ? 'date' : undefined"
            @click="choose(key)"
            @pointerenter="hovered = key"
          >
            {{ fromDateKey(key).getDate() }}
          </button>
        </div>
      </div>
    </div>

    <!-- Months and years: the way to a date two years out without paging. -->
    <div v-else-if="view === 'months'" class="rk-cal-blocks">
      <button
        v-for="entry in months"
        :key="entry.index"
        type="button"
        class="rk-cal-block focus-ring"
        :aria-label="entry.long"
        @click="chooseMonth(entry.index)"
      >
        {{ entry.label }}
      </button>
    </div>

    <div v-else class="rk-cal-blocks">
      <button
        v-for="value in years"
        :key="value"
        type="button"
        class="rk-cal-block focus-ring"
        @click="chooseYear(value)"
      >
        {{ value }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.rk-cal {
  display: flex;
  width: 100%;
  max-width: 19rem;
  flex-direction: column;
  gap: 0.5rem;
}

.rk-cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
}

.rk-cal-arrow {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 9999px;
  color: var(--color-ink);
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.rk-cal-arrow:hover {
  background: var(--color-muted);
}

.rk-cal-title {
  border-radius: var(--radius-cell);
  padding: 0.25rem 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-ink);
}

.rk-cal-title:hover {
  background: var(--color-muted);
}

.rk-cal-weekdays,
.rk-cal-week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.rk-cal-weekdays {
  gap: 2px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-align: center;
  color: var(--color-ink-soft);
}

.rk-cal-grid {
  display: grid;
  gap: 2px;
}

.rk-cal-cell {
  display: grid;
  place-items: center;
}

.rk-cal-day {
  display: grid;
  width: 100%;
  height: 2.25rem;
  place-items: center;
  border-radius: var(--radius-cell);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.rk-cal-day:hover:not(:disabled) {
  background: var(--color-muted);
}

.rk-cal-day:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

/* A day from the month either side: still reachable, visibly not this month. */
/* `ink-soft` and nothing else. It used to carry `opacity: 0.55` on top,
   which took a colour that clears AA down to 2.2:1 — and these are real
   buttons with real labels, reachable by script and read out by name, not
   decoration. The softer ink is already the difference between this month
   and the next. */
.rk-cal-day.is-outside {
  color: var(--color-ink-soft);
}

.rk-cal-day.is-inside {
  background: color-mix(in oklab, var(--color-primary) 14%, transparent);
  border-radius: 0;
}

.rk-cal-day.is-selected {
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  opacity: 1;
}

.rk-cal-day[aria-current='date']:not(.is-selected) {
  box-shadow: inset 0 0 0 1px var(--color-primary);
}

.rk-cal-day:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.rk-cal-blocks {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.375rem;
}

.rk-cal-block {
  height: 2.5rem;
  border-radius: var(--radius-cell);
  font-size: 0.8125rem;
  color: var(--color-ink);
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.rk-cal-block:hover {
  background: var(--color-muted);
}
</style>
