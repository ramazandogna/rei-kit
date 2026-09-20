<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import AuthorCredit from './AuthorCredit.vue'
import { BASICS_PARTS } from './basics-parts'
import { FORM_GROUPS, FORM_PARTS } from './form-parts'
import { DESK_PARTS } from './desk-parts'
import { MOTION_PARTS } from './motion-parts'
import { NAV_PARTS } from './nav-parts'
import { OVERLAY_PARTS } from './overlay-parts'
import catalogue from './props.generated.json'

/**
 * The way around the page.
 *
 * A single scrolling gallery is fine for reading once and useless for the thing
 * people actually do, which is arrive knowing what they need — "a dropdown", "a
 * date field" — and wanting to see whether it exists. So: every component
 * listed, filterable by name, and the list follows where you are.
 *
 * ## Why the highlight is an IntersectionObserver and not a scroll handler
 *
 * A scroll handler runs on the main thread on every frame, and this page is
 * fifteen thousand pixels of live components. The observer does the work off
 * the main thread and reports only when a section crosses the line, which is
 * the difference between a menu that follows you and a page that stutters
 * while it does.
 *
 * The line is a quarter down the viewport rather than at the top, because a
 * heading that has just scrolled off is still the section you are reading.
 */
const SECTIONS = [
  { id: 'start', label: 'Get started' },
  { id: 'axes', label: 'Themes: materials & palettes' },
  { id: 'aksiyon', label: 'Action' },
  { id: 'basics', label: 'Basics' },
  ...BASICS_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'hareket', label: 'Motion' },
  ...MOTION_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'yuzey', label: 'Surfaces' },
  { id: 'geri-bildirim', label: 'Status and feedback' },
  { id: 'ilerleme', label: 'Progress' },
  { id: 'bildirim', label: 'Notifications' },
  ...FORM_GROUPS.flatMap((group) => [
    { id: group.id, label: group.label },
    ...FORM_PARTS.filter((part) => part.group === group.id).map((part) => ({
      id: part.id,
      label: part.label,
      sub: true,
    })),
  ]),
  { id: 'tarih', label: 'Dates and times' },
  { id: 'ayarlar', label: 'Settings' },
  { id: 'ust-katman', label: 'Overlays' },
  ...OVERLAY_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'gezinme', label: 'Navigation' },
  ...NAV_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'acilir', label: 'Disclosure' },
  { id: 'veri', label: 'Data' },
  { id: 'komut', label: 'Command menu' },
  { id: 'masa', label: 'Desk layout' },
  ...DESK_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'durum', label: 'State' },
  { id: 'kabuk', label: 'Phone shell' },
  { id: 'bosluk', label: 'Empty and waiting' },
  { id: 'olcu', label: 'Metrics' },
  { id: 'api', label: 'All props' },
  { id: 'credits', label: 'About & credits' },
]

const ENTRY_ORDER = ['rei-kit', 'rei-kit/web', 'rei-kit/app', 'rei-kit/pwa', 'rei-kit/motion']

const query = ref('')
const active = ref('')
const open = ref(false)

/**
 * Where a component's name in this list should take you.
 *
 * The demo, wherever one exists — that is what somebody clicking `BaseSwitch`
 * wants to see, and the props are printed directly under it anyway. This list
 * used to send every name to the props table instead, which answered a
 * question nobody had asked yet.
 *
 * Built from the same part lists the sections are built from, so a part that
 * gains a heading gains the link on the same commit.
 */
const DEMOS = new Map<string, string>([
  ...BASICS_PARTS.map((part) => [part.label, part.id] as const),
  ...MOTION_PARTS.map((part) => [part.label, part.id] as const),
  ...FORM_PARTS.map((part) => [part.label, part.id] as const),
])

const targetFor = (name: string) => DEMOS.get(name) ?? `api-${name}`

const groups = computed(() => {
  const needle = query.value.trim().toLowerCase()

  return ENTRY_ORDER.map((entry) => ({
    entry,
    items: catalogue
      .filter((c) => c.entry === entry)
      .filter((c) => needle === '' || c.name.toLowerCase().includes(needle))
      .map((c) => ({ ...c, target: targetFor(c.name) })),
  })).filter((group) => group.items.length > 0)
})

const found = computed(() => groups.value.reduce((n, g) => n + g.items.length, 0))

const sections = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (needle === '') return SECTIONS

  return SECTIONS.filter((s) => s.label.toLowerCase().includes(needle))
})

let observer: IntersectionObserver | undefined

let targets: HTMLElement[] = []

/**
 * The last heading the reader has scrolled past.
 *
 * Not "the topmost thing in view": a tall card ending just inside the band
 * counts as in view, so the topmost was routinely the one *above* the one being
 * read — jumping to `BaseModal` highlighted `BaseDisclosure`. What a reader
 * means by "where am I" is the last thing that has started, which is this.
 *
 * The observer is a cheap trigger rather than the answer. It fires only when
 * something crosses the line, and this reads the rects then — rare enough that
 * the layout cost never lands on a scrolling frame, which is what a scroll
 * handler could not promise on a page this long.
 */
/**
 * True while a click's smooth scroll is still travelling.
 *
 * The observer fires as sections stream past and then stops, so its last word
 * is whatever was under the line halfway through the journey — which is why
 * jumping to `BaseModal` settled on the component before it. The reader's click
 * is better information than anything measured mid-flight, so measurement waits
 * until the page has stopped.
 */
let jumping = false

function pickActive() {
  if (jumping) return

  /* Just under the sticky header, not a third of the way down. The API cards
     are about 150px tall, so a line at 30% of the viewport had two of them
     above it and picked the lower one -- the menu pointed one component past
     wherever you had just jumped. It matches `scroll-margin-top` in main.css,
     which is where a jumped-to heading comes to rest. */
  const line = 120
  let current = ''

  for (const el of targets) {
    if (el.getBoundingClientRect().top - 8 <= line) current = el.id
    else break
  }

  if (current) active.value = current
}

onMounted(() => {
  targets = [
    ...SECTIONS.map((s) => document.getElementById(s.id)),
    ...catalogue.map((c) => document.getElementById(`api-${c.name}`)),
  ]
    .filter((el): el is HTMLElement => el !== null)
    // Document order, read once: the DOM does not move while the page is open.
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))

  observer = new IntersectionObserver(pickActive, {
    // Only a trigger: the answer is computed from the rects above. A narrow
    // band would stop firing between two tall sections and freeze the menu.
    rootMargin: '0px 0px -40% 0px',
  })

  for (const target of targets) observer.observe(target)
  pickActive()

  // `scrollend` is the honest signal and is not everywhere yet, so the timeout
  // in `go` is what guarantees the flag clears.
  window.addEventListener('scrollend', onScrollEnd)
})

function onScrollEnd() {
  jumping = false
  pickActive()
}

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('scrollend', onScrollEnd)
  if (settle) clearTimeout(settle)
})

let settle: ReturnType<typeof setTimeout> | undefined

/** Closing on navigation, because a drawer left open covers what you just chose. */
watch(active, () => (open.value = false))

function go(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  open.value = false
  // Set immediately rather than waiting for the observer: the reader asked for
  // this one, and a menu that lags its own click feels broken.
  active.value = id
  jumping = true
  if (settle) clearTimeout(settle)
  settle = setTimeout(onScrollEnd, 1200)

  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  // Focus follows the jump, or the next Tab starts from the menu again.
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
</script>

<template>
  <!-- Phone: a button rather than a permanent column. 280px of menu on a 390px
       screen is a menu with a page attached to it. -->
  <button type="button" class="sc-nav-toggle" :aria-expanded="open" @click="open = !open">
    <span class="sc-nav-burger" aria-hidden="true">
      <span :class="{ 'is-open': open }" />
      <span :class="{ 'is-open': open }" />
    </span>
    {{ open ? 'Close' : 'Contents' }}
  </button>

  <div v-if="open" class="sc-nav-scrim" @click="open = false" />

  <nav class="sc-nav" :class="{ 'is-open': open }" aria-label="Components">
    <!-- Above the list rather than stuck to the top of it. Sticky inside the
         scroller, it needed an opaque ground to hide what slid under it, and
         over glass's coloured page that ground showed as a hard-edged slab. -->
    <label class="sc-nav-search">
      <span class="sr-only">Search components</span>
      <input
        v-model="query"
        type="search"
        placeholder="Search components…"
        autocomplete="off"
        class="sc-nav-input control"
      />
    </label>

    <div class="sc-nav-inner">
      <p v-if="query" class="sc-nav-count" role="status">
        {{ found }} components · {{ sections.length }} sections
      </p>

      <template v-if="sections.length">
        <p class="sc-nav-heading">Sections</p>
        <ul class="sc-nav-list">
          <li v-for="section in sections" :key="section.id">
            <a
              :href="`#${section.id}`"
              class="sc-nav-link"
              :class="{ 'is-active': active === section.id, 'is-sub': 'sub' in section }"
              :aria-current="active === section.id ? 'true' : undefined"
              @click.prevent="go(section.id)"
            >
              {{ section.label }}
            </a>
          </li>
        </ul>
      </template>

      <template v-for="group in groups" :key="group.entry">
        <p class="sc-nav-heading">{{ group.entry }}</p>
        <ul class="sc-nav-list">
          <li v-for="item in group.items" :key="item.name">
            <a
              :href="`#${item.target}`"
              class="sc-nav-link is-mono"
              :class="{ 'is-active': active === item.target }"
              :aria-current="active === item.target ? 'true' : undefined"
              @click.prevent="go(item.target)"
            >
              {{ item.name }}
            </a>
          </li>
        </ul>
      </template>

      <p v-if="found === 0 && sections.length === 0" class="sc-nav-empty">
        Nothing matches “{{ query }}”.
      </p>
    </div>

    <!-- Pinned under the list rather than at the end of it: the list is sixty
         items long, and a credit nobody scrolls to is not a credit. -->
    <div class="sc-nav-credit">
      <AuthorCredit compact />
    </div>
  </nav>
</template>

<style scoped>
.sc-nav {
  position: sticky;
  top: 4.5rem;
  align-self: start;
  display: flex;
  max-height: calc(100dvh - 6rem);
  width: 16rem;
  flex-shrink: 0;
  flex-direction: column;
}

.sc-nav-inner {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  padding-bottom: 2rem;
  scrollbar-width: thin;
}

.sc-nav-search {
  display: block;
  flex-shrink: 0;
  padding: 0 0.5rem 0.5rem 0;
}

.sc-nav-input {
  width: 100%;
  height: 2.25rem;
  border-radius: var(--radius-card);
  padding: 0 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-ink);
}

.sc-nav-input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.sc-nav-count {
  padding: 0 0.125rem 0.5rem;
  font-size: 0.6875rem;
  color: var(--color-ink-soft);
}

.sc-nav-heading {
  margin-top: 1rem;
  padding: 0 0.125rem 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

.sc-nav-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sc-nav-link {
  position: relative;
  display: block;
  border-radius: var(--radius-cell);
  padding: 0.3125rem 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-ink-soft);
  /* The colour moves, the box does not: a link that changes weight or size on
     hover reflows the list under the pointer. */
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.sc-nav-link.is-sub {
  margin-left: 0.75rem;
  border-left: 1px solid var(--color-hair);
  border-radius: 0 var(--radius-cell) var(--radius-cell) 0;
  padding-left: 0.625rem;
  font-size: 0.75rem;
}

.sc-nav-link.is-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
}

.sc-nav-link:hover {
  background: var(--color-muted);
  color: var(--color-ink);
}

.sc-nav-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.sc-nav-link.is-active {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  font-weight: 500;
}

/* The marker travels with the colour rather than appearing under it. */
.sc-nav-link.is-active::before {
  content: '';
  position: absolute;
  left: -0.375rem;
  top: 0.375rem;
  bottom: 0.375rem;
  width: 2px;
  border-radius: 9999px;
  background: var(--color-primary);
}

.sc-nav-credit {
  flex-shrink: 0;
  border-top: 1px solid var(--color-hair);
  padding: 0.875rem 0.5rem 0.25rem 0.125rem;
}

.sc-nav-empty {
  padding: 0.75rem 0.125rem;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}

.sc-nav-toggle {
  display: none;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border: 1px solid var(--color-hair);
  background: var(--color-surface);
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-ink);
  box-shadow: 0 8px 20px -10px rgb(0 0 0 / 0.4);
}

.sc-nav-burger {
  display: grid;
  gap: 4px;
  width: 0.875rem;
}

.sc-nav-burger span {
  display: block;
  height: 1.5px;
  border-radius: 9999px;
  background: currentColor;
  transition: transform 220ms cubic-bezier(0.32, 0.72, 0, 1);
}

.sc-nav-burger span.is-open:first-child {
  transform: translateY(2.75px) rotate(45deg);
}

.sc-nav-burger span.is-open:last-child {
  transform: translateY(-2.75px) rotate(-45deg);
}

.sc-nav-scrim {
  display: none;
}

@media (max-width: 63.99rem) {
  .sc-nav-toggle {
    position: fixed;
    bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
    left: 50%;
    z-index: 60;
    display: inline-flex;
    transform: translateX(-50%);
  }

  .sc-nav-scrim {
    position: fixed;
    inset: 0;
    z-index: 55;
    display: block;
    background: color-mix(in srgb, var(--color-ink) 45%, transparent);
    backdrop-filter: blur(2px);
  }

  .sc-nav {
    position: fixed;
    inset: 0 0 0 auto;
    top: 0;
    z-index: 56;
    width: min(19rem, 85vw);
    border-left: 1px solid var(--color-hair);
    background: var(--color-canvas);
    padding: 1rem 0.75rem 5rem 1rem;
    transform: translateX(100%);
    transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .sc-nav.is-open {
    transform: translateX(0);
  }

  /* The height stated rather than implied by top and bottom: the sticky
     column's `align-self: start` also applies to a fixed box in current
     browsers, and shrank the drawer to its content — sixty links tall, with
     the pinned credit three thousand pixels down. */
  .sc-nav {
    height: 100dvh;
    max-height: none;
    align-self: stretch;
  }

  /* Off screen and unreachable, not merely invisible: a closed drawer must not
     hand a Tab press to links nobody can see. */
  .sc-nav:not(.is-open) .sc-nav-search,
  .sc-nav:not(.is-open) .sc-nav-inner,
  .sc-nav:not(.is-open) .sc-nav-credit {
    visibility: hidden;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sc-nav,
  .sc-nav-burger span,
  .sc-nav-link {
    transition: none;
  }
}
</style>
