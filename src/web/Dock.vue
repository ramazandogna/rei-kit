<script setup lang="ts">
import { type Component, computed, ref, resolveDynamicComponent, useTemplateRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import { prefersReducedMotion } from '../motion/environment'
import { horizontalStep } from '../utils/direction'
import BaseBadge from '../components/BaseBadge.vue'
import BaseTooltip from './BaseTooltip.vue'

/**
 * A floating row of icon buttons whose icons swell toward the pointer, like a
 * launcher dock.
 *
 * It is a toolbar: one Tab stop, arrows (and Home/End) move between items, and
 * each item is a real button or link named by its label, which also shows as a
 * tooltip on hover and focus. The swell is the pointer's; a keyboard-focused
 * item grows a little and leaves its neighbours alone. Touch and reduced motion
 * get no swell — hover just tints the item.
 *
 * Glass is its natural material (the surface is the kit's, translucent there).
 * Brutal drops the falloff: the item under the pointer jumps to a fixed size.
 *
 * @example
 * ```vue
 * <Dock label="Apps" :items="[{ id: 'home', label: 'Home', icon: Home }]" active="home" />
 * ```
 */
export interface DockItem {
  id: string
  label: string
  icon?: Component | undefined
  href?: string | undefined
  to?: RouteLocationRaw | undefined
  badge?: string | number | undefined
  disabled?: boolean | undefined
}

/** A floating toolbar of icon buttons that swell toward the pointer. */
const {
  items,
  label,
  active = undefined,
  magnify = 1.6,
  distance = 120,
  size = 'md',
} = defineProps<{
  items: readonly DockItem[]
  /** The toolbar's accessible name. */
  label: string
  /** Id of the current item; it gets `aria-current` and a dot. */
  active?: string | undefined
  /** Scale of the item under the pointer. */
  magnify?: number | undefined
  /** Distance in px over which neighbours feel the pointer. */
  distance?: number | undefined
  size?: 'sm' | 'md' | undefined
}>()

const emit = defineEmits<{ select: [id: string] }>()

defineSlots<{
  /** Replaces an item's icon. */
  item?: (props: { item: DockItem; active: boolean; focused: boolean }) => unknown
}>()

const list = useTemplateRef<HTMLElement>('list')
const scales = ref<number[]>([])
const focused = ref<string | null>(null)
const at = ref(0)

const px = computed(() => (size === 'sm' ? 40 : 48))
const isNav = computed(() => items.some((item) => item.href || item.to))
const router = resolveDynamicComponent('RouterLink')

const current = computed(() => {
  const i = items.findIndex((item) => item.id === active)
  const j = items.findIndex((item) => !item.disabled)

  return Math.max(0, Math.min(at.value, items.length - 1) || (i >= 0 ? i : j))
})

function scaleFor(index: number, item: DockItem): number {
  if (focused.value !== null) return focused.value === item.id ? 1.25 : 1

  return scales.value[index] ?? 1
}

let frame = 0

function move(event: PointerEvent) {
  if (event.pointerType === 'touch' || prefersReducedMotion()) return
  const x = event.clientX
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const nodes = list.value?.querySelectorAll<HTMLElement>('.dk-item') ?? []
    scales.value = Array.from(nodes, (node) => {
      const rect = node.getBoundingClientRect()
      const d = Math.abs(x - (rect.left + rect.width / 2))
      const t = Math.min(d / distance, 1)

      return 1 + (magnify - 1) * Math.cos((Math.PI / 2) * t) ** 2
    })
  })
}

function leave() {
  cancelAnimationFrame(frame)
  scales.value = []
}

function controls(): HTMLElement[] {
  return Array.from(
    list.value?.querySelectorAll<HTMLElement>(
      '.dk-btn:not([disabled]):not([aria-disabled=true])',
    ) ?? [],
  )
}

function focusAt(index: number) {
  const all = controls()
  const next = all[(index + all.length) % all.length]
  if (!next) return
  at.value = items.findIndex((item) => item.id === next.dataset.id)
  next.focus()
}

function keydown(event: KeyboardEvent) {
  const all = controls()
  const i = all.indexOf(document.activeElement as HTMLElement)
  const step = horizontalStep(event.key, event.currentTarget as Element)
  if (step !== 0) {
    event.preventDefault()
    focusAt(i + step)
  } else if (event.key === 'Home') {
    event.preventDefault()
    focusAt(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    focusAt(all.length - 1)
  }
}

function onFocus(id: string, index: number) {
  focused.value = id
  at.value = index
}

function activate(item: DockItem) {
  if (!item.href && !item.to) emit('select', item.id)
}
</script>

<template>
  <component :is="isNav ? 'nav' : 'div'" :aria-label="isNav ? label : undefined">
    <ul
      ref="list"
      role="toolbar"
      :aria-label="label"
      class="dk surface-overlay rounded-shell"
      :class="`dk--${size}`"
      :style="{ '--dk-size': `${px}px` }"
      @pointermove="move"
      @pointerleave="leave"
      @keydown="keydown"
    >
      <li v-for="(item, index) in items" :key="item.id" role="none" class="dk-item">
        <BaseTooltip :label="item.label" placement="top">
          <component
            :is="item.to ? router : item.href ? 'a' : 'button'"
            class="dk-btn"
            :class="{ 'is-active': item.id === active }"
            :data-id="item.id"
            :style="{ '--dk-s': scaleFor(index, item) }"
            :aria-label="item.label"
            :aria-current="item.id === active ? 'page' : undefined"
            :aria-disabled="item.disabled && (item.href || item.to) ? 'true' : undefined"
            :disabled="item.disabled && !item.href && !item.to ? true : undefined"
            :tabindex="index === current ? 0 : -1"
            :href="item.href"
            :to="item.to"
            :type="item.href || item.to ? undefined : 'button'"
            @click="activate(item)"
            @focus="onFocus(item.id, index)"
            @blur="focused = null"
          >
            <slot
              name="item"
              :item="item"
              :active="item.id === active"
              :focused="focused === item.id"
            >
              <component :is="item.icon" v-if="item.icon" class="dk-icon" aria-hidden="true" />
              <span v-else aria-hidden="true">{{ item.label.slice(0, 1) }}</span>
            </slot>
            <BaseBadge v-if="item.badge !== undefined" tone="primary" class="dk-badge">
              {{ item.badge }}
            </BaseBadge>
            <span v-if="item.id === active" class="dk-dot" aria-hidden="true" />
          </component>
        </BaseTooltip>
      </li>
    </ul>
  </component>
</template>

<style scoped>
.dk {
  display: inline-flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin: 0;
  padding: 0.5rem;
  list-style: none;
}

.dk-item {
  display: flex;
}

.dk-btn {
  --dk-s: 1;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--dk-size) * var(--dk-s));
  height: calc(var(--dk-size) * var(--dk-s));
  border-radius: var(--radius-control);
  color: var(--color-ink);
  background: transparent;
  cursor: pointer;
  transition:
    width var(--duration-base) var(--ease-standard),
    height var(--duration-base) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.dk-btn:hover:not([disabled]) {
  background: color-mix(in oklab, var(--color-muted) 70%, transparent);
}
.dk-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.dk-btn[disabled],
.dk-btn[aria-disabled='true'] {
  opacity: 0.45;
  cursor: not-allowed;
}

.dk-icon {
  width: 55%;
  height: 55%;
}

.dk-badge {
  position: absolute;
  inset-block-start: -0.25rem;
  inset-inline-end: -0.25rem;
  pointer-events: none;
}

.dk-dot {
  position: absolute;
  inset-block-end: -0.375rem;
  inset-inline-start: 50%;
  width: 4px;
  height: 4px;
  margin-inline-start: -2px;
  border-radius: 9999px;
  background: var(--color-primary);
}

:where([data-material='soft']) .dk-btn {
  transition-timing-function: var(--ease-sheet);
}

/* Brutal: no falloff, one jump to a fixed size. */
:where([data-material='brutal']) .dk-btn {
  --dk-s: 1 !important;
  transition: none;
}
:where([data-material='brutal']) .dk-btn:hover:not([disabled]),
:where([data-material='brutal']) .dk-btn:focus-visible {
  --dk-s: 1.25 !important;
}

@media (hover: none), (prefers-reduced-motion: reduce) {
  .dk-btn {
    --dk-s: 1 !important;
    transition: none;
  }
}
</style>
