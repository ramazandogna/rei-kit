<script setup lang="ts">
import { Calendar, Home, Mail, Search, Settings } from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import {
  BaseAvatar,
  ChatMessage,
  ChatThread,
  CopyButton,
  LineChart,
  PromptInput,
} from '../src/index'
import {
  AnimatedBeam,
  BorderBeam,
  NumberTicker,
  SpotlightCard,
  TiltCard,
  TypeWriter,
} from '../src/motion/index'
import { BentoCell, BentoGrid, Dock } from '../src/web/index'

/**
 * What is new, built from the new parts: every cell is the component it is
 * about, and links to its page.
 */
const SERIES = [{ name: 'Revenue', values: [12, 18, 15, 24, 30, 28, 36, 33, 44, 41, 52, 60] }]
const LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

const active = ref('home')
const ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'mail', label: 'Mail', icon: Mail, badge: 3 },
  { id: 'cal', label: 'Calendar', icon: Calendar },
  { id: 'set', label: 'Settings', icon: Settings },
]

const draft = ref('')
const box = ref<HTMLElement | null>(null)
const n1 = ref<HTMLElement | null>(null)
const n2 = ref<HTMLElement | null>(null)
const n3 = ref<HTMLElement | null>(null)
const n4 = ref<HTMLElement | null>(null)
</script>

<template>
  <section id="new" class="site-page site-section" aria-labelledby="new-h">
    <p class="site-eyebrow">New in this release</p>
    <h2 id="new-h" class="site-h2">Effects that dress with the theme.</h2>

    <BentoGrid :columns="4" as="ul" row-height="11rem" class="nb">
      <!-- A: SpotlightCard + NumberTicker + LineChart -->
      <BentoCell :col="2" :row="2" class="nb-bare">
        <SpotlightCard class="nb-fill" padding="lg">
          <div class="nb-a">
            <p class="site-eyebrow">Revenue</p>
            <p class="nb-big">
              <NumberTicker
                :value="48200"
                :format="{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }"
              />
            </p>
            <LineChart
              label="Revenue by month"
              :labels="LABELS"
              :series="SERIES"
              area
              :height="150"
              :legend="false"
            />
            <div class="nb-text">
              <h3>Light that follows you</h3>
              <p>SpotlightCard, with a chart that draws itself once.</p>
              <RouterLink to="/c/SpotlightCard" class="nb-link">View →</RouterLink>
            </div>
          </div>
        </SpotlightCard>
      </BentoCell>

      <!-- B: Dock -->
      <BentoCell>
        <div class="nb-center">
          <Dock label="Apps" :items="ITEMS" :active="active" size="sm" @select="active = $event" />
        </div>
        <div class="nb-text">
          <h3>Dock</h3>
          <RouterLink to="/c/Dock" class="nb-link">View →</RouterLink>
        </div>
      </BentoCell>

      <!-- C: Chat -->
      <BentoCell :row="2">
        <ChatThread label="Conversation" class="nb-chat">
          <ChatMessage from="user" name="You">Ship it?</ChatMessage>
          <ChatMessage from="assistant" name="Rei" streaming>
            <TypeWriter text="Yes. Four materials, one attribute." :loop="false" :cursor="false" />
          </ChatMessage>
        </ChatThread>
        <PromptInput v-model="draft" label="Message" placeholder="Ask…" />
        <div class="nb-text">
          <h3>Chat kit</h3>
          <RouterLink to="/c/ChatThread" class="nb-link">View →</RouterLink>
        </div>
      </BentoCell>

      <!-- D: TiltCard -->
      <BentoCell class="nb-bare">
        <TiltCard class="nb-fill">
          <div class="nb-tilt">
            <BaseAvatar name="Aiko Tanaka" size="lg" />
            <p class="nb-name">Aiko Tanaka</p>
            <div class="nb-text">
              <h3>TiltCard</h3>
              <RouterLink to="/c/TiltCard" class="nb-link">View →</RouterLink>
            </div>
          </div>
        </TiltCard>
      </BentoCell>

      <!-- E: AnimatedBeam -->
      <BentoCell :col="2">
        <div ref="box" class="nb-beam">
          <span ref="n1" class="nb-node surface site-mono">tokens.css</span>
          <span ref="n2" class="nb-node surface site-mono">material</span>
          <span ref="n3" class="nb-node surface site-mono">palette</span>
          <span ref="n4" class="nb-node nb-node--end site-mono">Your app</span>
          <AnimatedBeam :container="box" :from="n1" :to="n2" :duration="1.6" />
          <AnimatedBeam :container="box" :from="n2" :to="n3" :duration="1.6" :delay="0.8" />
          <AnimatedBeam :container="box" :from="n3" :to="n4" :duration="1.6" :delay="1.6" />
          <p class="sr-only">tokens.css feeds the material, the palette, and then your app.</p>
        </div>
        <div class="nb-text">
          <h3>AnimatedBeam</h3>
          <RouterLink to="/c/AnimatedBeam" class="nb-link">View →</RouterLink>
        </div>
      </BentoCell>

      <!-- F: BorderBeam -->
      <BentoCell :col="2" class="nb-bare">
        <BorderBeam radius="card" class="nb-fill">
          <div class="nb-f surface rounded-card">
            <div class="nb-chip surface">
              <span class="site-mono">pnpm add rei-kit</span>
              <CopyButton
                text="pnpm add rei-kit"
                copy-label="Copy install command"
                copied-label="Copied"
                error-label="Could not copy"
              />
            </div>
            <div class="nb-text">
              <h3>BorderBeam</h3>
              <RouterLink to="/c/BorderBeam" class="nb-link">View →</RouterLink>
              <RouterLink to="/docs/install" class="nb-link">Read the docs →</RouterLink>
            </div>
          </div>
        </BorderBeam>
      </BentoCell>
    </BentoGrid>
  </section>
</template>

<style>
.nb {
  margin-top: 32px;
}
.nb .nb-bare {
  padding: 0;
  background: none;
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
  overflow: visible;
}
.nb .nb-fill {
  height: 100%;
}
.nb-a {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 8px;
}
.nb-big {
  font-size: 2.75rem;
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.03em;
}
.nb-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
}
.nb-text p {
  font-size: var(--site-text-sm);
  color: var(--color-ink-soft);
}
.nb-text {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 16px;
  margin-top: auto;
}
.nb-text h3 {
  flex-basis: 100%;
}
.nb-link {
  font-size: var(--site-text-sm);
  color: var(--color-primary);
  font-weight: 600;
}
.nb-link:hover {
  text-decoration: underline;
}
.nb-center {
  flex: 1;
  display: grid;
  place-items: center;
}
.nb-chat {
  flex: 1;
  min-height: 0;
}
.nb-tilt {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 8px;
}
.nb-name {
  font-weight: 600;
}
.nb-beam {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.nb-node {
  border-radius: var(--radius-control);
  padding: 8px 10px;
  font-size: var(--site-text-xs);
  white-space: nowrap;
}
.nb-node--end {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-control);
  padding: 8px 10px;
}
.nb-f {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
}
.nb-chip {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 8px;
  border-radius: var(--radius-control);
  padding: 4px 4px 4px 14px;
  font-size: var(--site-text-sm);
}
</style>
