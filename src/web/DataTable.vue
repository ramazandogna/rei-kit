<script setup lang="ts" generic="Row extends Record<string, unknown>">
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-vue-next'
import { computed } from 'vue'

import BaseCheckbox from '../components/BaseCheckbox.vue'
import ScrollArea from '../components/ScrollArea.vue'
import BaseSkeleton from '../components/BaseSkeleton.vue'
import type { Column } from '../components/BaseTable.vue'

export interface DataColumn<Row> extends Column<Row> {
  /** Adds a button to the header that sorts by this column. */
  sortable?: boolean | undefined
}

export interface TableSort<Row> {
  key: string & keyof Row
  direction: 'asc' | 'desc'
}

/**
 * `BaseTable` with the three things a table of real data grows: a sort, a
 * selection, and something to show while it is loading.
 *
 * Sorting happens here by default — comparing numbers as numbers and strings
 * with `localeCompare`, so "Ömer" lands where a reader expects. Set
 * `manualSort` and it only reports what was asked for, which is what a
 * server-paged table needs: sorting the twenty rows on screen would be a
 * lie about the other nine thousand.
 *
 * The header's sort control is a real button inside the `th`, and the `th`
 * carries `aria-sort`. That pair is what a screen reader reads as "sorted
 * ascending"; a `div` with a click handler and an arrow glyph is neither.
 *
 * Selection needs `rowKey`, because a selection of row indexes is a
 * selection that changes meaning the moment the table is sorted.
 */
const {
  columns,
  rows,
  caption,
  captionHidden = false,
  rowKey = undefined,
  selectAllLabel = undefined,
  rowLabel = undefined,
  manualSort = false,
  loading = false,
  loadingRows = 5,
  stickyHeader = false,
} = defineProps<{
  columns: readonly DataColumn<Row>[]
  rows: readonly Row[]
  /** What this table is. Required — an unnamed table is a box of numbers. */
  caption: string
  captionHidden?: boolean | undefined
  /** Which field identifies a row. Required for selection. */
  rowKey?: (string & keyof Row) | undefined
  /** Given with `rowKey`, the table grows a checkbox column. Names the header one. */
  selectAllLabel?: string | undefined
  /** Names each row's checkbox from the row: `(row) => \`Select ${row.name}\``. */
  rowLabel?: ((row: Row) => string) | undefined
  /** Report the sort instead of doing it — for a server that pages the data. */
  manualSort?: boolean | undefined
  /** Draws skeleton rows instead of the body. */
  loading?: boolean | undefined
  loadingRows?: number | undefined
  /** Keeps the header on screen while the body scrolls under it. */
  stickyHeader?: boolean | undefined
}>()

defineSlots<{
  /** Per-column cell override, named for the column key. */
  [key: string]: (props: { row: Row; value: unknown }) => unknown
  /** Shown instead of the body when there are no rows. */
  empty?: () => unknown
}>()

/** Which column is sorted, and which way. `v-model:sort`. */
const sort = defineModel<TableSort<Row> | undefined>('sort', { default: undefined })
/** The chosen rows' keys. `v-model:selected`. */
const selected = defineModel<string[]>('selected', { default: () => [] })

const selectable = computed(() => Boolean(rowKey && selectAllLabel && rowLabel))

const keyOf = (row: Row, index: number) => (rowKey ? String(row[rowKey]) : String(index))

/* Numbers compared as numbers, everything else through the reader's
   collation: `'ö' < 'p'` is false as a code point and true in Turkish. */
function compare(a: unknown, b: unknown) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a == null) return b == null ? 0 : -1
  if (b == null) return 1

  return String(a).localeCompare(String(b))
}

const shown = computed(() => {
  if (!sort.value || manualSort) return rows

  const { key, direction } = sort.value
  const sorted = [...rows].sort((a, b) => compare(a[key], b[key]))

  return direction === 'asc' ? sorted : sorted.reverse()
})

/** Ascending, then descending, then back to the order it arrived in. */
function toggleSort(column: DataColumn<Row>) {
  if (!column.sortable) return

  if (sort.value?.key !== column.key) {
    sort.value = { key: column.key, direction: 'asc' }
    return
  }

  sort.value = sort.value.direction === 'asc' ? { key: column.key, direction: 'desc' } : undefined
}

const ariaSort = (column: DataColumn<Row>) => {
  if (!column.sortable) return undefined
  if (sort.value?.key !== column.key) return 'none'

  return sort.value.direction === 'asc' ? 'ascending' : 'descending'
}

const allKeys = computed(() => shown.value.map((row, index) => keyOf(row, index)))
const allChosen = computed(
  () => allKeys.value.length > 0 && allKeys.value.every((key) => selected.value.includes(key)),
)
const someChosen = computed(
  () => !allChosen.value && allKeys.value.some((key) => selected.value.includes(key)),
)

function toggleAll() {
  selected.value = allChosen.value ? [] : allKeys.value
}

function toggleRow(key: string) {
  selected.value = selected.value.includes(key)
    ? selected.value.filter((one) => one !== key)
    : [...selected.value, key]
}

const columnCount = computed(() => columns.length + (selectable.value ? 1 : 0))
</script>

<template>
  <ScrollArea axis="x" :label="caption" class="rk-data-scroll">
    <table class="rk-data" :class="{ 'is-sticky': stickyHeader }">
      <caption :class="captionHidden ? 'rk-data-caption-hidden' : 'rk-data-caption'">
        {{
          caption
        }}
      </caption>

      <thead>
        <tr>
          <th v-if="selectable" scope="col" class="rk-data-pick">
            <!-- The kit's own box, now that it has `indeterminate`. Writing
                 this by hand was the only reason it did not, and a
                 hand-written control in a file that imports the kit is a
                 gap in the kit every time. -->
            <BaseCheckbox
              :model-value="allChosen"
              :indeterminate="someChosen"
              :label="selectAllLabel!"
              label-hidden
              @update:model-value="toggleAll"
            />
          </th>

          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :aria-sort="ariaSort(column)"
            :class="[column.align && `is-${column.align}`, column.nowrap && 'is-nowrap']"
          >
            <button
              v-if="column.sortable"
              type="button"
              class="rk-data-sort focus-ring"
              @click="toggleSort(column)"
            >
              {{ column.label }}
              <ArrowUp
                v-if="ariaSort(column) === 'ascending'"
                class="size-3.5"
                aria-hidden="true"
              />
              <ArrowDown
                v-else-if="ariaSort(column) === 'descending'"
                class="size-3.5"
                aria-hidden="true"
              />
              <ChevronsUpDown v-else class="size-3.5 opacity-40" aria-hidden="true" />
            </button>
            <template v-else>{{ column.label }}</template>
          </th>
        </tr>
      </thead>

      <tbody v-if="loading" aria-busy="true">
        <tr v-for="row in loadingRows" :key="row">
          <td v-if="selectable" />
          <td v-for="column in columns" :key="column.key">
            <BaseSkeleton shape="text" height="0.75rem" width="70%" />
          </td>
        </tr>
      </tbody>

      <tbody v-else-if="shown.length > 0">
        <tr
          v-for="(row, index) in shown"
          :key="keyOf(row, index)"
          :class="{ 'is-chosen': selected.includes(keyOf(row, index)) }"
        >
          <td v-if="selectable" class="rk-data-pick">
            <BaseCheckbox
              :model-value="selected.includes(keyOf(row, index))"
              :label="rowLabel!(row)"
              label-hidden
              @update:model-value="toggleRow(keyOf(row, index))"
            />
          </td>

          <td
            v-for="column in columns"
            :key="column.key"
            :class="[column.align && `is-${column.align}`, column.nowrap && 'is-nowrap']"
          >
            <slot :name="column.key" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td :colspan="columnCount" class="rk-data-empty">
            <slot name="empty" />
          </td>
        </tr>
      </tbody>
    </table>
  </ScrollArea>
</template>

<style scoped>
/* `ScrollArea` owns the scrolling and decides whether this is a focus
   stop: with selection or a sortable column there is already a way in for
   a keyboard, and a stop of its own would be a press for nothing. */
.rk-data-scroll {
  border-radius: var(--radius-card);
}

.rk-data {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.rk-data-caption {
  padding-bottom: 0.5rem;
  text-align: start;
  font-size: 0.8125rem;
  color: var(--color-ink-soft);
}

.rk-data-caption-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.rk-data th {
  border-bottom: 1px solid var(--color-hair);
  padding: 0.625rem 0.75rem;
  text-align: start;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-ink-soft);
  white-space: nowrap;
}

.rk-data.is-sticky thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-surface);
}

.rk-data td {
  border-bottom: 1px solid color-mix(in oklab, var(--color-hair) 60%, transparent);
  padding: 0.625rem 0.75rem;
  color: var(--color-ink);
  vertical-align: middle;
}

.rk-data tbody tr:last-child td {
  border-bottom: 0;
}

.rk-data tbody tr.is-chosen td {
  background: color-mix(in oklab, var(--color-primary) 8%, transparent);
}

/* Named against `.rk-data th`, which sets `text-align: left` and would
   otherwise win: the heading stayed on the left while its numbers sat at the
   far edge, so one column read as two. The sort button is inline-flex, so it
   follows the heading's alignment and carries the arrow with it. */
.rk-data th.is-end,
.rk-data td.is-end {
  text-align: end;
  font-variant-numeric: tabular-nums;
}

.rk-data th.is-center,
.rk-data td.is-center {
  text-align: center;
}

.rk-data th.is-start,
.rk-data td.is-start {
  text-align: start;
}

.is-nowrap {
  white-space: nowrap;
}

.rk-data-sort {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: var(--radius-cell);
  color: inherit;
  transition: color var(--duration-fast) var(--ease-standard);
}

.rk-data-sort:hover {
  color: var(--color-ink);
}

.rk-data-pick {
  width: 2.75rem;
  padding-inline-end: 0;
}

.rk-data-empty {
  padding: 2rem 0.75rem;
  text-align: center;
  color: var(--color-ink-soft);
}
</style>
