<script setup lang="ts">
import { computed } from 'vue'

import { BarChart, BaseCard, BaseTable, DonutChart, SectionHeading } from '../src/index'
import { BaseDisclosure } from '../src/web/index'
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
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`

const suites = computed(() =>
  bench.suites.map((suite) => ({
    id: suite.id,
    label: suite.label,
    rows: suite.rows.map<Row>((row) => ({
      kit: row.name,
      js: kb(row.js),
      css: row.css === 0 ? '—' : kb(row.css),
      total: kb(row.js + row.css),
    })),
  })),
)

/*
 * The same numbers as bars, drawn with the kit's own `BarChart`.
 *
 * Two things at once, and the second is the reason it is here rather than
 * a picture: the table below says it, and the chart is the kit drawing its
 * own measurement of itself. The bars scale from zero and every number is
 * printed beside its bar, so the picture cannot say anything the table
 * does not — which matters more here than anywhere else on the page,
 * because this is the one chart with something to gain by exaggerating.
 */
const chart = computed(() =>
  (bench.suites.find((suite) => suite.id === 'ten')?.rows ?? []).map((row) => ({
    key: row.name,
    label: row.name.replace(/ [\d.]+$/, ''),
    value: (row.js + row.css) / 1024,
    ours: row.name.startsWith('rei-kit'),
  })),
)

/** What this kit's own stylesheet is made of, measured from `dist`. */
const STYLESHEET = [
  { key: 'components', label: 'Component styles', value: 20.0 },
  { key: 'tokens', label: 'Tokens and utilities', value: 4.4 },
  { key: 'palettes', label: 'Ten palettes, both modes', value: 2.1 },
  { key: 'motion', label: 'Motion', value: 1.2 },
  { key: 'materials', label: 'Four materials', value: 0.3 },
]

const TONES = ['text-primary', 'text-accent', 'text-positive', 'text-warning', 'text-ink-soft']

/** How many times the total of the runner-up is, in the ten-component case. */
const lead = computed(() => {
  const rows = bench.suites.find((suite) => suite.id === 'ten')?.rows ?? []
  const ours = rows.find((row) => row.name.startsWith('rei-kit'))
  const next = rows.find((row) => !row.name.startsWith('rei-kit'))
  if (!ours || !next) return null

  return ((next.js + next.css) / (ours.js + ours.css)).toFixed(1)
})

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
/*
 * Three, chosen because each names a fault nothing else in the project can
 * see and a reader can picture in one line. The full list is a wall, and a
 * wall is read as decoration.
 */
const HEADLINE = [
  {
    file: 'direction-keys.spec.ts',
    what: 'ArrowLeft, in Arabic, must move forward',
    why: 'ten components were walking backwards through themselves, and it type-checked, rendered and passed axe',
  },
  {
    file: 'examples-axe.spec.ts',
    what: 'every example audited open, not just closed',
    why: 'a menu, a dialog and a combobox list are exactly where the ARIA lives',
  },
  {
    file: 'consumer.yml',
    what: 'the real tarball, installed into three apps',
    why: 'every one of their own test suites runs against it before a release goes out',
  },
]

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
    <h2 class="text-ink mt-4 text-3xl font-bold tracking-tight">Smaller as you use more of it.</h2>
    <p class="text-ink-soft mt-3 max-w-[58ch] text-[0.9375rem] leading-relaxed">
      Every kit is small in a demo. This one is a flat stylesheet and per-component JavaScript, so
      the tenth component costs almost nothing — the opposite shape from a kit that ships its styles
      inside its JavaScript. Here is what that looks like on a real screen: ten components, bundled
      the way each kit's own documentation sets it up.
    </p>

    <BaseCard class="mt-8">
      <BarChart
        :series="chart"
        label="Total bundle size at ten components, by kit"
        :value-label="(value) => `${value.toFixed(1)} KB`"
        :fill="(item) => (item.ours ? 'bg-positive' : 'bg-muted')"
      />

      <p class="text-ink-soft mt-5 max-w-[58ch] text-sm leading-relaxed">
        A quarter smaller at three components;
        <strong class="text-ink">{{ lead }}× smaller at ten</strong>. Seven more components cost
        this kit about 5 KB and cost the others 60 to 125, because only the JavaScript grows here.
      </p>
      <p class="text-ink-soft mt-2 max-w-[58ch] text-sm leading-relaxed">
        Drawn with the kit's own <code class="text-ink">BarChart</code>, from the file
        <code class="text-ink">bench/run.mjs</code> writes. It is a table underneath, the scale
        starts at zero, and a test fails if the numbers are not the published version's.
      </p>

      <div class="mt-5">
        <BaseDisclosure title="The numbers, both cases" :heading-level="4">
          <div v-for="suite in suites" :key="suite.id" class="mt-4 first:mt-1">
            <h5 class="text-ink text-sm font-semibold">{{ suite.label }}</h5>
            <div class="mt-2">
              <BaseTable
                :columns="columns"
                :rows="suite.rows"
                :caption="`Bundle size by kit — ${suite.label}`"
                caption-hidden
              />
            </div>
          </div>

          <p class="text-ink-soft mt-4 max-w-[58ch] text-sm leading-relaxed">
            Three components is the case <em>least</em> favourable to a flat stylesheet, and it is
            still the one this kit wins. Nothing has been measured past ten, and these are ten
            components imported rather than an app using them. The ten-component row uses
            <code class="text-ink">DataTable</code> and not the plainer
            <code class="text-ink">BaseTable</code>, because the others bring a data grid and the
            comparable part is the heavier one. Run it yourself:
            <code class="text-ink">cd bench &amp;&amp; npm run bench</code>. Measured
            {{ bench.measured }}.
          </p>
        </BaseDisclosure>
      </div>
    </BaseCard>

    <BaseCard class="mt-6">
      <h3 class="text-ink text-lg font-semibold">Where the flat 23 KB goes</h3>
      <p class="text-ink-soft mt-2 max-w-[58ch] text-sm leading-relaxed">
        Nearly all of it is one file: every component's styles, shipped whole. That is what an app
        using three components carries — and what an app using ninety never pays again.
      </p>

      <div class="mt-5">
        <DonutChart
          :slices="STYLESHEET"
          label="What the mobile.css preset is made of"
          :value-label="(value) => `${value.toFixed(1)} KB`"
          :fill="(_, index) => TONES[index % TONES.length]!"
        />
      </div>
    </BaseCard>

    <BaseCard class="mt-6">
      <h3 class="text-ink text-lg font-semibold">It does not claim to be accessible</h3>
      <p class="text-ink-soft mt-2 max-w-[58ch] text-sm leading-relaxed">
        It has checks that go red instead, and each was verified by breaking the thing it guards.
        Three of the 1,333, to show what kind of thing they are:
      </p>

      <ul class="text-ink-soft mt-4 max-w-[58ch] space-y-2 text-sm leading-relaxed">
        <li v-for="guard in HEADLINE" :key="guard.file">
          <strong class="text-ink">{{ guard.what }}</strong> — {{ guard.why }}
        </li>
      </ul>

      <div class="mt-5">
        <BaseDisclosure title="The rest, and what is still not measured" :heading-level="4">
          <dl class="mt-1 grid gap-4 sm:grid-cols-2">
            <div v-for="guard in GUARDS" :key="guard.file" class="min-w-0">
              <dt class="text-ink font-mono text-xs font-semibold">{{ guard.file }}</dt>
              <dd class="text-ink-soft mt-1 text-sm leading-relaxed">{{ guard.what }}</dd>
            </div>
          </dl>

          <p class="text-ink-soft mt-5 max-w-[58ch] text-sm leading-relaxed">
            <strong class="text-ink">What is still not measured.</strong> These run in jsdom, which
            has no layout, so contrast and focus order are out of reach — the axe rules for both are
            switched off rather than quietly passing, and the palettes are checked by measuring
            their pairings instead. That needs a real browser, and until it exists this page says
            so.
          </p>
        </BaseDisclosure>
      </div>
    </BaseCard>
  </section>
</template>
