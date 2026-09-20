<script setup lang="ts">
import { NEUTRAL } from './tones'
import { computed, ref } from 'vue'
import { CalendarRange, Plus, ReceiptText, Settings, UserStar } from 'lucide-vue-next'

import {
  BaseAvatar,
  BaseButton,
  BaseCard,
  BaseKbd,
  BaseBadge,
  BaseMenu,
  BasePopconfirm,
  BaseSeparator,
  DescriptionList,
  BasePopover,
  BaseSheet,
  BaseStepper,
  BaseSpinner,
  BaseSwitch,
  BaseTable,
  BaseTimeline,
  ErrorBoundary,
  PriceCard,
  SectionHeading,
  TabBar,
  useToast,
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
  BaseSplitter,
  BaseToolbar,
  BaseTree,
  CommandMenu,
  DataTable,
  MegaMenu,
  NavLinks,
  ResponsiveDialog,
  TransferList,
} from '../src/web/index'
import type { TableSort } from '../src/web/index'
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
const modal = ref(false)
const alertModal = ref(false)
const sheet = ref(false)
const tab = ref<'overview' | 'history'>('overview')
const page = ref(7)
const menuOpen = ref(false)

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

const onlyUnpaid = ref(true)
const thisMonth = ref(false)

const STEPS = [
  { key: 'account', label: 'Account', description: 'Email and password' },
  { key: 'plan', label: 'Plan', description: 'Monthly or yearly' },
  { key: 'payment', label: 'Payment', description: 'Card details' },
  { key: 'done', label: 'Done' },
] as const
const step = ref<(typeof STEPS)[number]['key']>('plan')
const stepIndex = computed(() => STEPS.findIndex((s) => s.key === step.value))
function move(by: number) {
  step.value = STEPS[Math.max(0, Math.min(STEPS.length - 1, stepIndex.value + by))]!.key
}

const toast = useToast()

const sort = ref<TableSort<(typeof DATA_ROWS)[number]> | undefined>({
  key: 'amount',
  direction: 'desc',
})
const picked = ref<string[]>([])
const DATA_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'method', label: 'Method' },
  { key: 'amount', label: 'Amount', align: 'end', sortable: true },
] as const
const DATA_ROWS = [
  { id: 'a', name: 'Ada Lovelace', method: 'Card', amount: 4200 },
  { id: 'b', name: 'Ömer Seyfettin', method: 'Transfer', amount: 120 },
  { id: 'c', name: 'Mei Lin', method: 'Card', amount: 980 },
]

const commands = ref(false)
const COMMANDS = [
  {
    label: 'Entries',
    items: [
      { id: 'new', label: 'Write an entry', hint: '⌘N', keywords: ['add', 'create'] },
      { id: 'search', label: 'Search entries', keywords: ['find'] },
    ],
  },
  { label: 'Appearance', items: [{ id: 'theme', label: 'Switch the theme' }] },
] as const

const split = ref(38)
const openFolders = ref(['src'])
const openFile = ref<string | undefined>('index')
const FILES = [
  {
    key: 'src',
    label: 'src',
    children: [
      { key: 'index', label: 'index.ts' },
      {
        key: 'components',
        label: 'components',
        children: [
          { key: 'button', label: 'BaseButton.vue' },
          { key: 'card', label: 'BaseCard.vue' },
        ],
      },
    ],
  },
  { key: 'readme', label: 'README.md' },
]

const granted = ref<string[]>(['read'])
const PERMISSIONS = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'admin', label: 'Administer' },
  { value: 'billing', label: 'Billing' },
]

const askDelete = ref(false)
/* One event carries a note, the rest do not -- a slot named for its key
   wins over the shared body. Declared rather than inferred: left to
   inference these literals are a union, and a per-key slot would then see
   an event that may or may not have a `note`. */
interface TrailEvent {
  key: string
  time: string
  title: string
  note?: string
  fill?: string
}

const TRAIL: TrailEvent[] = [
  { key: 'placed', time: '12 Sep, 09:42', title: 'Order placed' },
  {
    key: 'packed',
    time: '12 Sep, 14:10',
    title: 'Packed',
    note: 'Two parcels; the mug went in the smaller one.',
  },
  { key: 'sent', time: '13 Sep, 08:00', title: 'Sent', fill: 'bg-positive' },
  { key: 'due', time: 'Expected 15 Sep', title: 'Delivery', fill: 'bg-muted' },
]

const FACTS = [
  { key: 'status', term: 'Status' },
  { term: 'Created', description: '12 September 2026' },
  { term: 'Total', description: '₺1,240' },
]

function onCommand(id: string) {
  toast.info(`Ran: ${id}`)
}
</script>

<template>
  <div class="flex flex-col gap-14">
    <!-- ─────────────────────────── Form ─────────────────────────── -->
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

          <p class="text-ink-soft mt-4 text-xs">
            <code class="text-xs">follow</code> tracks the pointer instead, for a target big enough
            that a bubble pinned to the middle would be nowhere near what is under the cursor. It is
            the one thing here that needs JavaScript, so it is opt-in — and it goes back to the
            anchored bubble for a keyboard and for anyone who asked their system for less motion.
          </p>
          <div class="mt-3">
            <BaseTooltip class="w-full" label="Tuesday, 12 September — 3 entries" follow>
              <template #default="{ describedBy }">
                <div
                  class="bg-muted rounded-card text-ink-soft grid h-24 w-full place-items-center text-xs"
                  tabindex="0"
                  :aria-describedby="describedBy"
                >
                  Move the pointer across this
                </div>
              </template>
            </BaseTooltip>
          </div>

          <PropTable name="BaseTooltip" />
        </div>

        <div>
          <p class="text-ink text-sm font-medium">BasePopover</p>
          <p class="text-ink-soft mt-1 text-xs">
            Anything, anchored to its trigger. Focus goes in, Escape brings it back, and the page
            stays usable. The trigger is your own button.
          </p>
          <div class="mt-3">
            <BasePopover label="Filters">
              <template #trigger="{ props }">
                <BaseButton variant="secondary" v-bind="props">Filters</BaseButton>
              </template>
              <template #default="{ close }">
                <div class="flex flex-col gap-3">
                  <BaseSwitch v-model="onlyUnpaid" label="Only unpaid" />
                  <BaseSwitch v-model="thisMonth" label="This month" />
                  <BaseButton size="sm" block @click="close">Done</BaseButton>
                </div>
              </template>
            </BasePopover>
          </div>
          <PropTable name="BasePopover" />
        </div>

        <div>
          <p class="text-ink text-sm font-medium">BasePopconfirm</p>
          <p class="text-ink-soft mt-1 text-xs">
            The question beside the button that asked it, so what is being deleted stays on screen.
          </p>
          <div class="mt-3">
            <BasePopconfirm
              message="This entry will be deleted."
              confirm-label="Delete"
              cancel-label="Cancel"
              @confirm="toast.success('Entry deleted')"
            >
              <template #trigger="{ props }">
                <BaseButton variant="danger" size="sm" v-bind="props">Delete</BaseButton>
              </template>
            </BasePopconfirm>
          </div>
          <PropTable name="BasePopconfirm" />
        </div>

        <div>
          <p class="text-ink text-sm font-medium">ResponsiveDialog</p>
          <p class="text-ink-soft mt-1 text-xs">
            A modal here, a sheet on a phone — one set of props. Narrow the window and press it
            again.
          </p>
          <div class="mt-3">
            <BaseButton variant="secondary" size="sm" @click="askDelete = true">
              Ask to delete
            </BaseButton>
          </div>
          <ResponsiveDialog
            v-model="askDelete"
            title="Delete this account?"
            close-label="Close"
            tone="alert"
          >
            Everything in it goes with it. This cannot be undone.
            <template #actions>
              <BaseButton variant="secondary" @click="askDelete = false">Keep it</BaseButton>
              <BaseButton variant="danger" @click="askDelete = false">Delete</BaseButton>
            </template>
          </ResponsiveDialog>
          <PropTable name="ResponsiveDialog" />
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
          <p class="text-ink text-sm font-medium">MegaMenu</p>
          <p class="text-ink-soft mt-1 mb-3 text-xs">
            The same row where a section holds more than a row can. Each top item is a button that
            discloses a panel — not a <code class="text-xs">role="menu"</code>, which would promise
            a keyboard contract these links do not have. Hover opens it, and so do a press and
            Enter; Escape closes it and gives focus back.
          </p>
          <!-- The panel is absolutely positioned against the bar, so the bar
               needs room under it while one is open. -->
          <div class="pb-2">
            <MegaMenu :items="MEGA" active="pricing" label="Site navigation">
              <template #products>
                <p class="text-ink-soft mt-4 text-xs">Everything is free while it is in beta.</p>
              </template>
            </MegaMenu>
          </div>
          <PropTable name="MegaMenu" />
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

        <div class="sm:col-span-2">
          <p class="text-ink text-sm font-medium">BaseStepper</p>
          <p class="text-ink-soft mt-1 text-xs">
            Where you are in a process. Finished steps can be clicked to go back; steps ahead
            cannot.
          </p>
          <BaseStepper
            v-model="step"
            class="mt-4"
            :steps="STEPS"
            label="Sign-up"
            interactive
            :state-labels="{ complete: 'done', error: 'needs attention' }"
          />
          <div class="mt-4 flex gap-2">
            <BaseButton size="sm" variant="secondary" :disabled="stepIndex === 0" @click="move(-1)"
              >Back</BaseButton
            >
            <BaseButton size="sm" :disabled="stepIndex === STEPS.length - 1" @click="move(1)"
              >Next</BaseButton
            >
          </div>
          <PropTable name="BaseStepper" />
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

      <BaseCard class="mt-4">
        <p class="text-ink text-sm font-medium">DataTable</p>
        <p class="text-ink-soft mt-1 mb-3 text-xs">
          The same table with what real data grows: press a heading to sort — the header says
          “sorted ascending” to a screen reader, not only an arrow — and tick rows by key, so the
          selection survives a sort.
        </p>
        <DataTable
          v-model:sort="sort"
          v-model:selected="picked"
          :columns="DATA_COLUMNS"
          :rows="DATA_ROWS"
          caption="Payments"
          row-key="id"
          select-all-label="Select every payment"
          :row-label="(row) => `Select ${row.name}`"
        >
          <template #amount="{ value }">{{ value }} ₺</template>
        </DataTable>
        <p class="text-ink-soft mt-3 text-xs">{{ picked.length }} selected</p>
        <PropTable name="DataTable" />
      </BaseCard>

      <!-- Not a form control, which is where this used to sit: it states
           facts rather than taking an answer, so it belongs with the table. -->
      <BaseCard :id="'veri-dl'" class="mt-4">
        <p class="text-ink text-sm font-medium">DescriptionList</p>
        <p class="text-ink-soft mt-1 mb-3 text-xs">
          Pairs of what-it-is and what-it-says, as the <code class="text-xs">&lt;dl&gt;</code> that
          exists for exactly this. A grid of divs says nothing about which text names which value;
          here “Status: Paid” is heard as one thing.
        </p>
        <DescriptionList :items="FACTS" layout="inline">
          <template #status><BaseBadge tone="success">Paid</BaseBadge></template>
        </DescriptionList>
        <PropTable name="DescriptionList" />
      </BaseCard>

      <BaseCard class="mt-4">
        <p class="text-ink text-sm font-medium">BaseTimeline</p>
        <p class="text-ink-soft mt-1 mb-4 max-w-[64ch] text-xs leading-relaxed">
          What happened, in order. An <code class="text-xs">&lt;ol&gt;</code>, so it is heard as a
          list with a count and each event's time is read before its title — the rail and the dots
          carry nothing and are hidden. It is generic over your own objects, the way the table is
          over its rows, so the body slot hands them back typed. Not
          <code class="text-xs">BaseStepper</code>: that is a process you are in, and this is a
          record of one that happened.
        </p>
        <BaseTimeline :events="TRAIL" label="Order history">
          <template #packed="{ event }">
            <BaseCard as="blockquote" padding="sm" class="text-ink-soft text-xs">
              {{ event.note }}
            </BaseCard>
          </template>
        </BaseTimeline>
        <PropTable name="BaseTimeline" />
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Command menu ─────────────────────────── -->
    <section id="komut">
      <SectionHeading :tone="NEUTRAL" label="Command menu" />
      <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
        Everything the app can do, behind one shortcut. The field is a combobox and the results are
        its listbox, so focus never leaves what you are typing in; the arrows move the current
        result and <code class="text-xs">aria-activedescendant</code> says which one it is.
      </p>

      <BaseCard class="mt-5">
        <div class="flex flex-wrap items-center gap-3">
          <BaseButton variant="secondary" @click="commands = true">Open</BaseButton>
          <span class="text-ink-soft text-sm"
            >or press <BaseKbd :keys="['⌘', 'K']" joiner="+"
          /></span>
        </div>
        <CommandMenu
          v-model="commands"
          :groups="COMMANDS"
          label="Commands"
          placeholder="Type a command or search"
          empty-label="Nothing found"
          hotkey="k"
          @select="onCommand"
        />
        <PropTable name="CommandMenu" />
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Desk layout ─────────────────────────── -->
    <section id="masa">
      <SectionHeading :tone="NEUTRAL" label="Desk layout" />
      <p class="text-ink-soft mt-2 max-w-[62ch] text-sm leading-relaxed">
        The shapes a wide screen is arranged with. Each is a keyboard problem first: the tree's
        arrows open, close and step in and out; the splitter's handle moves with them too, which is
        the part a drag-only divider never offers.
      </p>

      <BaseCard class="mt-5">
        <BaseToolbar label="Files" class="mb-3">
          <BaseButton size="sm" variant="ghost">New</BaseButton>
          <BaseButton size="sm" variant="ghost">Rename</BaseButton>
          <BaseSeparator orientation="vertical" spacing="sm" />
          <BaseButton size="sm" variant="ghost">Delete</BaseButton>
        </BaseToolbar>

        <div class="border-hair/70 rounded-card h-64 overflow-hidden border">
          <BaseSplitter v-model="split" label="Resize the file list" class="h-full">
            <template #start>
              <BaseTree
                v-model="openFile"
                v-model:expanded="openFolders"
                class="p-2"
                :nodes="FILES"
                label="Files"
              />
            </template>
            <template #end>
              <div class="text-ink-soft p-4 text-sm">
                <p class="text-ink font-medium">{{ openFile ?? 'Nothing chosen' }}</p>
                <p class="mt-2 text-xs">
                  The handle is a separator with a value: the arrows move it, Home and End send it
                  to its limits, Enter puts it back.
                </p>
              </div>
            </template>
          </BaseSplitter>
        </div>

        <PropTable name="BaseTree" />
      </BaseCard>

      <BaseCard class="mt-4">
        <p class="text-ink text-sm font-medium">TransferList</p>
        <p class="text-ink-soft mt-1 mb-3 text-xs">
          Available on the left, chosen on the right, and the chosen side keeps the order things
          were added in.
        </p>
        <TransferList
          v-model="granted"
          :options="PERMISSIONS"
          available-label="Available"
          chosen-label="Granted"
          add-label="Grant the chosen permissions"
          remove-label="Take back the chosen permissions"
          height="10rem"
        />
        <PropTable name="TransferList" />
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
