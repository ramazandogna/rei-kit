<script setup lang="ts">
import { CalendarRange, ReceiptText, UserStar } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import { BaseButton, BaseCard, BaseStepper, SectionHeading, TabBar } from '../src/index'
import { BaseBreadcrumb, BasePagination, BaseTabs, MegaMenu, NavLinks } from '../src/web/index'
import { NAV_PARTS } from './nav-parts'
import type { NavPartId } from './nav-parts'
import PropTable from './PropTable.vue'
import { NEUTRAL } from './tones'

/**
 * The parts that say where you are and where you can go, one at a time.
 *
 * They were seven inside one card, and five of them had no heading — so the
 * only way to find the bottom bar was to recognise it by sight.
 */
const tab = ref<'overview' | 'history'>('overview')
const page = ref(7)

const NAV = [
  { key: 'courses', to: '/courses', label: 'Courses' },
  { key: 'blog', to: '/blog', label: 'Blog' },
  { key: 'pricing', to: '/pricing', label: 'Pricing' },
] as const

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'history', label: 'History' },
] as const

const BOTTOM = [
  { key: 'month', to: '/month', label: 'Month', icon: CalendarRange },
  { key: 'ledger', to: '/ledger', label: 'Ledger', icon: ReceiptText },
  { key: 'profile', to: '/profile', label: 'Profile', icon: UserStar },
] as const

const MEGA = [
  {
    key: 'products',
    label: 'Products',
    columns: [
      {
        key: 'apps',
        title: 'Apps',
        links: [
          { key: 'journal', to: '/journal', label: 'Journal', description: 'A day at a time' },
          { key: 'ledger', to: '/ledger', label: 'Ledger', description: 'Where the money went' },
        ],
      },
      {
        key: 'developers',
        title: 'Developers',
        links: [
          { key: 'kit', to: '/kit', label: 'Component kit' },
          { key: 'api', to: '/api', label: 'API' },
        ],
      },
      {
        key: 'more',
        title: 'More',
        links: [
          { key: 'changelog', to: '/changelog', label: 'Changelog' },
          { key: 'status', to: '/status', label: 'Status' },
        ],
      },
    ],
  },
  { key: 'pricing', label: 'Pricing', to: '/pricing' },
  { key: 'docs', label: 'Docs', to: '/docs' },
] as const

const STEPS = [
  { key: 'account', label: 'Account', description: 'Email and password' },
  { key: 'plan', label: 'Plan', description: 'Monthly or yearly' },
  { key: 'payment', label: 'Payment', description: 'Card details' },
  { key: 'done', label: 'Done' },
] as const

const step = ref<(typeof STEPS)[number]['key']>('plan')
const stepIndex = computed(() => STEPS.findIndex((one) => one.key === step.value))

function move(by: number) {
  step.value = STEPS[Math.max(0, Math.min(STEPS.length - 1, stepIndex.value + by))]!.key
}

const part = (id: NavPartId) => NAV_PARTS.find((one) => one.id === id)!
</script>

<template>
  <section id="navigation">
    <SectionHeading :tone="NEUTRAL" label="Navigation" />
    <p class="text-ink-soft mt-2 text-sm">The parts that say where you are and where you can go.</p>

    <article :id="part('nav-links').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('nav-links').title }}</h3>
        <p class="sc-part-pitch">{{ part('nav-links').pitch }}</p>
      </header>
      <BaseCard class="mt-4">
        <NavLinks :items="NAV" active="blog" label="Primary navigation" />
      </BaseCard>
      <PropTable name="NavLinks" />
    </article>

    <article :id="part('nav-mega').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('nav-mega').title }}</h3>
        <p class="sc-part-pitch">{{ part('nav-mega').pitch }}</p>
      </header>
      <BaseCard class="mt-4">
        <!-- The panel is absolutely positioned against the bar, so the bar
             needs room under it while one is open. -->
        <div class="pb-2">
          <MegaMenu :items="MEGA" active="pricing" label="Site navigation">
            <template #products>
              <p class="text-ink-soft mt-4 text-xs">Everything is free while it is in beta.</p>
            </template>
          </MegaMenu>
        </div>
      </BaseCard>
      <PropTable name="MegaMenu" />
    </article>

    <article :id="part('nav-breadcrumb').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('nav-breadcrumb').title }}</h3>
        <p class="sc-part-pitch">{{ part('nav-breadcrumb').pitch }}</p>
      </header>
      <BaseCard class="mt-4">
        <BaseBreadcrumb
          :items="[
            { label: 'Courses', to: '/courses' },
            { label: 'N5', to: '/courses/n5' },
            { label: 'Day 3' },
          ]"
          label="Breadcrumb"
        />
      </BaseCard>
      <PropTable name="BaseBreadcrumb" />
    </article>

    <article :id="part('nav-tabs').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('nav-tabs').title }}</h3>
        <p class="sc-part-pitch">{{ part('nav-tabs').pitch }}</p>
      </header>
      <BaseCard class="mt-4">
        <BaseTabs v-model="tab" :items="TABS" label="Sections">
          <template #default="{ item }">
            <p class="text-ink-soft text-sm">
              {{ item.key === 'overview' ? 'The overview panel.' : 'The history panel.' }}
              Move with the arrow keys; Home and End jump to the ends.
            </p>
          </template>
        </BaseTabs>
      </BaseCard>
      <PropTable name="BaseTabs" />
    </article>

    <article :id="part('nav-pagination').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('nav-pagination').title }}</h3>
        <p class="sc-part-pitch">{{ part('nav-pagination').pitch }}</p>
      </header>
      <BaseCard class="mt-4">
        <BasePagination
          :page="page"
          :pages="40"
          previous-label="Previous"
          next-label="Next"
          label="Pages"
          @change="page = $event"
        />
      </BaseCard>
      <PropTable name="BasePagination" />
    </article>

    <article :id="part('nav-tabbar').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('nav-tabbar').title }}</h3>
        <p class="sc-part-pitch">{{ part('nav-tabbar').pitch }}</p>
      </header>
      <!-- The bar is absolutely positioned -- it hangs inside the phone shell
           rather than in the flow -- so it needs a box of its own. The table
           has to sit outside that box, or opening it spills out of the fixed
           height. -->
      <div class="border-hair/70 rounded-card relative mt-4 h-24 overflow-hidden border">
        <TabBar :items="BOTTOM" active="ledger" label="Bottom bar" />
      </div>
      <PropTable name="TabBar" />
    </article>

    <article :id="part('nav-stepper').id" class="sc-part">
      <header class="sc-part-head">
        <h3 class="sc-part-name">{{ part('nav-stepper').title }}</h3>
        <p class="sc-part-pitch">{{ part('nav-stepper').pitch }}</p>
      </header>
      <BaseCard class="mt-4">
        <BaseStepper
          v-model="step"
          :steps="STEPS"
          label="Sign-up"
          interactive
          :state-labels="{ complete: 'done', error: 'needs attention' }"
        />
        <div class="mt-4 flex gap-2">
          <BaseButton size="sm" variant="secondary" :disabled="stepIndex === 0" @click="move(-1)">
            Back
          </BaseButton>
          <BaseButton size="sm" :disabled="stepIndex === STEPS.length - 1" @click="move(1)">
            Next
          </BaseButton>
        </div>
      </BaseCard>
      <PropTable name="BaseStepper" />
    </article>
  </section>
</template>
