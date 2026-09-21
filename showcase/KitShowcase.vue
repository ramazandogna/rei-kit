<script setup lang="ts">
import { Search } from 'lucide-vue-next'

import { NEUTRAL } from './tones'
import { computed, ref } from 'vue'

import ApiReference from './ApiReference.vue'
import CommandPalette from './CommandPalette.vue'
import AppearanceBar from './AppearanceBar.vue'
import AxesSection from './AxesSection.vue'
import EvidenceSection from './EvidenceSection.vue'
import BasicsSection from './BasicsSection.vue'
import FormSection from './FormSection.vue'
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
  BaseCard,
  BaseKbd,
  EmptyState,
  GoogleButton,
  PageContainer,
  ProgressBar,
  SectionHeading,
  SettingsGroup,
  SettingsRow,
  SkeletonList,
  StatCard,
  BaseCalendar,
  BaseDatePicker,
  TimePicker,
  ToastHost,
  ToneDot,
  CircularProgress,
  VERSION,
  addDays,
  todayKey,
  useToast,
} from '../src/index'
import type { DateRange } from '../src/index'

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
const findOpen = ref(false)
const progress = ref(7)
const toast = useToast()

const day = ref<string | undefined>(todayKey())
const due = ref<string | undefined>()
const period = ref<DateRange | undefined>()
const reminderAt = ref<string | undefined>('09:00')
const PERIODS = [
  { label: 'Last 7 days', value: () => ({ start: addDays(todayKey(), -6), end: todayKey() }) },
  { label: 'Last 30 days', value: () => ({ start: addDays(todayKey(), -29), end: todayKey() }) },
  {
    label: 'This month',
    value: () => ({ start: `${todayKey().slice(0, 7)}-01`, end: todayKey() }),
  },
]

/* Acts first and lets the reader take it back — kinder than "are you sure". */
function deleteWithUndo() {
  toast.success('Entry deleted', {
    action: { label: 'Undo', onClick: () => toast.info('Entry restored') },
  })
}

const TONES = ['info', 'success', 'warning', 'danger'] as const
const BADGES = ['neutral', 'primary', 'success', 'warning', 'danger'] as const

/* The release line, not the patch: "v2.3" is what a reader compares against
   their lockfile. The exact version is in the footer and on hover. */
const SERIES = VERSION.split('.').slice(0, 2).join('.')

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
          <span class="text-ink-soft hidden text-xs tabular-nums sm:inline" :title="`v${VERSION}`"
            >v{{ SERIES }}</span
          >
        </a>

        <nav class="hidden items-center gap-4 text-xs md:flex" aria-label="Project">
          <a class="text-ink-soft hover:text-ink transition-colors" href="#start">Get started</a>
          <a class="text-ink-soft hover:text-ink transition-colors" href="#axes">Themes</a>
          <a class="text-ink-soft hover:text-ink transition-colors" href="#motion">Motion</a>
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

        <!-- A shortcut nobody knows about is a shortcut nobody has. The
             button is the whole point: it says the palette exists and opens
             it for a pointer, which a key combination alone cannot. -->
        <button
          type="button"
          class="sc-find focus-ring ml-auto"
          @click="findOpen = !findOpen"
          @keydown.enter.prevent="findOpen = true"
        >
          <Search class="size-3.5" aria-hidden="true" />
          <span>Find anything</span>
          <BaseKbd :keys="['⌘', 'K']" joiner="+" />
        </button>

        <AppearanceBar />
      </PageContainer>

      <ToastHost close-label="Close" />
      <CommandPalette v-model="findOpen" />
    </header>

    <PageContainer id="top" as="main">
      <!-- The order is the argument: what it is, what is different about it,
           where that leaves it against the others — and only then how to
           install it. Somebody who already knows they want it has the
           hero's own "Get started" button. -->
      <HeroSection />
      <AxesSection />
      <EvidenceSection />
      <GettingStarted />

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
          <section id="action" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Action" />
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

          <BasicsSection />

          <MotionSection />

          <section id="surfaces" class="mt-14">
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

          <section id="status" class="mt-14">
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

          <section id="progress" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Progress" />
            <p class="text-ink-soft mt-2 text-sm">
              The value is clamped: 101, a negative, and a divide-by-zero all stay inside the track.
            </p>

            <BaseCard class="mt-5">
              <div class="flex items-baseline justify-between">
                <span class="text-sm">{{ progress }} / 28 days</span>
                <span class="text-ink-soft text-sm tabular-nums">{{ percent }}%</span>
              </div>
              <ProgressBar :value="progress" :max="28" label="Course progress" class="mt-3" />

              <input
                v-model.number="progress"
                type="range"
                min="0"
                max="28"
                class="mt-4 w-full"
                aria-label="Change progress"
              />
            </BaseCard>

            <BaseCard class="mt-4">
              <p class="text-ink-soft text-xs">
                <code class="text-xs">CircularProgress</code> — the same promise as a ring, for a
                small space. Without a value it turns instead.
              </p>
              <div class="mt-3 flex items-center gap-5">
                <CircularProgress
                  :value="progress"
                  :max="28"
                  label="Course progress"
                  size="lg"
                  show-value
                />
                <CircularProgress :value="72" label="Upload" tone="positive" show-value />
                <CircularProgress :value="18" label="Storage" tone="warning" size="sm" />
                <CircularProgress label="Syncing" />
              </div>
            </BaseCard>

            <div class="mt-4 flex gap-3">
              <StatCard value="28" label="Days" />
              <StatCard value="113" label="Kanji" trend="up" />
              <StatCard value="690" label="Words" trend="flat" />
            </div>
          </section>

          <section id="notifications" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Notifications" />

            <p class="text-ink-soft mt-2 max-w-prose text-sm leading-relaxed">
              None of the three apps had one — not because anybody decided against it, but because
              there was nothing to reach for. Saving, deleting and exporting all finished in
              silence.
            </p>

            <div class="mt-5 flex flex-wrap gap-2">
              <BaseButton size="sm" variant="secondary" @click="toast.info('Exporting…')">
                Info
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="toast.success('Saved')">
                Success
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="toast.warning('Weak connection')">
                Warning
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="deleteWithUndo">
                Delete, with undo
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="toast.danger('Could not save')">
                Error
              </BaseButton>
            </div>
          </section>

          <FormSection />

          <section id="dates" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Dates and times" />
            <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
              Dates go in and out as the kit's date keys — <code class="text-xs">YYYY-MM-DD</code>,
              always local, never a <code class="text-xs">Date</code>. What you read is
              <code class="text-xs">Intl</code> in your language: change the page's language and the
              month, the weekdays and every day's spoken name follow.
            </p>

            <div class="mt-5 grid gap-4 lg:grid-cols-2">
              <BaseCard>
                <p class="text-ink-soft text-xs font-medium tracking-wide uppercase">
                  BaseCalendar
                </p>
                <div class="mt-3">
                  <BaseCalendar
                    v-model="day"
                    previous-label="Previous month"
                    next-label="Next month"
                  />
                </div>
                <p class="text-ink-soft mt-2 text-xs">
                  Arrows move a day and a week, Page Up and Down a month, with Shift a year.
                </p>
              </BaseCard>

              <div class="flex flex-col gap-4">
                <BaseCard>
                  <BaseDatePicker
                    v-model="due"
                    label="Due date"
                    placeholder="Choose a day"
                    clear-label="Clear the date"
                    previous-label="Previous month"
                    next-label="Next month"
                    :min="todayKey()"
                    hint="Nothing before today can be chosen."
                  />
                </BaseCard>

                <BaseCard>
                  <BaseDatePicker
                    v-model="period"
                    mode="range"
                    label="Report period"
                    placeholder="Choose a period"
                    clear-label="Clear the period"
                    :presets="PERIODS"
                    previous-label="Previous month"
                    next-label="Next month"
                  />
                  <p class="text-ink-soft mt-3 text-xs">
                    Ready-made answers sit beside the calendar, in your words and your arithmetic.
                  </p>
                </BaseCard>

                <!-- The time of day is a second field, not a second half of
                     this one: two decisions, and a locale writes them
                     differently. It sits here because that is where somebody
                     looks for it, not with the text fields. -->
                <BaseCard>
                  <TimePicker
                    v-model="reminderAt"
                    label="Reminder"
                    hours-label="Hour"
                    minutes-label="Minute"
                    placeholder="Choose a time"
                    min="07:00"
                    max="22:00"
                    hint="Stored as HH:mm, shown in your own clock."
                  />
                </BaseCard>
              </div>
            </div>
          </section>

          <section id="settings" class="mt-14">
            <SectionHeading :tone="NEUTRAL" label="Settings" />

            <SettingsGroup class="mt-5" title="General">
              <SettingsRow label="Theme"><ToneDot fill="bg-primary" /></SettingsRow>
              <SettingsRow label="Language" hint="Interface language">English</SettingsRow>
            </SettingsGroup>
          </section>

          <section id="empty" class="mt-14">
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

          <section id="metrics" class="mt-14">
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
