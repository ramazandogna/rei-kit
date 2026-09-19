<script setup lang="ts">
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
import { NEUTRAL } from './tones'

/**
 * rei-kit/motion, live, each part beside the code that produced it.
 *
 * Everything here stops for a reader who asked for less motion — turn it on
 * in the operating system and this section becomes a page of finished
 * numbers and still words, which is the point.
 */
const balance = ref(48200)
const replay = ref(0)

function spend() {
  balance.value = Math.max(0, balance.value - Math.round(Math.random() * 9000 + 500))
}

function earn() {
  balance.value += Math.round(Math.random() * 12000 + 1000)
}

/* Split, because the literal closing tag would end this block. */
const SCRIPT_END = '</' + 'script>'

const TICKER = `<script setup lang="ts">
import { ref } from 'vue'
import { NumberTicker } from 'rei-kit/motion'

const balance = ref(48200)
${SCRIPT_END}

<template>
  <NumberTicker
    :value="balance"
    :format="{ style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }"
  />
</template>`

const COUNT = `<!-- Waits until it is on screen, then counts. -->
<CountUp :value="12480" />
<CountUp :value="99.9" :format="{ maximumFractionDigits: 1 }" />%`

const WORDS = `<h2>Build it <TextRotate :words="['glass', 'brutal', 'soft', 'quiet']" /></h2>

<TypeWriter :text="['Write it once.', 'Change the look.', 'Ship it.']" />`

const REVEAL = `<BaseReveal v-for="(item, i) in items" :key="item.id" :delay="i * 80">
  <BaseCard>{{ item.title }}</BaseCard>
</BaseReveal>`

const MARQUEE = `<BaseMarquee :duration="40">
  <BaseBadge v-for="name in palettes" :key="name">{{ name }}</BaseBadge>
</BaseMarquee>`

const UTILITIES = `<span class="animate-float">…</span>
<span class="animate-pulse-soft">…</span>
<span class="animate-glow">…</span>
<span class="animate-wiggle">…</span>
<span class="animate-pop">…</span>
<h2 class="text-shimmer">…</h2>`

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
</script>

<template>
  <section id="hareket" class="mt-14">
    <SectionHeading :tone="NEUTRAL" label="Motion" />
    <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
      <code class="text-xs">rei-kit/motion</code>: numbers that count, words that change, content
      that arrives. Each part renders its finished state on a server and for anyone who has asked
      their system for less motion, reads only the final value to a screen reader, and stops while
      you hover it.
    </p>

    <!-- NumberTicker -->
    <div class="motion-row">
      <BaseCard>
        <p class="text-ink-soft text-xs font-medium tracking-wide uppercase">NumberTicker</p>
        <p class="text-ink mt-3 text-4xl font-bold tracking-tight">
          <NumberTicker
            :value="balance"
            :format="{ style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }"
            locale="tr-TR"
          />
        </p>
        <p class="text-ink-soft mt-2 text-xs">Each digit rolls on its own, like a note counter.</p>
        <div class="mt-4 flex gap-2">
          <BaseButton size="sm" @click="earn">Earn</BaseButton>
          <BaseButton size="sm" variant="secondary" @click="spend">Spend</BaseButton>
        </div>
      </BaseCard>
      <CodeBlock :code="TICKER" />
    </div>

    <!-- CountUp -->
    <div class="motion-row">
      <BaseCard>
        <p class="text-ink-soft text-xs font-medium tracking-wide uppercase">CountUp</p>
        <div class="mt-3 grid grid-cols-2 gap-4">
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
        <p class="text-ink-soft mt-3 text-xs">Counts through every value, once it is on screen.</p>
      </BaseCard>
      <CodeBlock :code="COUNT" />
    </div>

    <!-- TextRotate + TypeWriter -->
    <div class="motion-row">
      <BaseCard>
        <p class="text-ink-soft text-xs font-medium tracking-wide uppercase">
          TextRotate · TypeWriter
        </p>
        <p class="text-ink mt-3 text-2xl font-bold tracking-tight">
          Build it
          <span class="text-primary"
            ><TextRotate :words="['glass', 'brutal', 'soft', 'quiet']"
          /></span>
        </p>
        <p class="text-ink-soft mt-3 font-mono text-sm">
          <TypeWriter :text="['Write it once.', 'Change the look.', 'Ship it.']" />
        </p>
      </BaseCard>
      <CodeBlock :code="WORDS" />
    </div>

    <!-- BaseReveal -->
    <div class="motion-row">
      <BaseCard>
        <div class="flex items-center justify-between">
          <p class="text-ink-soft text-xs font-medium tracking-wide uppercase">BaseReveal</p>
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
      <CodeBlock :code="REVEAL" />
    </div>

    <!-- BaseMarquee -->
    <div class="motion-row">
      <BaseCard>
        <p class="text-ink-soft text-xs font-medium tracking-wide uppercase">BaseMarquee</p>
        <BaseMarquee class="mt-4" :duration="28">
          <BaseBadge v-for="name in PALETTE_NAMES" :key="name">{{ name }}</BaseBadge>
        </BaseMarquee>
      </BaseCard>
      <CodeBlock :code="MARQUEE" />
    </div>

    <!-- Utilities -->
    <div class="motion-row">
      <BaseCard>
        <p class="text-ink-soft text-xs font-medium tracking-wide uppercase">motion.css</p>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <span class="bg-muted text-ink animate-float rounded-full px-3 py-1 text-xs">float</span>
          <span class="bg-muted text-ink animate-pulse-soft rounded-full px-3 py-1 text-xs"
            >pulse-soft</span
          >
          <span class="bg-primary text-on-primary animate-glow rounded-full px-3 py-1 text-xs"
            >glow</span
          >
          <span class="bg-muted text-ink animate-wiggle rounded-full px-3 py-1 text-xs"
            >wiggle</span
          >
          <span :key="replay" class="bg-muted text-ink animate-pop rounded-full px-3 py-1 text-xs"
            >pop</span
          >
        </div>
        <p class="text-shimmer mt-4 text-xl font-bold tracking-tight">text-shimmer</p>
      </BaseCard>
      <CodeBlock :code="UTILITIES" lang="html" />
    </div>
  </section>
</template>

<style scoped>
.motion-row {
  margin-top: 1.25rem;
  display: grid;
  gap: 1rem;
  align-items: start;
}

@media (min-width: 64rem) {
  .motion-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}
</style>
