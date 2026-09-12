<script setup lang="ts" generic="K extends string">
import { ref, useId } from 'vue'

export interface TabPanel<K extends string> {
  key: K
  /** Already translated. */
  label: string
}

/**
 * Sections of one page, one visible at a time.
 *
 * Not `TabBar` and not `NavLinks`: those navigate, and the browser's back
 * button undoes them. These switch a panel inside a page that does not change,
 * so there is no history entry and no route.
 *
 * ## The keyboard, which is the whole reason this is a component
 *
 * The pattern is prescribed and it is not what a row of buttons does by
 * default. Tab enters the tablist once and leaves it once — it does not walk
 * through every tab — and the arrow keys move between them. That is roving
 * tabindex: exactly one tab is reachable by Tab at a time, and moving the
 * selection moves it. Home and End jump to the ends, and the selection wraps,
 * because a list with no edges is faster than one you can fall off.
 *
 * Hand-written tabs almost always get this wrong in the same way: every tab is
 * tabbable, so a keyboard user presses Tab six times to reach the content.
 */
const { items, label = '' } = defineProps<{
  items: readonly TabPanel<K>[]
  /** Accessible name for the tablist. */
  label?: string | undefined
}>()

defineSlots<{
  /** The panel for the selected tab. */
  default: (props: { item: TabPanel<K>; active: K }) => unknown
}>()

const active = defineModel<K>({ required: true })

const uid = useId()
const tabs = ref<HTMLElement[]>([])

const tabId = (key: K) => `${uid}-tab-${key}`
const panelId = (key: K) => `${uid}-panel-${key}`

function select(key: K, focus = false) {
  active.value = key
  if (!focus) return

  // Focus follows selection, which is what the arrow keys are for. The element
  // is looked up after the update so the new tab is the one that is reachable.
  const index = items.findIndex((item) => item.key === key)
  requestAnimationFrame(() => tabs.value[index]?.focus())
}

function onKeydown(event: KeyboardEvent) {
  const index = items.findIndex((item) => item.key === active.value)
  if (index < 0) return

  const last = items.length - 1
  let next: number | undefined

  if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
  else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last
  else return

  event.preventDefault()
  const item = items[next]
  if (item) select(item.key, true)
}
</script>

<template>
  <div>
    <div class="rk-tabs" role="tablist" :aria-label="label || undefined" @keydown="onKeydown">
      <button
        v-for="item in items"
        :key="item.key"
        ref="tabs"
        type="button"
        role="tab"
        class="rk-tab"
        :class="{ 'is-active': item.key === active }"
        :id="tabId(item.key)"
        :aria-selected="item.key === active"
        :aria-controls="panelId(item.key)"
        :tabindex="item.key === active ? 0 : -1"
        @click="select(item.key)"
      >
        {{ item.label }}
      </button>
    </div>

    <div
      v-for="item in items"
      v-show="item.key === active"
      :key="item.key"
      role="tabpanel"
      class="rk-tabpanel"
      :id="panelId(item.key)"
      :aria-labelledby="tabId(item.key)"
      tabindex="0"
    >
      <!-- Every panel is rendered and hidden rather than swapped, so the page
           keeps its height and a crawler sees all of it. -->
      <slot :item="item" :active="active" />
    </div>
  </div>
</template>

<style scoped>
.rk-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--color-hair) 70%, transparent);
}

.rk-tab {
  position: relative;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--color-ink-soft);
  transition: color 150ms;
}

.rk-tab:hover {
  color: var(--color-ink);
}

.rk-tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
  border-radius: var(--radius-cell);
}

.rk-tab.is-active {
  color: var(--color-ink);
  font-weight: 500;
}

.rk-tab.is-active::after {
  content: '';
  position: absolute;
  inset-inline: 0.5rem;
  bottom: -1px;
  height: 2px;
  border-radius: 9999px;
  background: var(--color-primary);
}

.rk-tabpanel {
  padding-top: 1rem;
}

.rk-tabpanel:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
