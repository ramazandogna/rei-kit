<script setup lang="ts">
import { NEUTRAL } from './tones'
import { computed, ref } from 'vue'

import ApiReference from './ApiReference.vue'
import AppearanceBar from './AppearanceBar.vue'
import AxesSection from './AxesSection.vue'
import GalleryExtra from './GalleryExtra.vue'
import GettingStarted from './GettingStarted.vue'
import HeroSection from './HeroSection.vue'
import MotionSection from './MotionSection.vue'
import SideNav from './SideNav.vue'
import SiteFooter from './SiteFooter.vue'

import {
  BaseAlert,
  BaseBadge,
  BaseButton,
  BaseInput,
  BaseCard,
  BaseCheckbox,
  BaseRadioGroup,
  BaseSelect,
  BaseTextarea,
  EmptyState,
  GoogleButton,
  PageContainer,
  ProgressBar,
  SectionHeading,
  SegmentedControl,
  SettingsGroup,
  SettingsRow,
  SkeletonList,
  StatCard,
  ToastHost,
  ToneDot,
  VERSION,
  useToast,
} from '../src/index'

/**
 * What is in the kit, on one page.
 *
 * This exists because of a complaint that turned out to be measurable: the
 * kit's newest consumer used twelve of its symbols and hand-wrote 737 class
 * attributes, while the two it was extracted from used thirty-odd each. Part
 * of that was a real gap — no desktop parts — and part of it was simpler than
 * that. There was no way to see what the kit contained. Finding out meant
 * reading `public-api.spec.ts`, so in practice nobody did, and every app
 * reached for Tailwind first.
 *
 * A component nobody can see is a component nobody uses. This page is the
 * cheapest fix for that, and it doubles as a check on the install
 * instructions: it wires the kit exactly the way the README tells a consumer
 * to, so a broken setup shows up here before it ships.
 *
 * Grouped by what a thing is for rather than alphabetically — somebody arrives
 * here needing "a way to show a warning", not needing the letter A.
 */
const progress = ref(7)
const email = ref('')
const segment = ref('all')
const currency = ref('')
const note = ref('')
const themeChoice = ref('system')
const remember = ref(false)
const toast = useToast()

const TONES = ['info', 'success', 'warning', 'danger'] as const
const BADGES = ['neutral', 'primary', 'success', 'warning', 'danger'] as const

const percent = computed(() => Math.round((progress.value / 28) * 100))
</script>

<template>
  <!-- `canvas` rather than `bg-canvas`: the utility also carries the
       material's backdrop, which is what glass has to see through. -->
  <div class="canvas text-ink min-h-dvh">
    <header class="sc-header surface-raised">
      <PageContainer class="flex flex-wrap items-center gap-x-4 gap-y-3 py-3">
        <a href="#top" class="flex items-center gap-2.5 whitespace-nowrap">
          <span class="sc-logo" aria-hidden="true">零</span>
          <span class="text-ink text-sm font-semibold tracking-tight">rei-kit</span>
          <span class="text-ink-soft hidden text-xs tabular-nums sm:inline">v{{ VERSION }}</span>
        </a>

        <nav class="hidden items-center gap-4 text-xs md:flex" aria-label="Project">
          <a class="text-ink-soft hover:text-ink transition-colors" href="#start">Get started</a>
          <a class="text-ink-soft hover:text-ink transition-colors" href="#axes">Themes</a>
          <a class="text-ink-soft hover:text-ink transition-colors" href="#hareket">Motion</a>
          <a class="text-ink-soft hover:text-ink transition-colors" href="#api">Components</a>
          <a
            class="text-ink-soft hover:text-ink transition-colors"
            href="https://www.npmjs.com/package/rei-kit"
            target="_blank"
            rel="noopener"
            >npm</a
          >
          <a
            class="text-ink-soft hover:text-ink transition-colors"
            href="https://github.com/ramazandogna/rei-kit"
            target="_blank"
            rel="noopener"
            >GitHub</a
          >
        </nav>

        <AppearanceBar class="ml-auto" />
      </PageContainer>

      <ToastHost close-label="Close" />
    </header>

    <PageContainer id="top" as="main">
      <HeroSection />
      <GettingStarted />
      <AxesSection />

      <div class="mt-20 max-w-[60ch]">
        <SectionHeading :tone="NEUTRAL" label="Components" />
        <h2 class="text-ink mt-4 text-3xl font-bold tracking-tight">Every component, live.</h2>
        <p class="text-ink-soft mt-3 text-[0.9375rem] leading-relaxed">
          Everything below is the kit itself, in whatever material and palette you picked above.
          Every prop is in a table generated from the source. Use the menu to find what you came
          for.
        </p>
      </div>

      <div class="mt-12 flex items-start gap-10 lg:gap-14">
        <SideNav />

        <div class="min-w-0 flex-1">
          <!-- Every section says what the thing is for. A gallery of components
           with their names under them tells you what exists; it does not tell
           you which one to reach for. -->
          <section id="aksiyon" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Aksiyon" />
            <p class="text-ink-soft mt-2 text-sm">Controls that start something or confirm it.</p>

            <BaseCard class="mt-5">
              <div class="flex flex-wrap items-center gap-3">
                <BaseButton>Primary</BaseButton>
                <BaseButton variant="secondary">Secondary</BaseButton>
                <BaseButton variant="ghost">Ghost</BaseButton>
                <BaseButton disabled>Disabled</BaseButton>
              </div>

              <div class="mt-5 max-w-xs">
                <GoogleButton label="Continue with Google" />
              </div>
            </BaseCard>
          </section>

          <MotionSection />

          <section id="yuzey" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Surfaces" />
            <p class="text-ink-soft mt-2 text-sm">
              Boxes that hold content. <code class="text-xs">BaseCard</code> takes a head and a foot
              slot; pass <code class="text-xs">interactive</code> only when the whole card is
              actually clickable.
            </p>

            <div class="mt-5 grid gap-4 sm:grid-cols-3">
              <BaseCard>A plain card.</BaseCard>

              <BaseCard>
                <template #head><span class="text-sm font-semibold">With a head</span></template>
                Body text.
                <template #foot><span class="text-ink-soft text-xs">Foot</span></template>
              </BaseCard>

              <BaseCard as="a" href="#" interactive
                >An interactive card — it lifts on hover.</BaseCard
              >
            </div>
          </section>

          <section id="geri-bildirim" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Status and feedback" />
            <p class="text-ink-soft mt-2 text-sm">
              <code class="text-xs">BaseAlert</code> is a message that has to be read;
              <code class="text-xs">BaseBadge</code> is a standing label and never a control.
            </p>

            <div class="mt-5 grid gap-3">
              <BaseAlert
                v-for="tone in TONES"
                :key="tone"
                :tone="tone"
                :assertive="tone === 'danger'"
              >
                <template #mark>!</template>
                <template #title>{{ tone }}</template>
                It carries a role name, not a colour name — change the theme and this box follows.
              </BaseAlert>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-2">
              <BaseBadge v-for="tone in BADGES" :key="tone" :tone="tone">{{ tone }}</BaseBadge>
            </div>
          </section>

          <section id="ilerleme" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Progress" />
            <p class="text-ink-soft mt-2 text-sm">
              The value is clamped: 101, a negative, and a divide-by-zero all stay inside the track.
            </p>

            <BaseCard class="mt-5">
              <div class="flex items-baseline justify-between">
                <span class="text-sm">{{ progress }} / 28 days</span>
                <span class="text-ink-soft text-sm tabular-nums">%{{ percent }}</span>
              </div>
              <ProgressBar :value="progress" :max="28" label="Kurs ilerlemesi" class="mt-3" />

              <input
                v-model.number="progress"
                type="range"
                min="0"
                max="28"
                class="mt-4 w-full"
                aria-label="Change progress"
              />
            </BaseCard>

            <div class="mt-4 flex gap-3">
              <StatCard value="28" label="Days" />
              <StatCard value="113" label="Kanji" trend="up" />
              <StatCard value="690" label="Kelime" trend="flat" />
            </div>
          </section>

          <section id="bildirim" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Notifications" />

            <p class="text-ink-soft mt-2 max-w-prose text-sm leading-relaxed">
              None of the three apps had one — not because anybody decided against it, but because
              there was nothing to reach for. Saving, deleting and exporting all finished in
              silence.
            </p>

            <div class="mt-5 flex flex-wrap gap-2">
              <BaseButton size="sm" variant="secondary" @click="toast.info('Exporting…')">
                Bilgi
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="toast.success('Kaydedildi')">
                Success
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="toast.warning('Weak connection')">
                Warning
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="toast.danger('Kaydedilemedi')">
                Hata
              </BaseButton>
            </div>
          </section>

          <section id="form" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Form" />

            <BaseCard class="mt-5 max-w-md">
              <BaseInput
                v-model="email"
                label="E-posta"
                type="email"
                placeholder="ornek@site.com"
              />
              <BaseInput
                class="mt-4"
                label="Password"
                type="password"
                error="Must be at least 10 characters."
              />

              <BaseSelect
                v-model="currency"
                class="mt-4"
                label="Para birimi"
                placeholder="Choose one"
                hint="Every amount in the report is shown in this."
                :options="[
                  { value: 'TRY', label: 'Turkish lira' },
                  { value: 'JPY', label: 'Japon yeni' },
                  { value: 'EUR', label: 'Euro' },
                ]"
              />

              <BaseTextarea v-model="note" class="mt-4" label="Not" :rows="3" />

              <BaseRadioGroup
                v-model="themeChoice"
                class="mt-5"
                legend="Tema"
                :options="[
                  { value: 'system', label: 'Sistem' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Koyu' },
                ]"
              />

              <BaseCheckbox v-model="remember" class="mt-5" label="Remember me" />

              <SegmentedControl
                class="mt-5"
                :options="[
                  { value: 'all', label: 'Hepsi' },
                  { value: 'free', label: 'Free' },
                  { value: 'paid', label: 'Paid' },
                ]"
                :model-value="segment"
                @update:model-value="(value: string) => (segment = value)"
              />
            </BaseCard>
          </section>

          <section id="ayarlar" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Ayarlar" />

            <SettingsGroup class="mt-5" title="Genel">
              <SettingsRow label="Tema"><ToneDot fill="bg-primary" /></SettingsRow>
              <SettingsRow label="Language" hint="Interface language">English</SettingsRow>
            </SettingsGroup>
          </section>

          <section id="bosluk" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Empty and waiting" />
            <p class="text-ink-soft mt-2 text-sm">
              A skeleton's height is a CSS length, not a class. That distinction was confused once,
              and every skeleton in the app rendered at zero height.
            </p>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <BaseCard><SkeletonList :rows="4" row-height="1.5rem" /></BaseCard>
              <BaseCard>
                <EmptyState
                  title="No notes yet"
                  description="Words you struggled with collect here."
                />
              </BaseCard>
            </div>
          </section>

          <section id="olcu" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Metrics" />
            <p class="text-ink-soft mt-2 text-sm">
              <code class="text-xs">PageContainer</code> gives two widths:
              <code class="text-xs">wide</code> for a page, <code class="text-xs">reading</code> for
              prose. This page is inside one.
            </p>

            <BaseCard class="mt-5">
              <PageContainer width="reading" class="!px-0">
                <p class="text-ink-soft text-sm leading-relaxed">
                  This paragraph is set at the reading measure: about 68 characters. On a longer
                  line the eye loses its place returning from the end of one line to the start of
                  the next — which is why page width and text width are not the same thing.
                </p>
              </PageContainer>
            </BaseCard>
          </section>

          <GalleryExtra class="mt-14" />

          <section id="api" class="mt-20">
            <SectionHeading :tone="NEUTRAL" label="All props" />
            <p class="text-ink-soft mt-2 max-w-[60ch] text-sm leading-relaxed">
              Every component the package ships, and every prop it takes. Generated from the source
              — a prop table maintained by hand is wrong by the second release, and wrong is worse
              than absent, because a reader trusts it.
            </p>

            <ApiReference class="mt-6" />
          </section>
        </div>
      </div>
    </PageContainer>

    <SiteFooter />
  </div>
</template>
