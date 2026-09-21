<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'

import { horizontalStep } from '../utils/direction'

/**
 * A row of controls that belong together: a formatting bar, a row of view
 * switches, the actions over a table.
 *
 * One Tab stop for the lot. The arrows move between the controls inside it,
 * Home and End jump to the ends — the toolbar pattern, and the reason to
 * use it is arithmetic: twelve buttons in the tab order cost twelve presses
 * to get past on the way to the thing under them.
 *
 * The controls are yours: anything focusable inside is picked up, so a
 * toolbar can mix the kit's buttons, a `ToggleGroup` and a separator
 * without declaring any of them as data.
 */
const { label, orientation = 'horizontal' } = defineProps<{
  /** The toolbar's accessible name, e.g. "Formatting". */
  label: string
  orientation?: 'horizontal' | 'vertical' | undefined
}>()

defineSlots<{ default: () => unknown }>()

const root = useTemplateRef<HTMLElement>('root')
const at = ref(0)

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select, textarea'

function controls(): HTMLElement[] {
  return Array.from(root.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
}

/* Exactly one control is in the tab order, and which one is remembered:
   coming back to a toolbar puts you where you left it. */
function applyRoving() {
  const list = controls()
  at.value = Math.min(at.value, Math.max(0, list.length - 1))
  list.forEach((control, index) => {
    control.tabIndex = index === at.value ? 0 : -1
  })
}

function focusAt(index: number) {
  const list = controls()
  if (list.length === 0) return

  at.value = (index + list.length) % list.length
  applyRoving()
  list[at.value]?.focus()
}

function onKeydown(event: KeyboardEvent) {
  const list = controls()
  const current = list.indexOf(document.activeElement as HTMLElement)

  /* A vertical toolbar's arrows are up and down, which mean the same thing
     in every writing direction. A horizontal one's do not. */
  const step =
    orientation === 'horizontal'
      ? horizontalStep(event.key, event.currentTarget as Element)
      : ({ ArrowDown: 1, ArrowUp: -1 }[event.key] ?? 0)

  if (step !== 0) {
    event.preventDefault()
    focusAt(current + step)
  } else if (event.key === 'Home') {
    event.preventDefault()
    focusAt(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    focusAt(list.length - 1)
  }
}

function onFocusin(event: FocusEvent) {
  const index = controls().indexOf(event.target as HTMLElement)
  if (index >= 0) {
    at.value = index
    applyRoving()
  }
}

onMounted(applyRoving)
</script>

<template>
  <div
    ref="root"
    class="rk-toolbar"
    :class="`is-${orientation}`"
    role="toolbar"
    :aria-label="label"
    :aria-orientation="orientation"
    @keydown="onKeydown"
    @focusin="onFocusin"
  >
    <slot />
  </div>
</template>

<style scoped>
.rk-toolbar {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.rk-toolbar.is-vertical {
  flex-direction: column;
  align-items: stretch;
}
</style>
