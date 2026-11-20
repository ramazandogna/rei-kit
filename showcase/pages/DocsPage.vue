<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { BaseCard, BaseSwitch, BaseButton, BaseInput } from '../../src/index'
import pkg from '../../package.json'
import AxesSection from '../AxesSection.vue'
import CodeBlock from '../CodeBlock.vue'
import { DOC_PAGES } from '../docs'
import EvidenceSection from '../EvidenceSection.vue'
import GettingStarted from '../GettingStarted.vue'
import MotionSection from '../MotionSection.vue'
import OverrideSection from '../OverrideSection.vue'
import { readableRange } from '../versions'
import NotFound from './NotFound.vue'

/**
 * Docs: a sidebar of seven pages, one page at a time, an "On this page" rail
 * from 1280px up, and previous/next at the foot. The long landing sections
 * that used to be one scroll live here as pages.
 */
const route = useRoute()
const slug = computed(() => String(route.params['page'] || 'install'))
const index = computed(() => DOC_PAGES.findIndex((p) => p.slug === slug.value))
const page = computed(() => DOC_PAGES[index.value])
const prev = computed(() => DOC_PAGES[index.value - 1])
const next = computed(() => DOC_PAGES[index.value + 1])

const PLATFORM = [
  `Vue ${readableRange(pkg.peerDependencies.vue)} (Composition API)`,
  `Tailwind CSS ${readableRange(pkg.peerDependencies.tailwindcss)} (Vite plugin)`,
  'TypeScript (types included) and JavaScript (same API)',
  'SSR and prerendering',
  'MIT licence',
]

const rtl = ref(false)
function setDir(value: boolean) {
  rtl.value = value
  document.documentElement.dir = value ? 'rtl' : 'ltr'
}

const CHECK = `import { checkStyling } from 'rei-kit/check'
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('wires rei-kit correctly', () => {
  expect(
    checkStyling({
      css: readFileSync('src/assets/main.css', 'utf8'),
      tokens: readFileSync('node_modules/rei-kit/dist/tokens.css', 'utf8'),
    }),
  ).toEqual([])
})`
const RTL_CODE = `import { horizontalStep, textDirection } from 'rei-kit'

// Arrow keys mean "next" only where the writing does.
const step = horizontalStep(event.key, event.target)
const dir = textDirection('ar') // 'rtl'`

/* The right rail: the page's own sections, the current one highlighted. */
const current = ref('')
let io: IntersectionObserver | undefined
async function observe() {
  io?.disconnect()
  await nextTick()
  const items = page.value?.sections ?? []
  current.value = items[0]?.id ?? ''
  if (typeof IntersectionObserver === 'undefined') return
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) current.value = e.target.id
    },
    { rootMargin: '-72px 0px -60% 0px' },
  )
  for (const s of items) {
    const el = document.getElementById(s.id)
    if (el) io.observe(el)
  }
}
watch(slug, observe)
onMounted(observe)
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <NotFound v-if="!page" />

  <div v-else class="site-page docs">
    <nav class="docs-nav" aria-label="Docs">
      <ul>
        <li v-for="p in DOC_PAGES" :key="p.slug">
          <RouterLink
            :to="`/docs/${p.slug}`"
            class="docs-link focus-ring"
            :aria-current="p.slug === slug ? 'page' : undefined"
            >{{ p.title }}</RouterLink
          >
        </li>
      </ul>
    </nav>

    <article class="docs-body">
      <header>
        <p class="site-eyebrow">Docs</p>
        <h1 class="site-h1">{{ page.title }}</h1>
        <p class="site-lead">{{ page.summary }}</p>
      </header>

      <template v-if="slug === 'install'">
        <section id="runs-on" class="docs-sec">
          <h2 class="site-h2">Runs on</h2>
          <ul class="docs-list">
            <li v-for="p in PLATFORM" :key="p">{{ p }}</li>
          </ul>
        </section>
        <GettingStarted />
      </template>

      <template v-else-if="slug === 'theming'">
        <AxesSection />
        <OverrideSection />
      </template>

      <template v-else-if="slug === 'motion'">
        <MotionSection />
        <section id="reduced" class="docs-sec">
          <h2 class="site-h2">Reduced motion</h2>
          <p class="docs-p">
            Everything that moves checks <code>prefers-reduced-motion</code>. Counters show their
            final value, marquees stop, rotating text holds one word, and effects render a static
            frame. No animation runs longer than five seconds unless you opt in with
            <code>loop</code>.
          </p>
        </section>
      </template>

      <template v-else-if="slug === 'accessibility'">
        <section id="what" class="docs-sec">
          <h2 class="site-h2">What is covered</h2>
          <p class="docs-p">WCAG AA palettes, APG keyboard patterns, tested.</p>
          <p class="docs-p">
            Every palette pairing is measured in light and dark before it ships. Keyboard patterns
            follow the WAI-ARIA Authoring Practices. This is a kit, not a promise about your
            product: an app built on accessible parts can still be inaccessible, so test with a
            keyboard and a screen reader.
          </p>
        </section>
      </template>

      <template v-else-if="slug === 'performance'">
        <EvidenceSection />
      </template>

      <template v-else-if="slug === 'rtl'">
        <section id="try" class="docs-sec">
          <h2 class="site-h2">Try it</h2>
          <BaseCard class="docs-card">
            <BaseSwitch
              :model-value="rtl"
              label="Right to left"
              @update:model-value="setDir($event)"
            />
            <BaseInput label="Name" placeholder="Aiko" />
            <BaseButton variant="secondary">Next</BaseButton>
          </BaseCard>
          <p class="docs-p">
            Components use logical properties, and keys that mean "next" are mirrored through the
            kit's helpers.
          </p>
          <CodeBlock :code="RTL_CODE" lang="ts" />
        </section>
      </template>

      <template v-else-if="slug === 'check'">
        <section id="run" class="docs-sec">
          <h2 class="site-h2">Run the check</h2>
          <p class="docs-p">
            A component that renders unstyled almost always means a missing import or a missing
            <code>@source</code> line. <code>checkStyling</code> reads your CSS and the kit's tokens
            and names the problem.
          </p>
          <CodeBlock :code="CHECK" lang="ts" file="setup.test.ts" />
        </section>
      </template>

      <nav class="docs-pn" aria-label="Docs pages">
        <RouterLink v-if="prev" :to="`/docs/${prev.slug}`" class="docs-pn-link surface"
          ><small>Previous</small><b>{{ prev.title }}</b></RouterLink
        >
        <span v-else />
        <RouterLink v-if="next" :to="`/docs/${next.slug}`" class="docs-pn-link surface is-next"
          ><small>Next</small><b>{{ next.title }}</b></RouterLink
        >
      </nav>
    </article>

    <aside class="docs-rail" aria-label="On this page">
      <p class="site-eyebrow">On this page</p>
      <ul>
        <li v-for="s in page.sections" :key="s.id">
          <RouterLink
            :to="{ path: route.path, hash: `#${s.id}` }"
            class="docs-rail-link"
            :class="{ 'is-current': current === s.id }"
            >{{ s.label }}</RouterLink
          >
        </li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
.docs {
  display: grid;
  gap: 24px;
  padding-top: 32px;
}
.docs-nav ul {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.docs-link {
  display: block;
  border-radius: var(--radius-control);
  padding: 6px 12px;
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
}
.docs-link:hover {
  color: var(--color-ink);
}
.docs-link[aria-current='page'] {
  background: var(--color-muted);
  color: var(--color-ink);
  font-weight: 600;
}
.docs-body header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.docs-body {
  min-width: 0;
  max-width: var(--measure-reading, 68ch);
}
.docs-body :deep(.landing-section) {
  padding-top: 48px;
}
.docs-sec {
  padding-top: 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.docs-p {
  color: var(--color-ink-soft);
  max-width: 68ch;
  line-height: 1.6;
}
.docs-list {
  list-style: disc;
  padding-inline-start: 20px;
  line-height: 1.8;
}
.docs-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 22rem;
}
.docs-rail {
  display: none;
}
.docs-pn {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 64px;
}
.docs-pn-link {
  display: block;
  border-radius: var(--radius-card);
  padding: 16px;
}
.docs-pn-link.is-next {
  text-align: end;
}
.docs-pn-link small {
  display: block;
  font-size: var(--site-text-xs);
  color: var(--color-ink-soft);
}
@media (min-width: 64rem) {
  .docs {
    grid-template-columns: 15rem minmax(0, 1fr);
    gap: 48px;
  }
  .docs-nav {
    position: sticky;
    top: 80px;
    align-self: start;
  }
  .docs-nav ul {
    flex-direction: column;
  }
}
@media (min-width: 80rem) {
  .docs {
    grid-template-columns: 15rem minmax(0, 1fr) 13rem;
  }
  .docs-rail {
    display: block;
    position: sticky;
    top: 80px;
    align-self: start;
  }
  .docs-rail ul {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: var(--site-text-sm);
  }
  .docs-rail-link {
    color: var(--color-ink-soft);
  }
  .docs-rail-link.is-current {
    color: var(--color-primary);
    font-weight: 600;
  }
}
</style>
