<script setup lang="ts">
import { NEUTRAL } from './tones'
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'

import {
  BaseAvatar,
  BaseButton,
  BaseCard,
  BaseKbd,
  BaseBadge,
  BaseSeparator,
  DescriptionList,
  BaseSpinner,
  BaseTable,
  BaseTimeline,
  ErrorBoundary,
  PriceCard,
  SectionHeading,
  useToast,
} from '../src/index'
import { AuthShell, FabButton, OfflineBanner } from '../src/app/index'
import {
  BaseAccordion,
  BaseDisclosure,
  BaseSplitter,
  BaseToolbar,
  BaseTree,
  CommandMenu,
  DataTable,
  TransferList,
} from '../src/web/index'
import type { TableSort } from '../src/web/index'
import NavigationSection from './NavigationSection.vue'
import OverlaysSection from './OverlaysSection.vue'
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

const FAQ = [
  { key: 'cancel', title: 'Can I cancel any time?' },
  { key: 'refund', title: 'What is the refund policy?' },
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
    <OverlaysSection />

    <NavigationSection />

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
