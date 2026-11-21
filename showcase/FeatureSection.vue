<script setup lang="ts">
import { Accessibility, Bot, Code2, Feather, SlidersHorizontal } from 'lucide-vue-next'

import { COMPONENT_COUNT } from './site'

/**
 * The feature blocks under the hero. Every number is measured: `pnpm size`
 * (minified, gzip -9, Vue excluded) and bench/results.json.
 */
const BLOCKS = [
  {
    icon: Bot,
    title: 'AI-ready from the first prompt',
    body: 'Every component page has an AI prompt tab you can paste straight into your assistant, and the site ships llms.txt and llms-full.txt. Typed props give Copilot, Cursor and Claude a precise contract, so generated code compiles instead of guessing.',
  },
  {
    icon: Code2,
    title: 'TypeScript and JavaScript, both first-class',
    body: 'Every example is shown in TypeScript and JavaScript. Props, emits and slots are fully typed with no any, so autocomplete and type checks work out of the box.',
  },
  {
    icon: Accessibility,
    title: 'Accessible by default',
    body: 'Components follow WAI-ARIA patterns for keyboard, focus and labelling; overlays trap and return focus. Every palette is checked for WCAG AA contrast in light and dark, and motion respects prefers-reduced-motion.',
  },
  {
    icon: SlidersHorizontal,
    title: 'One attribute switches the look',
    body: 'Set data-material and data-palette on the root and every surface follows: quiet, glassmorphism, neobrutalism or soft, across ten palettes, light or dark. No component changes, no Tailwind config to extend.',
  },
] as const

const WEIGHTS = [
  { value: '1.3 KB', label: 'a BaseButton' },
  { value: '3.7 KB', label: 'button + input + modal' },
  { value: '27.9 KB', label: 'same three in Element Plus' },
  { value: '54.9 KB', label: 'same three in PrimeVue' },
] as const
</script>

<template>
  <section class="fs site-page" aria-labelledby="fs-title">
    <h2 id="fs-title" class="fs-title">Sharp as a razor.<span> Light as a feather.</span></h2>
    <p class="fs-lead">
      {{ COMPONENT_COUNT }} components. A BaseButton costs 1.3 KB of JavaScript; a button, input and
      modal 3.7 KB; all components 59.4 KB (minified, gzipped, Vue excluded). The core CSS is 25.3
      KB, paid once.
    </p>

    <ul class="fs-weights surface" aria-label="Measured JavaScript cost, minified and gzipped">
      <li v-for="w in WEIGHTS" :key="w.label">
        <b>{{ w.value }}</b>
        <span>{{ w.label }}</span>
      </li>
    </ul>

    <div class="fs-grid">
      <article v-for="b in BLOCKS" :key="b.title" class="fs-card surface">
        <span class="fs-icon" aria-hidden="true"><component :is="b.icon" class="size-5" /></span>
        <h3>{{ b.title }}</h3>
        <p>{{ b.body }}</p>
      </article>
      <article class="fs-card surface fs-wide">
        <span class="fs-icon" aria-hidden="true"><Feather class="size-5" /></span>
        <h3>Light, measured</h3>
        <p>
          In our bench, the same three components take 27.9 KB in Element Plus and 54.9 KB in
          PrimeVue, against 3.7 KB here.
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.fs {
  padding-block: 5rem 2rem;
}
.fs-title {
  font-size: clamp(2.25rem, 6vw, 4.5rem);
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--color-ink);
  text-wrap: balance;
}
.fs-title span {
  background: linear-gradient(100deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.fs-lead {
  margin-top: 1.25rem;
  max-width: 52ch;
  font-size: var(--site-text-lg);
  line-height: 1.55;
  color: var(--color-ink-soft);
}
.fs-weights {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  margin-top: 2rem;
  padding: 0;
  list-style: none;
  border-radius: var(--radius-card);
  overflow: hidden;
}
@media (min-width: 48rem) {
  .fs-weights {
    grid-template-columns: repeat(4, 1fr);
  }
}
.fs-weights li {
  display: grid;
  gap: 4px;
  padding: 1.25rem 1.5rem;
}
.fs-weights b {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--color-primary);
}
.fs-weights span {
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
}
.fs-grid {
  display: grid;
  gap: 16px;
  margin-top: 1.5rem;
}
@media (min-width: 48rem) {
  .fs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .fs-wide {
    grid-column: 1 / -1;
  }
}
.fs-card {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 1.5rem;
  border-radius: var(--radius-card);
}
.fs-card h3 {
  font-size: var(--site-text-lg);
  font-weight: 600;
  letter-spacing: -0.01em;
}
.fs-card p {
  font-size: var(--site-text-sm);
  line-height: 1.6;
  color: var(--color-ink-soft);
}
.fs-icon {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: var(--radius-control);
  background: color-mix(in oklab, var(--color-primary) 14%, transparent);
  color: var(--color-primary);
}
</style>
