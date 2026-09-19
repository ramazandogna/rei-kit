<script setup lang="ts">
import { copyToClipboard } from './clipboard'
import { ref } from 'vue'

import { NumberTicker } from '../src/motion/index'
import catalogue from './props.generated.json'
import pkg from '../package.json'
import { readableRange } from './versions'
import {
  BaseAvatar,
  BaseBadge,
  BaseButton,
  BaseSwitch,
  MATERIALS,
  PALETTES,
  ProgressBar,
  StatCard,
  useMaterial,
  useToast,
} from '../src/index'

/**
 * What the kit is, in the first screen.
 *
 * The preview on the right is not a picture. It is the kit's own components,
 * and it changes the moment the material or the palette above it does — which
 * says more about what "themed by role" means than any sentence could.
 */
const material = useMaterial()
const toast = useToast()

const reminder = ref(true)
const copied = ref(false)

async function copyInstall() {
  if (!(await copyToClipboard('pnpm add rei-kit'))) return
  copied.value = true
  setTimeout(() => (copied.value = false), 1600)
}

/* What a reader checks before anything else: will it run in my project. Read
   from the package's own peer ranges, so it cannot fall behind them. */
const PLATFORM = [
  { label: `Vue ${readableRange(pkg.peerDependencies.vue)}`, detail: 'Composition API' },
  {
    label: `Tailwind CSS ${readableRange(pkg.peerDependencies.tailwindcss)}`,
    detail: 'Vite plugin',
  },
  { label: 'TypeScript', detail: 'types included' },
  { label: 'JavaScript', detail: 'same API' },
  { label: 'SSR', detail: 'and prerendering' },
  { label: 'MIT', detail: 'licence' },
]

const TAGLINE: Record<string, string> = {
  quiet: 'Calm, hairline-edged, out of the way.',
  glass: 'Frosted, lit at the rim, over colour.',
  brutal: 'Hard edges, hard shadows, no apology.',
  soft: 'Rounded, raised, a little squashy.',
}
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <a href="#hareket" class="hero-eyebrow focus-ring">
        <span class="hero-dot" aria-hidden="true" />
        <span
          ><strong>New</strong> — counters, rotating words and reveals in
          <code>rei-kit/motion</code></span
        >
        <span aria-hidden="true">→</span>
      </a>

      <h1 class="hero-title">
        One kit.
        <span
          class="hero-accent text-shimmer [--shimmer-band:var(--color-accent)] [--shimmer-base:var(--color-primary)]"
          >Every look.</span
        >
      </h1>

      <p class="hero-lead">
        {{ catalogue.length }} accessible components for Vue 3 and Tailwind 4. Change the
        <strong>material</strong> with one attribute, the <strong>palette</strong> with another —
        every component follows, and none of them knows your brand.
      </p>

      <div class="hero-actions">
        <button type="button" class="hero-install control" @click="copyInstall">
          <span class="hero-prompt" aria-hidden="true">$</span>
          pnpm add rei-kit
          <span class="hero-copy-mark" aria-hidden="true">{{ copied ? '✓' : '⧉' }}</span>
        </button>

        <BaseButton as="a" href="#start" size="md">Get started</BaseButton>
        <BaseButton as="a" href="#api" size="md" variant="secondary">Browse components</BaseButton>
      </div>

      <ul class="hero-facts">
        <!-- Counted, not typed: the numbers come from the package itself. -->
        <li>
          <strong><NumberTicker :value="catalogue.length" :from="0" /></strong> components
        </li>
        <li>
          <strong><NumberTicker :value="MATERIALS.length" :from="0" /></strong> materials
        </li>
        <li>
          <strong><NumberTicker :value="PALETTES.length" :from="0" /></strong> palettes
        </li>
        <li><strong>WCAG AA</strong> in every one</li>
      </ul>

      <div class="hero-platform">
        <p class="hero-platform-title">Runs on</p>
        <ul class="hero-platform-list">
          <li v-for="item in PLATFORM" :key="item.label" class="hero-chip">
            <span class="hero-check" aria-hidden="true">✓</span>
            <span class="text-ink font-medium">{{ item.label }}</span>
            <span class="text-ink-soft">{{ item.detail }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- The whole preview is live: the same components an app imports. -->
    <div class="hero-stage" aria-label="Live preview" role="img">
      <div class="preview surface-raised">
        <div class="preview-head">
          <div class="flex items-center gap-3">
            <BaseAvatar name="Aiko Tanaka" fallback="initials" />
            <div>
              <p class="text-ink text-sm font-semibold">Good evening, Aiko</p>
              <p class="text-ink-soft text-xs">{{ TAGLINE[material] }}</p>
            </div>
          </div>
          <BaseBadge tone="primary">{{ material }}</BaseBadge>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <StatCard value="¥48,200" label="This month" trend="down" />
          <StatCard value="21 days" label="Streak" trend="up" />
        </div>

        <div>
          <div class="text-ink-soft mb-1.5 flex justify-between text-xs">
            <span>JLPT N5 course</span>
            <span>18 / 28</span>
          </div>
          <ProgressBar :value="18" :max="28" label="Course progress" />
        </div>

        <div class="surface rounded-card p-3">
          <BaseSwitch v-model="reminder" label="Evening reminder" hint="Every day at 21:00" />
        </div>

        <div class="flex gap-2">
          <BaseButton class="flex-1" @click="toast.success('Saved')">Save</BaseButton>
          <BaseButton class="flex-1" variant="secondary" @click="toast.info('Nothing to undo')">
            Undo
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 3rem;
  align-items: center;
  padding: 3.5rem 0 1rem;
}

@media (min-width: 64rem) {
  .hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 4rem;
    padding-top: 5rem;
  }
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  border-radius: 9999px;
  border: 1px solid var(--surface-border-color);
  background: color-mix(in oklab, var(--color-surface) 70%, transparent);
  padding: 0.4375rem 0.9375rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--color-ink-soft);
  transition: border-color var(--duration-fast) var(--ease-standard);
}

.hero-eyebrow:hover {
  border-color: var(--color-primary);
}

.hero-eyebrow strong {
  color: var(--color-ink);
  font-weight: 600;
}

.hero-eyebrow code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
  color: var(--color-primary);
}

.hero-platform {
  margin-top: 1.75rem;
}

.hero-platform-title {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

.hero-platform-list {
  margin-top: 0.625rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4375rem;
  border-radius: 9999px;
  border: 1px solid var(--surface-border-color);
  background: color-mix(in oklab, var(--color-surface) 70%, transparent);
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.hero-check {
  display: grid;
  width: 1.125rem;
  height: 1.125rem;
  place-items: center;
  border-radius: 9999px;
  background: var(--color-positive);
  color: var(--color-on-positive);
  font-size: 0.6875rem;
  font-weight: 700;
}

.hero-dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 9999px;
  background: var(--color-positive);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-positive) 25%, transparent);
}

.hero-title {
  margin-top: 1.25rem;
  font-size: clamp(2.75rem, 6vw, 4.5rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: var(--color-ink);
}

/* The kit's own text-shimmer, in the brand: the headline is the first place
   a reader sees what motion.css does. */
.hero-accent {
  display: block;
}

.hero-lead {
  margin-top: 1.5rem;
  max-width: 34rem;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--color-ink-soft);
}

.hero-lead strong {
  color: var(--color-ink);
  font-weight: 600;
}

.hero-actions {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.hero-install {
  display: inline-flex;
  height: 2.75rem;
  align-items: center;
  gap: 0.75rem;
  border-radius: var(--radius-card);
  padding: 0 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.875rem;
  color: var(--color-ink);
  transition: transform var(--duration-fast) var(--ease-standard);
}

.hero-install:active {
  transform: translate(var(--press-offset), var(--press-offset)) scale(var(--press-scale));
}

.hero-install:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.hero-prompt,
.hero-copy-mark {
  color: var(--color-ink-soft);
  user-select: none;
}

.hero-facts {
  margin-top: 2.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  font-size: 0.875rem;
  color: var(--color-ink-soft);
}

.hero-facts strong {
  color: var(--color-ink);
  font-weight: 600;
}

.hero-stage {
  position: relative;
  display: grid;
  place-items: center;
}

/* A glow in the palette's own colours behind the preview, so even the quiet
   material has something to sit on. */
.hero-stage::before {
  content: '';
  position: absolute;
  inset: 8% 4%;
  z-index: 0;
  border-radius: 40%;
  background:
    radial-gradient(
      closest-side,
      color-mix(in oklab, var(--color-primary) 30%, transparent),
      transparent
    ),
    radial-gradient(
      closest-side at 80% 80%,
      color-mix(in oklab, var(--color-accent) 28%, transparent),
      transparent
    );
  filter: blur(40px);
}

.preview {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 24rem;
  flex-direction: column;
  gap: 1rem;
  border-radius: calc(var(--radius-card) + 6px);
  padding: 1.25rem;
  transition:
    border-radius var(--duration-slow) var(--ease-standard),
    box-shadow var(--duration-slow) var(--ease-standard),
    background-color var(--duration-slow) var(--ease-standard);
}

.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
</style>
