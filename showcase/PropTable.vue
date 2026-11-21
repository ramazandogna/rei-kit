<script setup lang="ts">
import { computed } from 'vue'

import { entryByName } from './catalog'
import catalogue from './props.generated.json'

/**
 * One component's props, slots or emits, read out of the source rather than
 * written by hand.
 *
 * A prop table maintained by hand is a prop table that is wrong by the second
 * release, and being wrong is worse than being absent, because a reader trusts
 * it. `scripts/extract-props.mjs` regenerates this before every showcase build,
 * so the page and the compiler are reading the same text.
 */
const {
  name,
  open = false,
  section = 'props',
} = defineProps<{ name: string; open?: boolean; section?: 'props' | 'slots' | 'emits' }>()

interface Row {
  name: string
  type: string
  segments: string[]
  default: string
  required: boolean
  note: string
}

/** Split a union at its top-level `|` only: never inside (), [], {}, <> or quotes. */
function splitUnion(type: string): string[] {
  const out: string[] = []
  let depth = 0
  let quote = ''
  let cur = ''
  for (const ch of type) {
    if (quote) {
      if (ch === quote) quote = ''
    } else if (ch === "'" || ch === '"' || ch === '`') quote = ch
    else if ('([{<'.includes(ch)) depth++
    else if (')]}>'.includes(ch) && ch !== '>') depth = Math.max(0, depth - 1)
    else if (ch === '>' && cur.slice(-1) !== '=') depth = Math.max(0, depth - 1)
    if (ch === '|' && depth === 0 && !quote) {
      out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  out.push(cur.trim())
  return out.filter(Boolean)
}

/** Minimal markdown for notes: `code` and **strong**, everything else is text. */
function md(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

const rows = computed<Row[]>(() => {
  if (section === 'props') {
    const e = catalogue.find((c) => c.name === name)
    return (e?.props ?? []).map((p) => ({
      name: p.name,
      type: p.type,
      segments: splitUnion(p.type),
      default: p.default || '',
      required: !!p.required,
      note: p.description || '',
    }))
  }
  return (entryByName(name)?.[section] ?? []).map((s) => ({
    name: s.name,
    type: s.payload,
    segments: s.payload ? splitUnion(s.payload) : [],
    default: '',
    required: false,
    note: s.description || '',
  }))
})

const entry = computed(() => catalogue.find((c) => c.name === name))
const label = computed(() =>
  section === 'props'
    ? `${rows.value.length} ${rows.value.length === 1 ? 'prop' : 'props'} · ${entry.value?.entry ?? ''}`
    : `${rows.value.length} ${section === 'slots' ? (rows.value.length === 1 ? 'slot' : 'slots') : rows.value.length === 1 ? 'event' : 'events'}`,
)
const typeHead = computed(() => (section === 'props' ? 'Type' : 'Payload'))
const isProps = computed(() => section === 'props')
</script>

<template>
  <details v-if="entry && rows.length + (isProps ? 1 : 0) > 0" :open="open" class="ptable-wrap">
    <summary class="ptable-sum">{{ label }}</summary>

    <div class="ptable-scroll">
      <table class="ptable">
        <caption class="sr-only">
          {{
            section
          }}
          of
          {{
            name
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col" class="c-name">{{ isProps ? 'Prop' : 'Name' }}</th>
            <th scope="col" class="c-type">{{ typeHead }}</th>
            <th v-if="isProps" scope="col" class="c-def">Default</th>
            <th scope="col">Note</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.name">
            <td class="pt-name">
              <code class="site-mono">{{ row.name }}</code>
              <span v-if="row.required" class="pt-req">required</span>
            </td>
            <td data-label="Type">
              <code v-if="row.segments.length" class="pt-type site-mono">
                <span v-for="(seg, i) in row.segments" :key="i" class="pt-seg">
                  {{ seg }}<i v-if="i < row.segments.length - 1" aria-hidden="true"> |</i>
                </span>
              </code>
              <span v-else class="pt-none">—</span>
            </td>
            <td v-if="isProps" data-label="Default">
              <code v-if="row.default" class="pt-default site-mono">{{ row.default }}</code>
              <span v-else class="pt-none">—</span>
            </td>
            <!-- eslint-disable-next-line vue/no-v-html -- md() escapes first, then adds only code/strong -->
            <td v-if="row.note" class="pt-note" data-label="Note" v-html="md(row.note)" />
            <td v-else class="pt-note pt-none" data-label="Note">—</td>
          </tr>
          <tr v-if="isProps && rows.length === 0">
            <td colspan="4" class="pt-none">Takes no props. It is driven by slots.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>

<style scoped>
.ptable-wrap {
  margin-top: 4px;
}
.ptable-sum {
  cursor: pointer;
  font-size: var(--site-text-xs);
  font-weight: 500;
  color: var(--color-ink-soft);
}
.ptable-sum:hover {
  color: var(--color-ink);
}
.ptable-scroll {
  margin-top: 12px;
  overflow-x: auto;
  border: 1px solid var(--color-hair);
  border-radius: var(--radius-card);
  background: var(--color-surface);
}
.ptable {
  width: 100%;
  border-collapse: collapse;
  text-align: start;
  font-size: var(--site-text-sm, 14px);
}
@media (min-width: 40rem) {
  .ptable {
    table-layout: fixed;
    min-width: 50rem;
  }
  .c-name {
    width: 11rem;
  }
  .c-type {
    width: 30%;
  }
  .c-def {
    width: 8.5rem;
  }
  .pt-note {
    min-width: 0;
    max-width: none;
  }
}
.ptable th {
  text-align: start;
  padding: 10px 16px;
  font-size: var(--site-text-xs);
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-ink-soft);
  background: color-mix(in oklab, var(--color-ink) 4%, transparent);
  white-space: nowrap;
}
.ptable td {
  padding: 12px 16px;
  vertical-align: top;
  border-top: 1px solid var(--color-hair);
}
.pt-name {
  white-space: nowrap;
}
.pt-name code {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}
.pt-req {
  margin-inline-start: 8px;
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  background: color-mix(in oklab, var(--color-negative, #c0392b) 14%, transparent);
  color: var(--color-negative, #c0392b);
}
.pt-type {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.45em;
  width: fit-content;
  max-width: min(100%, 30rem);
}
.pt-type,
.pt-default {
  max-width: min(100%, 30rem);
  padding: 2px 8px;
  border-radius: calc(var(--radius-control) * 0.7);
  font-size: 12px;
  line-height: 1.6;
  background: color-mix(in oklab, var(--color-primary) 9%, transparent);
  color: var(--color-ink);
}
.pt-default {
  display: inline-block;
  background: color-mix(in oklab, var(--color-ink) 7%, transparent);
  color: var(--color-ink-soft);
  white-space: nowrap;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
}
.pt-seg {
  white-space: nowrap;
}
.pt-seg i {
  font-style: normal;
  opacity: 0.5;
}
.pt-none {
  color: var(--color-ink-soft);
  opacity: 0.7;
}
.pt-note {
  min-width: 16rem;
  max-width: 44ch;
  line-height: 1.55;
  color: var(--color-ink-soft);
}
.pt-note :deep(code) {
  padding: 1px 5px;
  border-radius: 4px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.875em;
  background: color-mix(in oklab, var(--color-ink) 8%, transparent);
  color: var(--color-ink);
}
.pt-note :deep(strong) {
  color: var(--color-ink);
  font-weight: 600;
}
/* A four-column table on a phone is four slivers of text. Under 40rem each
   prop becomes a small card: the name as its heading, the rest labelled. */
@media (max-width: 39.99rem) {
  .ptable thead {
    display: none;
  }
  .ptable,
  .ptable tbody,
  .ptable tr,
  .ptable td {
    display: block;
    width: 100%;
    max-width: none;
  }
  .ptable tr {
    padding: 12px 0;
    border-top: 1px solid var(--color-hair);
  }
  .ptable tr:first-child {
    border-top: 0;
  }
  .ptable td {
    display: block;
    padding: 4px 14px;
    border-top: 0;
    min-width: 0;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .ptable td.pt-name {
    display: block;
    padding-bottom: 6px;
  }
  .ptable td[data-label]::before {
    content: attr(data-label);
    display: inline-block;
    min-width: 4.5rem;
    color: var(--color-ink-soft);
    opacity: 0.7;
    font-size: var(--site-text-xs);
  }
  .pt-type,
  .pt-default {
    max-width: 100%;
  }
  .pt-note {
    min-width: 0;
  }
}
</style>
