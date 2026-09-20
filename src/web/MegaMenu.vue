<script setup lang="ts" generic="K extends string">
import { ChevronDown } from 'lucide-vue-next'
import { onBeforeUnmount, ref, useId, watch } from 'vue'
import { RouterLink } from 'vue-router'

export interface MegaMenuLink {
  key: string
  /** Router destination. */
  to: string
  /** Already translated. */
  label: string
  /** A line under the label, for a link whose name is not enough. */
  description?: string | undefined
}

export interface MegaMenuColumn {
  key: string
  /** A heading over the column. Already translated. */
  title?: string | undefined
  links: readonly MegaMenuLink[]
}

export interface MegaMenuItem<K extends string> {
  /** Identity, compared against `active`. */
  key: K
  /** Already translated. */
  label: string
  /** A plain link, for a top-level item with nothing under it. */
  to?: string | undefined
  /** What the panel holds. With none, the item is just a link. */
  columns?: readonly MegaMenuColumn[] | undefined
}

/**
 * A wide site's navigation, where a section has more in it than a row can
 * hold: columns of links under a heading, opened from the bar.
 *
 * ## It is a disclosure, not a menu
 *
 * `role="menu"` is for an application's actions — the thing that opens from
 * a button and closes when you pick one. Site navigation is a set of links,
 * and announcing links as menu items tells a screen reader user that Tab
 * will not work, that the arrows will, and that they are in an application
 * when they are in a page. So each top-level item is a button that
 * *discloses* a panel, and the panel holds ordinary links: Tab walks them,
 * Escape closes and gives focus back to the button that opened it.
 *
 * This is the part hand-written mega menus get wrong, because `role="menu"`
 * looks like the more accessible answer and is the less accessible one.
 *
 * ## Hover is additive, never the only way in
 *
 * Opening on hover is what people expect on a wide screen, so it is here —
 * but every panel also opens on click and on Enter, because a hover-only
 * menu is a menu a keyboard, a touchscreen and a screen reader cannot open
 * at all. The close is delayed a little: a panel that vanishes while the
 * pointer crosses the gap between the button and the panel is a panel nobody
 * can reach.
 */
const {
  items,
  active = undefined,
  label = '',
  openOnHover = true,
  hoverDelay = 120,
} = defineProps<{
  items: readonly MegaMenuItem<K>[]
  /** Which section is current. Usually derived from the route. */
  active?: K | undefined
  /** Accessible name for the navigation landmark. */
  label?: string | undefined
  /** Whether a pointer opens a panel as well as a click. */
  openOnHover?: boolean | undefined
  /** How long the pointer has to leave before the panel closes, in ms. */
  hoverDelay?: number | undefined
}>()

const id = useId()
const panelId = (key: K) => `${id}-${key}`

/** Which panel is open; only ever one. */
const open = ref<K | null>(null)
/**
 * Whether the open panel was asked for rather than hovered into.
 *
 * Without this the pointer does both halves of a toggle: moving onto the
 * button opens the panel, and the click that follows -- the one press a
 * reader thinks of as opening it -- closes it again. A press on a hovered
 * panel pins it instead, so it stays when the pointer leaves, and the next
 * press closes it.
 */
const pinned = ref(false)
const root = ref<HTMLElement | null>(null)

let timer: ReturnType<typeof setTimeout> | undefined

function clearTimer() {
  if (timer) clearTimeout(timer)
  timer = undefined
}

function show(key: K) {
  clearTimer()
  if (open.value !== key) pinned.value = false
  open.value = key
}

function close() {
  clearTimer()
  open.value = null
  pinned.value = false
}

/**
 * Closing waits, because the pointer has to cross the gap between the button
 * and the panel and that gap is not over either of them.
 */
function scheduleClose() {
  if (pinned.value) return

  clearTimer()
  timer = setTimeout(() => (open.value = null), hoverDelay)
}

function toggle(key: K) {
  clearTimer()

  if (open.value === key) {
    // Hovered open, now asked for: keep it, and stop the pointer closing it.
    if (!pinned.value) {
      pinned.value = true
      return
    }

    close()
    return
  }

  open.value = key
  pinned.value = true
}

function onEscape() {
  const key = open.value
  if (key) closeAndReturn(key)
}

/** The button each panel belongs to, so focus can be given back to it. */
const buttons = new Map<K, HTMLElement>()

function setButton(key: K, el: Element | null) {
  if (el) buttons.set(key, el as HTMLElement)
  else buttons.delete(key)
}

function closeAndReturn(key: K) {
  close()
  // Focus goes back where it came from, or the next Tab starts at the top of
  // the page again.
  buttons.get(key)?.focus()
}

function onPointerEnter(item: MegaMenuItem<K>) {
  if (!openOnHover || !item.columns?.length) return
  show(item.key)
}

function onFocusOut(event: FocusEvent) {
  // Leaving the whole bar closes it; moving between the button and its own
  // panel does not.
  const next = event.relatedTarget as Node | null
  if (next && root.value?.contains(next)) return
  close()
}

function onDocumentPointer(event: Event) {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

watch(
  open,
  (value) => {
    if (typeof document === 'undefined') return

    if (value) document.addEventListener('pointerdown', onDocumentPointer)
    else document.removeEventListener('pointerdown', onDocumentPointer)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearTimer()
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onDocumentPointer)
  }
})
</script>

<template>
  <nav
    ref="root"
    class="rk-mega"
    :aria-label="label || undefined"
    @focusout="onFocusOut"
    @keydown.escape="onEscape"
  >
    <ul class="rk-mega-bar">
      <li
        v-for="item in items"
        :key="item.key"
        class="rk-mega-item"
        @pointerenter="onPointerEnter(item)"
        @pointerleave="openOnHover && scheduleClose()"
      >
        <!-- Nothing under it: an ordinary link, not a button that does
             nothing when it is pressed. -->
        <RouterLink
          v-if="!item.columns?.length && item.to"
          :to="item.to"
          class="rk-mega-top focus-ring"
          :class="{ 'is-active': item.key === active }"
          :aria-current="item.key === active ? 'page' : undefined"
        >
          {{ item.label }}
        </RouterLink>

        <button
          v-else
          :ref="(el) => setButton(item.key, el as Element | null)"
          type="button"
          class="rk-mega-top focus-ring"
          :class="{ 'is-active': item.key === active }"
          :aria-expanded="open === item.key"
          :aria-controls="panelId(item.key)"
          @click="toggle(item.key)"
        >
          {{ item.label }}
          <ChevronDown
            class="rk-mega-twist"
            :class="{ 'is-open': open === item.key }"
            aria-hidden="true"
          />
        </button>

        <div
          v-if="item.columns?.length"
          :id="panelId(item.key)"
          class="rk-mega-panel surface-overlay"
          :hidden="open !== item.key"
        >
          <div class="rk-mega-columns">
            <div v-for="column in item.columns" :key="column.key" class="rk-mega-column">
              <p v-if="column.title" class="rk-mega-column-title">{{ column.title }}</p>
              <ul class="rk-mega-links">
                <li v-for="link in column.links" :key="link.key">
                  <RouterLink :to="link.to" class="rk-mega-link focus-ring">
                    <span class="rk-mega-link-label">{{ link.label }}</span>
                    <span v-if="link.description" class="rk-mega-link-note">
                      {{ link.description }}
                    </span>
                  </RouterLink>
                </li>
              </ul>
            </div>
          </div>

          <!-- Anything the panel needs beside its links: a promotion, a
               picture, a call to action. -->
          <slot :name="item.key" />
        </div>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.rk-mega {
  position: relative;
}

.rk-mega-bar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rk-mega-item {
  position: static;
}

.rk-mega-top {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: var(--radius-cell);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink-soft);
  transition: color var(--duration-fast) var(--ease-standard);
}

.rk-mega-top:hover,
.rk-mega-top[aria-expanded='true'] {
  color: var(--color-ink);
}

.rk-mega-top.is-active {
  color: var(--color-primary);
}

.rk-mega-twist {
  width: 0.875rem;
  height: 0.875rem;
  transition: rotate var(--duration-fast) var(--ease-standard);
}

.rk-mega-twist.is-open {
  rotate: 180deg;
}

/* Full width of the bar rather than of the button: that is what makes it a
   mega menu and not a dropdown. */
.rk-mega-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 50;
  width: 100%;
  border-radius: var(--radius-card);
  padding: 1.25rem;
}

.rk-mega-panel[hidden] {
  display: none;
}

.rk-mega-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1.5rem;
}

.rk-mega-column-title {
  margin-bottom: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

.rk-mega-links {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.rk-mega-link {
  display: block;
  border-radius: var(--radius-cell);
  padding: 0.375rem 0.5rem;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.rk-mega-link:hover {
  background: var(--color-muted);
}

.rk-mega-link-label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-ink);
}

.rk-mega-link-note {
  display: block;
  margin-top: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-ink-soft);
}

/* On a narrow screen the panel is the page width and the columns stack,
   because a four-column grid in a 390px column is four unreadable columns. */
@media (max-width: 48rem) {
  .rk-mega-panel {
    padding: 1rem;
  }

  .rk-mega-columns {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }
}
</style>
