<script setup lang="ts">
import { computed } from 'vue'

import { BaseCard, BaseTable, SectionHeading, ToneDot } from '../src/index'
import type { Column } from '../src/index'
import bench from '../bench/results.json'
import { NEUTRAL } from './tones'

/**
 * What this kit does differently, as numbers rather than adjectives.
 *
 * The whole page is a demonstration of the components; this is the one
 * section that is a demonstration of the *claims*. It exists because the
 * two things worth knowing about this kit — that it is the smallest of the
 * six measured, and that every rule it states is a check that goes red —
 * are both invisible from a gallery.
 *
 * The table is not typed in. It is `bench/results.json`, written by
 * `bench/run.mjs`, so re-running the benchmark is what updates this page: a
 * comparison table maintained by hand is a comparison table that is wrong
 * by the next release, and this one silently went from 18.4 KB to 26.1 KB
 * while nobody edited it.
 */
/* An index signature, because `BaseTable`'s rows are `Record<string,
   unknown>` and a plain interface does not satisfy one — a friction any app
   with a typed row meets, and the same two words fix it. */
interface Row {
  [column: string]: unknown
  kit: string
  js: string
  css: string
  total: string
  ours: boolean
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`

const rows = computed<Row[]>(() =>
  bench.rows.map((row) => ({
    kit: row.name,
    js: kb(row.js),
    css: row.css === 0 ? '—' : kb(row.css),
    total: kb(row.js + row.css),
    ours: row.name.startsWith('rei-kit'),
  })),
)

const columns: readonly Column<Row>[] = [
  { key: 'kit', label: 'Kit' },
  { key: 'js', label: 'JavaScript', align: 'end', nowrap: true },
  { key: 'css', label: 'CSS', align: 'end', nowrap: true },
  { key: 'total', label: 'Total', align: 'end', nowrap: true },
]

/**
 * The checks worth naming, which is not all of them.
 *
 * Each one is here because it catches something no other check in the
 * project can, and because removing the thing it guards makes it go red —
 * that is the bar for a row, not "there is a test file".
 */
const GUARDS = [
  {
    file: 'direction-styles.spec.ts',
    what: 'One case per file, reading every stylesheet for a property that picks a side — a `padding-left` where `padding-inline-start` was meant — and for a one-sided gradient with no right-to-left counterpart. It found 61 on its first run.',
  },
  {
    file: 'direction-keys.spec.ts',
    what: 'One case per control, pressing ArrowLeft in a right-to-left document and asserting it went forward. Ten components were walking backwards through themselves. It type-checks, it renders, it passes axe, and only somebody reading Arabic sees it.',
  },
  {
    file: 'examples-axe.spec.ts',
    what: 'axe on every usage example, and again with each one opened. A menu, a dialog and a combobox list are exactly where the ARIA lives, and a closed-state audit says nothing about any of them.',
  },
  {
    file: 'focus.spec.ts',
    what: 'Reads every component for a focus ring. A missing one compiles, renders, and passes every other check in the project.',
  },
  {
    file: 'appearance.spec.ts',
    what: 'One case per component for a hex value, and one for a `text-white` on a filled role. Neither is a colour a palette can follow — and white on this kit’s own warning measures 2.3:1.',
  },
  {
    file: 'public-api.spec.ts',
    what: 'Names every runtime export of all six entries. A kit compiles perfectly well without an export nothing inside it happens to call.',
  },
  {
    file: 'showcase-catalogue.spec.ts',
    what: 'Fails if a component has no usage sample, no description, no behaviour test, or no row in AGENTS.md. The documentation cannot fall behind the package.',
  },
  {
    file: 'consumer.yml',
    what: 'Packs the real tarball, installs it into three separate apps and runs each one’s whole gate. The only check that imports the package the way an app does.',
  },
]
</script>

<template>
  <section id="evidence" class="mt-24">
    <SectionHeading :tone="NEUTRAL" label="Evidence" />
    <h2 class="text-ink mt-4 text-3xl font-bold tracking-tight">
      Two claims, and how to check them.
    </h2>
    <p class="text-ink-soft mt-3 max-w-[60ch] text-[0.9375rem] leading-relaxed">
      A gallery shows you what exists. It cannot show you what a kit costs, or whether the rules it
      states are enforced. Both are below, and both are reproducible.
    </p>

    <BaseCard class="mt-8">
      <h3 class="text-ink text-lg font-semibold">The smallest of six, measured</h3>
      <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
        A button, a text input and a modal — the three parts every product has — bundled with each
        kit the way its own documentation sets it up. Minified, gzip level 9, Vue excluded.
      </p>

      <div class="mt-5">
        <BaseTable :columns="columns" :rows="rows" caption="Bundle size by kit" caption-hidden>
          <template #kit="{ row }">
            <span class="inline-flex items-center gap-2" :class="row.ours ? 'font-semibold' : ''">
              <ToneDot v-if="row.ours" fill="bg-primary" label="This kit" />
              {{ row.kit }}
            </span>
          </template>
        </BaseTable>
      </div>

      <div class="text-ink-soft mt-5 max-w-[62ch] space-y-3 text-sm leading-relaxed">
        <p>
          <strong class="text-ink">Read the two columns differently.</strong> The JavaScript is only
          what those three components need: each one is its own tree-shakeable module, and there are
          no runtime dependencies at all. Naive UI, PrimeVue and Ant Design put their styles inside
          the JavaScript, which is why their CSS column is empty and their JS column is not.
        </p>
        <p>
          The CSS is the entire preset — every component, all four materials, all ten palettes — and
          it is the same size whether an app imports three components or every one of them. That is
          the trade this kit makes on purpose: a flat stylesheet paid for once, against
          per-component JavaScript paid for each time.
        </p>
        <p>
          <strong class="text-ink">What this does not say:</strong> nobody has measured the other
          five at twenty components, so the table says what it says and no more. Run it yourself
          with
          <code class="text-ink">cd bench &amp;&amp; npm install &amp;&amp; npm run bench</code>; it
          writes the numbers this page reads. Measured {{ bench.measured }}.
        </p>
      </div>
    </BaseCard>

    <BaseCard class="mt-6">
      <h3 class="text-ink text-lg font-semibold">Every rule is a check that goes red</h3>
      <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
        This kit does not assert that it is accessible, or stable, or right-to-left. It has checks
        that fail, and every one of them was verified by breaking the thing it guards. These are the
        ones that catch what nothing else in the project can.
      </p>

      <dl class="mt-5 grid gap-4 sm:grid-cols-2">
        <div v-for="guard in GUARDS" :key="guard.file" class="min-w-0">
          <dt class="text-ink font-mono text-xs font-semibold">{{ guard.file }}</dt>
          <dd class="text-ink-soft mt-1 text-sm leading-relaxed">{{ guard.what }}</dd>
        </div>
      </dl>

      <p class="text-ink-soft mt-5 max-w-[62ch] text-sm leading-relaxed">
        <strong class="text-ink">And what is still not measured.</strong> These run in jsdom, which
        has no layout — so contrast and focus order are out of reach and the axe rules for them are
        switched off rather than quietly passing. The palettes are checked against WCAG AA by
        measurement; focus order is not. That needs a real browser, and until it exists this page
        says so.
      </p>
    </BaseCard>
  </section>
</template>
