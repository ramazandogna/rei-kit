<script setup lang="ts">
import { NEUTRAL } from './tones'
import { computed, ref } from 'vue'
import { CalendarRange, Plus, ReceiptText, Settings, UserStar } from 'lucide-vue-next'

import {
  BaseAvatar,
  BaseButton,
  BaseCard,
  BaseCombobox,
  BaseMenu,
  BaseSheet,
  BaseSlider,
  BaseSpinner,
  BaseSwitch,
  BaseTable,
  ErrorBoundary,
  FormField,
  PriceCard,
  SectionHeading,
  TabBar,
} from '../src/index'
import { AuthShell, FabButton, OfflineBanner } from '../src/app/index'
import {
  BaseAccordion,
  BaseBreadcrumb,
  BaseDisclosure,
  BaseModal,
  BasePagination,
  BaseTabs,
  BaseTooltip,
  NavLinks,
} from '../src/web/index'
import PropTable from './PropTable.vue'

/**
 * The half of the kit the first showcase never showed.
 *
 * Twenty-four components, and they were the twenty-four hardest to install
 * correctly — a dialog, a menu, a combobox, the phone shell. Somebody comparing
 * kits looks at the gallery and concludes the package is the part they can see,
 * which is how the newest consumer came to hand-write 737 class attributes
 * against a kit that already had most of what it needed.
 */
const reminder = ref(true)
const minutes = ref(45)
const country = ref<'tr' | 'jp' | 'de' | ''>('')
const modal = ref(false)
const alertModal = ref(false)
const sheet = ref(false)
const tab = ref<'overview' | 'history'>('overview')
const page = ref(7)
const menuOpen = ref(false)

const COUNTRIES = [
  { value: 'tr', label: 'Türkiye' }, // an endonym, on purpose
  { value: 'jp', label: 'Japan' },
  { value: 'de', label: 'Germany' },
] as const

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'history', label: 'History' },
] as const

const FAQ = [
  { key: 'cancel', title: 'Can I cancel any time?' },
  { key: 'refund', title: 'What is the refund policy?' },
] as const

const NAV = [
  { key: 'courses', to: '/courses', label: 'Courses' },
  { key: 'blog', to: '/blog', label: 'Blog' },
  { key: 'pricing', to: '/pricing', label: 'Pricing' },
] as const

const BOTTOM = [
  { key: 'month', to: '/month', label: 'Month', icon: CalendarRange },
  { key: 'ledger', to: '/ledger', label: 'Ledger', icon: ReceiptText },
  { key: 'profile', to: '/profile', label: 'Profile', icon: UserStar },
] as const

const COLUMNS = [
  { key: 'name', label: 'Item' },
  { key: 'date', label: 'Date', nowrap: true },
  { key: 'amount', label: 'Amount', align: 'end' },
] as const

const ROWS = [
  { name: 'Coffee', date: '12 Sep', amount: '₺120' },
  { name: 'Books', date: '09 Sep', amount: '₺430' },
  { name: 'Subscription', date: '01 Sep', amount: '₺89' },
]

const firstDisclosure = ref(false)

/** A component that throws, so the boundary has something to catch. */
const Boom = {
  setup() {
    throw new Error('demo')
  },
  render: () => null,
}
const boom = ref(false)

const sliderText = computed(() => `${minutes.value} minutes`)
</script>

<template>
  <div class="flex flex-col gap-14">
    <!-- ─────────────────────────── Form ─────────────────────────── -->
    <section id="form-devam">
      <SectionHeading :tone="NEUTRAL" label="Form — continued" />
      <p class="text-ink-soft mt-2 text-sm">
        Controls that take a value. A switch differs from a checkbox in more than shape: a checkbox
        states an intention that something else commits, and a switch <em>is</em> the commit — there
        is no Save after it.
      </p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div>
          <BaseSwitch v-model="reminder" label="Daily reminder" hint="Every evening at 21:00" />
          <PropTable name="BaseSwitch" />
        </div>

        <div>
          <BaseSlider
            v-model="minutes"
            label="Session length"
            :min="5"
            :max="90"
            :step="5"
            :format="() => sliderText"
            hint="The arrow keys move it too."
          />
          <PropTable name="BaseSlider" />
        </div>

        <div>
          <BaseCombobox
            v-model="country"
            label="Country"
            :options="COUNTRIES"
            placeholder="Type to filter"
            empty-label="No matches"
          />
          <PropTable name="BaseCombobox" />
        </div>

        <div>
          <FormField label="Your own control" hint="FormField supplies the label and the wiring.">
            <template #default="{ id, describedBy, invalid }">
              <input
                :id="id"
                :aria-describedby="describedBy"
                :aria-invalid="invalid"
                class="border-hair bg-surface text-ink rounded-card h-11 w-full border px-3 text-base"
              />
            </template>
          </FormField>
          <PropTable name="FormField" />
        </div>
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Katmanlar ─────────────────────────── -->
    <section id="ust-katman">
      <SectionHeading :tone="NEUTRAL" label="Overlays" />
      <p class="text-ink-soft mt-2 max-w-[68ch] text-sm leading-relaxed">
        Three different answers to “put something on top of the page”, and the kit keeps them
        separate on purpose — merging them gives you one component that is wrong everywhere.
      </p>

      <BaseCard class="mt-5 flex flex-col gap-8">
        <div>
          <p class="text-ink text-sm font-medium">BaseModal — arrives from nowhere</p>
          <p class="text-ink-soft mt-1 max-w-[64ch] text-sm leading-relaxed">
            For a decision that interrupts what you were reading. It appears in the middle of the
            page and is dismissed by leaving it. Try the keyboard: focus moves inside, Tab cannot
            escape, Escape closes.
          </p>

          <div class="mt-3 flex flex-wrap gap-3">
            <BaseButton @click="modal = true">Open modal</BaseButton>
            <BaseButton variant="secondary" @click="alertModal = true">
              Open a modal that must be answered
            </BaseButton>
          </div>

          <BaseModal v-model="modal" title="Delete this entry?" close-label="Close">
            Focus moved into this dialog when it opened, and it will return to the button you
            pressed when it closes. Tab cycles inside, Escape closes, and the page behind cannot
            scroll.
            <template #actions>
              <BaseButton variant="ghost" @click="modal = false">Cancel</BaseButton>
              <BaseButton @click="modal = false">Delete</BaseButton>
            </template>
          </BaseModal>

          <BaseModal
            v-model="alertModal"
            title="Your session has expired"
            close-label="Close"
            tone="alert"
            :dismissible="false"
          >
            With <code class="text-xs">dismissible: false</code> there is no close button and Escape
            does nothing — for a decision the reader has to actually make.
            <template #actions>
              <BaseButton @click="alertModal = false">Sign in again</BaseButton>
            </template>
          </BaseModal>

          <PropTable name="BaseModal" />
        </div>

        <div>
          <p class="text-ink text-sm font-medium">BaseSheet — arrives from the bottom edge</p>
          <p class="text-ink-soft mt-1 max-w-[64ch] text-sm leading-relaxed">
            The same job on a phone, where the top of the screen is out of reach and the bottom is
            where your thumb already is. It carries a drag handle and is dismissed by pulling it
            back down.
          </p>
          <p class="text-ink-soft mt-2 max-w-[64ch] text-sm leading-relaxed">
            <strong class="text-ink">It will look narrow on a desktop, and that is correct.</strong>
            A sheet belongs to a phone-shaped app, so it is pinned to the same 430px column the app
            shell uses rather than stretching across a wide monitor. On a phone that column is the
            whole screen.
          </p>

          <BaseButton class="mt-3" variant="ghost" @click="sheet = true"
            >Open bottom sheet</BaseButton
          >

          <BaseSheet
            v-model="sheet"
            title="New transaction"
            subtitle="This is what a sheet is for"
            close-label="Close"
          >
            <p class="text-ink-soft text-sm leading-relaxed">
              A form, a picker, a confirmation — anything a phone app would otherwise send you to a
              second screen for. It stops at the width of the app shell, which on a phone is the
              whole viewport.
            </p>
          </BaseSheet>

          <PropTable name="BaseSheet" />
        </div>

        <div>
          <p class="text-ink text-sm font-medium">BaseMenu — a short list of actions</p>
          <p class="text-ink-soft mt-1 max-w-[64ch] text-sm leading-relaxed">
            Not a dialog at all. Open it and try the arrow keys: they move between items, Home and
            End jump to the ends, Escape closes, and Tab leaves rather than trapping you inside.
          </p>

          <div class="mt-3">
            <BaseMenu v-model="menuOpen" label="Account">
              <template #trigger><BaseAvatar label="Account" /></template>
              <a role="menuitem" href="#api-BaseMenu">Profile</a>
              <a role="menuitem" href="#api-BaseAvatar">My notes</a>
              <hr />
              <button type="button" role="menuitem">Sign out</button>
            </BaseMenu>
          </div>

          <PropTable name="BaseMenu" />
        </div>

        <div>
          <p class="text-ink text-sm font-medium">BaseTooltip — a label, not a layer</p>
          <p class="text-ink-soft mt-1 max-w-[64ch] text-sm leading-relaxed">
            Shown by <code class="text-xs">:hover</code> and
            <code class="text-xs">:focus-within</code> in the stylesheet — no JavaScript, so it
            survives a prerendered page and a reader with scripting off. Reach the button with Tab
            and it appears.
          </p>

          <div class="mt-3">
            <BaseTooltip label="Copy to clipboard">
              <template #default="{ describedBy }">
                <BaseButton variant="secondary" :aria-describedby="describedBy">
                  <Settings class="size-4" />
                </BaseButton>
              </template>
            </BaseTooltip>
          </div>

          <PropTable name="BaseTooltip" />
        </div>
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Navigation ─────────────────────────── -->
    <section id="gezinme">
      <SectionHeading :tone="NEUTRAL" label="Navigation" />
      <p class="text-ink-soft mt-2 text-sm">
        The parts that say where you are and where you can go.
      </p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div>
          <NavLinks :items="NAV" active="blog" label="Primary navigation" />
          <PropTable name="NavLinks" />
        </div>

        <div>
          <BaseBreadcrumb
            :items="[
              { label: 'Courses', to: '/courses' },
              { label: 'N5', to: '/courses/n5' },
              { label: 'Day 3' },
            ]"
            label="Breadcrumb"
          />
          <PropTable name="BaseBreadcrumb" />
        </div>

        <div>
          <BaseTabs v-model="tab" :items="TABS" label="Sections">
            <template #default="{ item }">
              <p class="text-ink-soft text-sm">
                {{ item.key === 'overview' ? 'The overview panel.' : 'The history panel.' }}
                Move with the arrow keys; Home and End jump to the ends.
              </p>
            </template>
          </BaseTabs>
          <PropTable name="BaseTabs" />
        </div>

        <div>
          <BasePagination
            :page="page"
            :pages="40"
            previous-label="Previous"
            next-label="Next"
            label="Pages"
            @change="page = $event"
          />
          <PropTable name="BasePagination" />
        </div>

        <div>
          <!-- The bar is absolutely positioned -- it hangs inside the phone
               shell rather than in the flow -- so it needs a box of its own.
               The table has to sit outside that box, or opening it spills out
               of the fixed height. -->
          <div class="border-hair/70 rounded-card relative h-24 overflow-hidden border">
            <TabBar :items="BOTTOM" active="ledger" label="Bottom bar" />
          </div>
          <PropTable name="TabBar" />
        </div>
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Disclosure ─────────────────────────── -->
    <section id="acilir">
      <SectionHeading :tone="NEUTRAL" label="Disclosure" />
      <p class="text-ink-soft mt-2 text-sm">
        The answer stays in the markup while the section is shut — which is what a crawler, and a
        reader without JavaScript, actually get.
      </p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div>
          <BaseAccordion :items="FAQ">
            <template #default="{ item }">
              {{
                item.key === 'cancel'
                  ? 'Any time, in one click.'
                  : 'Unconditional, within fourteen days.'
              }}
            </template>
          </BaseAccordion>
          <PropTable name="BaseAccordion" />
        </div>

        <div>
          <BaseDisclosure v-model="firstDisclosure" title="One row — the list is yours">
            Reach for this when the list belongs to your app: when the rows are staggered as they
            scroll in, interleaved with something else, or built from a source the accordion cannot
            see.
          </BaseDisclosure>
          <PropTable name="BaseDisclosure" />
        </div>
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Data ─────────────────────────── -->
    <section id="veri">
      <SectionHeading :tone="NEUTRAL" label="Data" />
      <p class="text-ink-soft mt-2 text-sm">
        The table owns its horizontal scroller and that scroller is reachable by keyboard — a region
        you can only get to by dragging is a region a keyboard cannot read at all.
      </p>

      <BaseCard class="mt-5">
        <BaseTable :columns="COLUMNS" :rows="ROWS" caption="September spending" row-key="name" />
        <PropTable name="BaseTable" />
      </BaseCard>
    </section>

    <!-- ─────────────────────────── State ─────────────────────────── -->
    <section id="durum">
      <SectionHeading :tone="NEUTRAL" label="State" />
      <p class="text-ink-soft mt-2 text-sm">Waiting, identity, and failure.</p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div>
          <div class="flex items-center gap-6">
            <BaseSpinner label="Loading courses" size="sm" />
            <BaseSpinner label="Loading courses" />
            <BaseSpinner label="Loading courses" size="lg" />
          </div>
          <PropTable name="BaseSpinner" />
        </div>

        <div>
          <div class="flex items-center gap-4">
            <BaseAvatar label="Your account" size="sm" />
            <BaseAvatar label="Your account" />
            <BaseAvatar name="Ramazan Dogan" fallback="initials" size="lg" />
          </div>
          <PropTable name="BaseAvatar" />
        </div>

        <div>
          <BaseButton variant="secondary" @click="boom = !boom">
            {{ boom ? 'Reset the boundary' : 'Make a component throw' }}
          </BaseButton>
          <div class="mt-3">
            <ErrorBoundary
              :key="String(boom)"
              title="This section did not load"
              retry-label="Try again"
            >
              <component :is="boom ? Boom : 'p'" class="text-ink-soft text-sm">
                Content that works.
              </component>
            </ErrorBoundary>
          </div>
          <PropTable name="ErrorBoundary" />
        </div>
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Phone shell ─────────────────────────── -->
    <section id="kabuk">
      <SectionHeading :tone="NEUTRAL" label="Phone shell" />
      <p class="text-ink-soft mt-2 text-sm">
        <code>rei-kit/app</code> — what a fourth phone app starts from instead of an empty
        <code>src/</code>.
      </p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div>
          <p class="text-ink-soft max-w-[64ch] text-sm leading-relaxed">
            The banner only appears when the connection is actually gone. It floats rather than
            sitting in the flow, so a connection that flickers in a lift does not reflow the page
            each time. The action button shares the tab bar's column rather than the shell's —
            anchored to the shell it sat four hundred pixels away from it on a wide screen.
          </p>

          <div class="border-hair/70 rounded-card relative mt-3 h-40 overflow-hidden border">
            <OfflineBanner label="No connection" />
            <FabButton label="New entry"><Plus /></FabButton>
          </div>

          <PropTable name="OfflineBanner" />
          <PropTable name="FabButton" />
        </div>

        <div>
          <div class="border-hair/70 rounded-card h-64 overflow-hidden border">
            <AuthShell>
              <template #brand>
                <p class="text-ink text-lg font-semibold">rei</p>
              </template>
              <p class="text-ink-soft text-center text-sm">
                The frame every sign-in screen sits in.
              </p>
            </AuthShell>
          </div>
          <PropTable name="AuthShell" />
        </div>

        <div>
          <PriceCard
            name="Yearly"
            lead="Everything, for a year."
            price="¥12,000"
            period="/ year"
            note="Billed once. Cancel any time."
            chip="Most popular"
            badge="Recommended"
            recommended
            tone="cool"
            :features="['Every course', 'Exam preparation', 'No commitment']"
          />
          <PropTable name="PriceCard" />
        </div>
      </BaseCard>
    </section>
  </div>
</template>
