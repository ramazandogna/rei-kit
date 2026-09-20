<script setup lang="ts">
import { Bell, Sparkles } from 'lucide-vue-next'
import { ref } from 'vue'

import { BaseBadge, BaseButton, BaseCard, SectionHeading } from '../src/index'
import {
  BaseMarquee,
  BaseReveal,
  CountUp,
  NumberTicker,
  TextRotate,
  TypeWriter,
} from '../src/motion/index'
import CodeBlock from './CodeBlock.vue'
import { MOTION_PARTS } from './motion-parts'
import type { MotionPartId } from './motion-parts'
import { NEUTRAL } from './tones'

/**
 * rei-kit/motion, one part at a time.
 *
 * Each part gets its own heading, a sentence on what it is for, a live demo
 * and the code that produced it — and its own entry in the menu, so a reader
 * looking for "a counter" lands on the counter, not on a page of six things
 * moving at once.
 */
const balance = ref(48200)
const replay = ref(0)
const unread = ref(3)

function spend() {
  balance.value = Math.max(0, balance.value - Math.round(Math.random() * 9000 + 500))
}

function earn() {
  balance.value += Math.round(Math.random() * 12000 + 1000)
}

function replayAttention() {
  replay.value++
  unread.value = 3
}

/* Split, because the literal closing tag would end this block. */
const SCRIPT_END = '</' + 'script>'

const CODE: Record<MotionPartId, string> = {
  'motion-ticker': `<script setup lang="ts">
import { ref } from 'vue'
import { NumberTicker } from 'rei-kit/motion'

const balance = ref(48200)
${SCRIPT_END}

<template>
  <NumberTicker
    :value="balance"
    :format="{ style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }"
  />
</template>`,
  'motion-count': `<!-- Waits until it is on screen, then counts. -->
<CountUp :value="12480" />
<CountUp :value="99.9" :format="{ maximumFractionDigits: 1 }" />%`,
  'motion-rotate': `<h2>
  Build it
  <TextRotate :words="['glass', 'brutal', 'soft', 'quiet']" />
</h2>`,
  'motion-type': `<TypeWriter
  :text="['Write it once.', 'Change the look.', 'Ship it.']"
/>`,
  'motion-reveal': `<BaseReveal
  v-for="(item, i) in items"
  :key="item.id"
  :delay="i * 80"
>
  <BaseCard>{{ item.title }}</BaseCard>
</BaseReveal>`,
  'motion-marquee': `<BaseMarquee :duration="40">
  <BaseBadge v-for="name in palettes" :key="name">
    {{ name }}
  </BaseBadge>
</BaseMarquee>`,
  'motion-shimmer': `<!-- In ink, with a band of the primary colour -->
<h1 class="text-shimmer">Ship on Friday</h1>

<!-- In the brand, with a band of the accent -->
<h1
  class="text-shimmer [--shimmer-base:var(--color-primary)]
         [--shimmer-band:var(--color-accent)]"
>
  Every look.
</h1>`,
  'motion-attention': `<span class="animate-pulse-soft">● Live</span>
<Bell class="animate-wiggle" />
<BaseBadge class="animate-pop">New</BaseBadge>
<BaseButton class="animate-glow">Upgrade</BaseButton>
<div class="animate-float">…</div>`,
}

const PALETTE_NAMES = [
  'Rei',
  'Nord',
  'Dracula',
  'Catppuccin',
  'Solarized',
  'Gruvbox',
  'Tokyo Night',
  'Rosé Pine',
  'Sakura',
  'Matcha',
]

const part = (id: MotionPartId) => MOTION_PARTS.find((p) => p.id === id)!
</script>

<template>
  <section id="hareket" class="mt-14">
    <SectionHeading :tone="NEUTRAL" label="Motion" />
    <h2 class="motion-title text-shimmer">Things that move, on purpose.</h2>
    <p class="motion-lead">
      <code>rei-kit/motion</code> — counters, changing words, arriving content and a handful of
      effects for the parts of a page that should catch the eye. Every one renders its finished
      state on a server and for anyone who asked their system for less motion, reads only the final
      value to a screen reader, and stops while you hover it. All of them together add under 2 KB.
    </p>

    <!-- NumberTicker -->
    <article :id="part('motion-ticker').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('motion-ticker').title }}</h3>
        <p class="sc-part-pitch">{{ part('motion-ticker').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <p class="text-ink text-4xl font-bold tracking-tight">
            <NumberTicker
              :value="balance"
              :format="{ style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }"
              locale="tr-TR"
            />
          </p>
          <p class="text-ink-soft mt-1 text-xs">Balance</p>
          <div class="mt-4 flex gap-2">
            <BaseButton size="sm" @click="earn">Earn</BaseButton>
            <BaseButton size="sm" variant="secondary" @click="spend">Spend</BaseButton>
          </div>
        </BaseCard>
        <CodeBlock :code="CODE['motion-ticker']" />
      </div>
    </article>

    <!-- CountUp -->
    <article :id="part('motion-count').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('motion-count').title }}</h3>
        <p class="sc-part-pitch">{{ part('motion-count').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-ink text-3xl font-bold tracking-tight">
                <CountUp :value="12480" locale="en-GB" />
              </p>
              <p class="text-ink-soft text-xs">Downloads</p>
            </div>
            <div>
              <p class="text-ink text-3xl font-bold tracking-tight">
                <CountUp :value="99.9" :format="{ maximumFractionDigits: 1 }" locale="en-GB" />%
              </p>
              <p class="text-ink-soft text-xs">Uptime</p>
            </div>
          </div>
        </BaseCard>
        <CodeBlock :code="CODE['motion-count']" />
      </div>
    </article>

    <!-- TextRotate -->
    <article :id="part('motion-rotate').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('motion-rotate').title }}</h3>
        <p class="sc-part-pitch">{{ part('motion-rotate').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <p class="text-ink text-2xl font-bold tracking-tight">
            Build it
            <span class="text-primary"
              ><TextRotate :words="['glass', 'brutal', 'soft', 'quiet']"
            /></span>
          </p>
        </BaseCard>
        <CodeBlock :code="CODE['motion-rotate']" />
      </div>
    </article>

    <!-- TypeWriter -->
    <article :id="part('motion-type').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('motion-type').title }}</h3>
        <p class="sc-part-pitch">{{ part('motion-type').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <p class="text-ink font-mono text-lg">
            <TypeWriter :text="['Write it once.', 'Change the look.', 'Ship it.']" />
          </p>
        </BaseCard>
        <CodeBlock :code="CODE['motion-type']" />
      </div>
    </article>

    <!-- BaseReveal -->
    <article :id="part('motion-reveal').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('motion-reveal').title }}</h3>
        <p class="sc-part-pitch">{{ part('motion-reveal').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <div class="flex items-center justify-between">
            <p class="text-ink-soft text-xs">Scrolls in, one after another.</p>
            <BaseButton size="sm" variant="ghost" @click="replay++">Replay</BaseButton>
          </div>
          <div :key="replay" class="mt-3 grid grid-cols-3 gap-2">
            <BaseReveal v-for="n in 6" :key="n" :delay="(n - 1) * 80" effect="rise">
              <div class="surface rounded-card text-ink-soft grid h-14 place-items-center text-xs">
                {{ n }}
              </div>
            </BaseReveal>
          </div>
        </BaseCard>
        <CodeBlock :code="CODE['motion-reveal']" />
      </div>
    </article>

    <!-- BaseMarquee -->
    <article :id="part('motion-marquee').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('motion-marquee').title }}</h3>
        <p class="sc-part-pitch">{{ part('motion-marquee').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard class="min-w-0">
          <BaseMarquee :duration="28">
            <BaseBadge v-for="name in PALETTE_NAMES" :key="name">{{ name }}</BaseBadge>
          </BaseMarquee>
        </BaseCard>
        <CodeBlock :code="CODE['motion-marquee']" />
      </div>
    </article>

    <!-- text-shimmer -->
    <article :id="part('motion-shimmer').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('motion-shimmer').title }}</h3>
        <p class="sc-part-pitch">{{ part('motion-shimmer').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <p class="text-shimmer text-3xl font-bold tracking-tight">Ship on Friday</p>
          <p
            class="text-shimmer mt-3 text-3xl font-bold tracking-tight [--shimmer-band:var(--color-accent)] [--shimmer-base:var(--color-primary)]"
          >
            Every look.
          </p>
          <p class="text-ink-soft mt-3 text-xs">
            Used on this page's own headline, and on this section's title.
          </p>
        </BaseCard>
        <CodeBlock :code="CODE['motion-shimmer']" lang="html" />
      </div>
    </article>

    <!-- Attention effects -->
    <article :id="part('motion-attention').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('motion-attention').title }}</h3>
        <p class="sc-part-pitch">{{ part('motion-attention').pitch }}</p>
      </header>
      <div class="sc-part-row">
        <BaseCard>
          <ul class="effects">
            <li class="effect">
              <span class="effect-demo">
                <span class="text-positive animate-pulse-soft text-sm font-semibold">● Live</span>
              </span>
              <code>animate-pulse-soft</code>
              <span class="effect-use">a status that is on</span>
            </li>
            <li class="effect">
              <span class="effect-demo">
                <button
                  type="button"
                  class="text-ink focus-ring relative rounded-full p-1"
                  aria-label="Notifications"
                  @click="unread = 0"
                >
                  <Bell :class="['size-5', { 'animate-wiggle': unread > 0 }]" aria-hidden="true" />
                  <span
                    v-if="unread > 0"
                    class="bg-negative text-on-negative absolute -top-1 -right-1 grid size-4 place-items-center rounded-full text-[0.625rem] font-bold"
                    >{{ unread }}</span
                  >
                </button>
              </span>
              <code>animate-wiggle</code>
              <span class="effect-use">something is waiting — press the bell</span>
            </li>
            <li class="effect">
              <span class="effect-demo">
                <BaseBadge :key="replay" tone="primary" class="animate-pop">New</BaseBadge>
              </span>
              <code>animate-pop</code>
              <span class="effect-use">it just arrived</span>
            </li>
            <li class="effect">
              <span class="effect-demo">
                <BaseButton size="sm" pill class="animate-glow">Upgrade</BaseButton>
              </span>
              <code>animate-glow</code>
              <span class="effect-use">the one action that matters</span>
            </li>
            <li class="effect">
              <span class="effect-demo">
                <Sparkles class="text-accent animate-float size-6" aria-hidden="true" />
              </span>
              <code>animate-float</code>
              <span class="effect-use">an illustration at rest</span>
            </li>
          </ul>
          <BaseButton class="mt-4" size="sm" variant="ghost" @click="replayAttention">
            Replay
          </BaseButton>
        </BaseCard>
        <CodeBlock :code="CODE['motion-attention']" lang="html" />
      </div>
    </article>
  </section>
</template>

<style scoped>
.motion-title {
  margin-top: 1rem;
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.025em;
}

.motion-lead {
  margin-top: 0.75rem;
  max-width: 62ch;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-ink-soft);
}

.motion-lead code,
.effect code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125em;
  color: var(--color-ink);
}

.effects {
  display: grid;
  gap: 0.875rem;
}

.effect {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  align-items: center;
  column-gap: 0.75rem;
}

.effect-demo {
  grid-row: span 2;
  display: grid;
  place-items: center;
  min-height: 2.75rem;
}

.effect-use {
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}
</style>
