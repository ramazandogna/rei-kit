<script setup lang="ts" generic="Row extends Record<string, unknown>">
export interface Column<Row> {
  /** Key into the row, and the slot name for a custom cell. */
  key: string & keyof Row
  /** Column heading. Already translated. */
  label: string
  /** `end` for money and counts, which are read by their last digit. */
  align?: 'start' | 'end' | undefined
  /** Stops a column wrapping — dates, short codes. */
  nowrap?: boolean | undefined
}

/**
 * Rows of data, with the parts a hand-written `<table>` leaves out.
 *
 * ## The caption is required, and it is not a heading
 *
 * A table with no caption is announced as "table" and nothing else, so a screen
 * reader user landing in one has no idea what they are in. `captionHidden`
 * exists because the page usually already says it in a heading above — but the
 * table still has to carry its own name, because a heading is not attached to
 * anything.
 *
 * ## Scrolling belongs to the table, not the page
 *
 * A wide table inside a narrow column either overflows the page sideways —
 * which takes every other element with it — or is clipped. So the table sits in
 * its own scroller, and the scroller is focusable: a region you can only reach
 * by dragging is a region a keyboard cannot read at all. That is one line of
 * markup and it is the line everyone forgets.
 *
 * Headers carry `scope="col"`, which is what lets a screen reader say the
 * column name before each cell instead of reading a wall of numbers.
 */
const {
  columns,
  rows,
  caption,
  captionHidden = false,
  rowKey,
} = defineProps<{
  columns: readonly Column<Row>[]
  rows: readonly Row[]
  /** What this table is. Required — an unnamed table is a box of numbers. */
  caption: string
  /** Keeps the caption for assistive tech when the page already shows a heading. */
  captionHidden?: boolean | undefined
  /** Which field identifies a row. Falls back to the index. */
  rowKey?: (string & keyof Row) | undefined
}>()

defineSlots<{
  /** Per-column cell override, named for the column key. */
  [key: string]: (props: { row: Row; value: unknown }) => unknown
  /** Shown instead of the body when there are no rows. */
  empty?: () => unknown
}>()

const keyFor = (row: Row, index: number) => (rowKey ? String(row[rowKey]) : index)
</script>

<template>
  <div class="rk-table-scroll" tabindex="0" role="region" :aria-label="caption">
    <table class="rk-table">
      <caption :class="captionHidden ? 'rk-table-caption-hidden' : 'rk-table-caption'">
        {{
          caption
        }}
      </caption>

      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :class="[column.align === 'end' && 'is-end', column.nowrap && 'is-nowrap']"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>

      <tbody v-if="rows.length > 0">
        <tr v-for="(row, index) in rows" :key="keyFor(row, index)">
          <td
            v-for="column in columns"
            :key="column.key"
            :class="[column.align === 'end' && 'is-end', column.nowrap && 'is-nowrap']"
          >
            <slot :name="column.key" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td :colspan="columns.length" class="rk-table-empty">
            <slot name="empty" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.rk-table-scroll {
  overflow-x: auto;
}

.rk-table-scroll:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-cell);
}

.rk-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.rk-table-caption {
  padding-bottom: 0.75rem;
  text-align: left;
  font-size: 0.8125rem;
  color: var(--color-ink-soft);
}

/* Off screen rather than `display: none`, which is not announced at all. */
.rk-table-caption-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.rk-table th {
  border-bottom: 1px solid var(--color-hair);
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-weight: 500;
  color: var(--color-ink-soft);
  white-space: nowrap;
}

.rk-table td {
  border-bottom: 1px solid color-mix(in srgb, var(--color-hair) 50%, transparent);
  padding: 0.75rem;
  color: var(--color-ink);
  vertical-align: top;
}

.rk-table tbody tr:last-child td {
  border-bottom: 0;
}

/* Numbers line up on their last digit, which is the one being compared. */
.is-end {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.is-nowrap {
  white-space: nowrap;
}

.rk-table-empty {
  padding: 2rem 0.75rem;
  text-align: center;
  color: var(--color-ink-soft);
}
</style>
