<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue'

import ScrollArea from './ScrollArea.vue'
import { fromDateKey } from '../utils/date'
import type { WeekStart } from '../utils/date'
import { formatDate } from '../utils/format'

/**
 * A year of days, as a grid you can read at a glance.
 *
 * ## It is a table, and that is not a detail
 *
 * Weekdays are the rows and weeks are the columns, so the markup is a
 * `<table>` and the visual layout falls out of it. The obvious way — one
 * CSS grid flowing column by column — puts the DOM in a different order
 * from the picture, and anything laid over that order afterwards
 * (`role="grid"`, arrow keys, a reader's own table navigation) then
 * describes a shape that is not on screen.
 *
 * ## One stop, not three hundred and sixty-five
 *
 * Every day is reachable, and the whole grid is a single stop in the tab
 * order: the arrows move between days, Home and End go to the ends of a
 * week, and Enter chooses. A grid of focusable cells is the other way this
 * is written, and it costs somebody using a keyboard a year of presses to
 * get past a picture.
 *
 * ## The colours are yours
 *
 * `levelFor` returns a class, the same contract as `ToneDot`'s `fill` and
 * `BaseTimeline`'s: the kit does not know whether four of something is a
 * lot, or which hue your product uses for "done". `dayLabel` is the same
 * for words — the kit has no language, and a date reads differently in
 * every one.
 */
const {
  days,
  label,
  levelFor,
  dayLabel,
  isSelectable = undefined,
  weekStartsOn = 1,
  startAtEnd = true,
} = defineProps<{
  /** The days to draw, as `YYYY-MM-DD`, oldest first. */
  days: readonly string[]
  /** Names the grid, e.g. "Your year". Already translated. */
  label: string
  /** A class for one day's square, e.g. `bg-positive/40`. */
  levelFor: (key: string) => string
  /** What a reader hears on a day: the date, and what happened. Translated. */
  dayLabel: (key: string) => string
  /** Which days lead somewhere. Unset, the grid is a picture and nothing else. */
  isSelectable?: ((key: string) => boolean) | undefined
  /** `1` Monday, `0` Sunday. */
  weekStartsOn?: WeekStart | undefined
  /** Open on the most recent weeks — a year otherwise starts far off-screen. */
  startAtEnd?: boolean | undefined
}>()

const emit = defineEmits<{ select: [key: string] }>()

const scroller = useTemplateRef<InstanceType<typeof ScrollArea>>('scroller')
const grid = useTemplateRef<HTMLElement>('grid')

/** Where the keyboard is: an index into `cells`, not a date. */
const focused = ref(0)

/*
 * The days, padded out to whole weeks.
 *
 * A week is seven slots whatever the range starts on, so the first column
 * is short at the top and the last is short at the bottom. Those slots are
 * `null` rather than missing, because a row with fewer cells than the one
 * above it stops being a table.
 */
const weeks = computed<(string | null)[][]>(() => {
  if (days.length === 0) return []

  const first = days[0]!
  const lead = (fromDateKey(first).getDay() - weekStartsOn + 7) % 7
  const slots: (string | null)[] = [...Array.from({ length: lead }, () => null), ...days]

  while (slots.length % 7 !== 0) slots.push(null)

  return Array.from({ length: slots.length / 7 }, (_, week) => slots.slice(week * 7, week * 7 + 7))
})

/** The weekday names, in the app's locale, starting on the chosen day. */
const weekdays = computed(() =>
  Array.from({ length: 7 }, (_, row) => {
    // 2024-01-07 was a Sunday, so this walks a real week in the right order.
    const date = new Date(2024, 0, 7)
    date.setDate(date.getDate() + ((row + weekStartsOn) % 7))

    return formatDate(date, { weekday: 'long' })
  }),
)

/**
 * A month heading per run of weeks.
 *
 * A week is counted under the month its first real day falls in, so a week
 * split across two months does not give the later one a heading of its own
 * one column wide.
 */
const months = computed(() => {
  const runs: { key: string; label: string; span: number }[] = []

  for (const week of weeks.value) {
    const day = week.find((one): one is string => one !== null)
    if (!day) continue

    const key = day.slice(0, 7)
    const last = runs.at(-1)

    if (last?.key === key) last.span += 1
    else runs.push({ key, label: formatDate(fromDateKey(day), { month: 'short' }), span: 1 })
  }

  return runs
})

/** Every real day, in reading order, which is what the arrows walk. */
const cells = computed(() =>
  weeks.value.flatMap((week, column) =>
    week.flatMap((day, row) => (day === null ? [] : [{ day, column, row }])),
  ),
)

/* `data-day` through `v-bind` rather than as an attribute of its own:
   `strictTemplates` knows the real attributes of a `<td>` and rejects a
   `data-*` written directly, while an object of them is fine. It is the
   click delegation below that needs it on the element at all. */
const dayAttrs = (day: string) => ({ 'data-day': day })

const indexOf = (day: string) => cells.value.findIndex((cell) => cell.day === day)

function moveTo(index: number) {
  const next = Math.max(0, Math.min(cells.value.length - 1, index))
  focused.value = next

  void nextTick(() => {
    grid.value?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
  })
}

/** Steps a whole column, which is a week, in reading order. */
function step(by: number) {
  const here = cells.value[focused.value]
  if (!here) return

  const wanted = { column: here.column + by, row: here.row }
  const found = cells.value.findIndex(
    (cell) => cell.column === wanted.column && cell.row === wanted.row,
  )

  // Falling off the end of a short first or last week is a no-op rather
  // than a jump to some other weekday.
  if (found !== -1) moveTo(found)
}

function choose(day: string) {
  if (isSelectable?.(day)) emit('select', day)
}

function onKeydown(event: KeyboardEvent) {
  const here = cells.value[focused.value]
  if (!here) return

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      moveTo(focused.value - 1)
      break
    case 'ArrowDown':
      event.preventDefault()
      moveTo(focused.value + 1)
      break
    case 'ArrowLeft':
      event.preventDefault()
      step(-1)
      break
    case 'ArrowRight':
      event.preventDefault()
      step(1)
      break
    case 'Home':
      event.preventDefault()
      moveTo(0)
      break
    case 'End':
      event.preventDefault()
      moveTo(cells.value.length - 1)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      choose(here.day)
      break
  }
}

/*
 * One listener for the whole grid.
 *
 * There are three hundred and sixty-five of these on screen. A handler each
 * is three hundred and sixty-five closures for markup that is a hit target
 * rather than a control, so the click is caught once and the day read off
 * the cell it landed in.
 */
function onClick(event: MouseEvent) {
  const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-day]')
  const day = cell?.dataset.day
  if (!day) return

  focused.value = indexOf(day)
  choose(day)
}

onMounted(() => {
  if (!startAtEnd) return

  const element = scroller.value?.viewport
  if (!element) return

  /*
   * A right-to-left box counts `scrollLeft` down from zero, so its far end
   * is the most negative value it takes rather than the largest. Assigning
   * `scrollWidth` there clamps to zero, which is the *start* — the grid
   * would have opened on the oldest week, which is the one thing this prop
   * exists to avoid, in the one direction nobody tests.
   *
   * Read off the document rather than the computed style: `direction` is
   * inherited through the cascade, and what sets it here is an attribute
   * one way or the other.
   */
  const rtl = (element.closest('[dir]')?.getAttribute('dir') ?? document.dir) === 'rtl'
  element.scrollLeft = rtl ? -element.scrollWidth : element.scrollWidth
})
</script>

<template>
  <ScrollArea ref="scroller" axis="x" scrollbar="hidden" :label="label" class="rk-activity">
    <table
      ref="grid"
      class="rk-activity-table"
      :aria-label="label"
      @keydown="onKeydown"
      @click="onClick"
    >
      <thead>
        <tr>
          <!-- The weekday column is a spacer here: the headings below name
               their own rows, and a heading for the headings says nothing. -->
          <td class="rk-activity-corner"></td>
          <th v-for="month in months" :key="month.key" :colspan="month.span" scope="colgroup">
            {{ month.label }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(weekday, row) in weekdays" :key="weekday">
          <th scope="row" class="rk-activity-weekday">
            <span class="sr-only">{{ weekday }}</span>
          </th>

          <template v-for="(week, column) in weeks" :key="column">
            <td
              v-if="week[row]"
              class="rk-activity-cell"
              v-bind="dayAttrs(week[row]!)"
              :tabindex="cells[focused]?.day === week[row] ? 0 : -1"
              :aria-label="dayLabel(week[row]!)"
              :class="[levelFor(week[row]!), { 'is-pickable': isSelectable?.(week[row]!) }]"
            />
            <!-- The padding at either end of the range. Empty, and skipped
                 by the arrows, but present: a row with fewer cells than the
                 one above it is no longer a table. -->
            <td v-else class="rk-activity-cell is-blank" aria-hidden="true" />
          </template>
        </tr>
      </tbody>
    </table>
  </ScrollArea>
</template>

<style scoped>
.rk-activity-table {
  border-collapse: separate;
  border-spacing: 2px;
}

.rk-activity-corner,
.rk-activity-weekday {
  width: 0;
  padding: 0;
}

.rk-activity-table th {
  color: var(--color-ink-soft);
  font-size: 0.5625rem;
  font-weight: 500;
  line-height: 1;
  text-align: start;
}

.rk-activity-cell {
  width: 0.625rem;
  height: 0.625rem;
  padding: 0;
  border-radius: var(--radius-cell);
  background: var(--color-muted);
}

.rk-activity-cell.is-blank {
  background: transparent;
}

.rk-activity-cell.is-pickable {
  cursor: pointer;
}

.rk-activity-cell:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}
</style>
