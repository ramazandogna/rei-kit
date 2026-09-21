<script setup lang="ts" generic="V extends string, M extends 'single' | 'multiple' = 'single'">
import { computed, ref } from 'vue'
import type { Component } from 'vue'

import { horizontalStep } from '../utils/direction'

/**
 * A row of buttons that stay pressed — one at a time, or several at once.
 *
 * Next to `SegmentedControl` on purpose, and not the same thing. A segmented
 * control is a set of radios: there is always exactly one answer, and it is
 * a form value. A toggle group is pressed and unpressed buttons: in `single`
 * mode pressing the pressed one lets go (a filter that can be off), in
 * `multiple` mode any number can be down at once (bold and italic, or three
 * categories out of five).
 *
 * One Tab stop for the whole group, and the arrow keys move between the
 * buttons — the toolbar pattern, so a row of twelve does not cost twelve
 * presses of Tab to get past.
 */
const {
  options,
  label,
  mode = 'single' as M,
  required = false,
  size = 'md',
} = defineProps<{
  options: readonly {
    value: V
    /** Visible text — or, with an icon and `iconOnly`, the accessible name. */
    label: string
    icon?: Component | undefined
    /** Show the icon alone. The label becomes the button's accessible name. */
    iconOnly?: boolean | undefined
    disabled?: boolean | undefined
  }[]
  /** The group's accessible name. */
  label: string
  /** `single`: at most one pressed. `multiple`: any number. */
  mode?: M | undefined
  /** In `single` mode, never let the last pressed button go. */
  required?: boolean | undefined
  size?: 'sm' | 'md' | undefined
}>()

/** The pressed value — or, in `multiple` mode, the pressed values. */
const model = defineModel<M extends 'multiple' ? V[] : V | undefined>()

const buttons = ref<HTMLButtonElement[]>([])

const pressed = computed(() => {
  const value = model.value
  if (Array.isArray(value)) return new Set<V>(value)
  return new Set<V>(value === undefined ? [] : [value as V])
})

function toggle(value: V) {
  if (mode === 'multiple') {
    const next = new Set(pressed.value)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    // In the order of the options, not the order of the presses, so the
    // value reads the same however the reader got there.
    model.value = options
      .map((option) => option.value)
      .filter((v) => next.has(v)) as typeof model.value
    return
  }

  const isPressed = pressed.value.has(value)
  if (isPressed && required) return
  model.value = (isPressed ? undefined : value) as typeof model.value
}

/* The one button Tab lands on: the first pressed one, else the first that
   can be pressed at all. */
const tabStop = computed(() => {
  const enabled = options.filter((option) => !option.disabled)
  return (enabled.find((option) => pressed.value.has(option.value)) ?? enabled[0])?.value
})

function onKeydown(event: KeyboardEvent, index: number) {
  /* Down and up are absolute; left and right are not, and in a
     right-to-left row the left-hand button is the next one. */
  const step =
    { ArrowDown: 1, ArrowUp: -1 }[event.key] ??
    (horizontalStep(event.key, event.currentTarget as Element) || undefined)
  const enabled = buttons.value.filter((button) => !button.disabled)
  let target: HTMLButtonElement | undefined

  if (step !== undefined) {
    const at = enabled.indexOf(buttons.value[index]!)
    target = enabled[(at + step + enabled.length) % enabled.length]
  } else if (event.key === 'Home') target = enabled[0]
  else if (event.key === 'End') target = enabled[enabled.length - 1]
  else return

  event.preventDefault()
  target?.focus()
}
</script>

<template>
  <div class="rk-toggles control" :class="`is-${size}`" role="group" :aria-label="label">
    <button
      v-for="(option, index) in options"
      :key="option.value"
      ref="buttons"
      type="button"
      class="rk-toggle focus-ring"
      :aria-pressed="pressed.has(option.value)"
      :aria-label="option.iconOnly ? option.label : undefined"
      :disabled="option.disabled"
      :tabindex="option.value === tabStop ? 0 : -1"
      @click="toggle(option.value)"
      @keydown="onKeydown($event, index)"
    >
      <component :is="option.icon" v-if="option.icon" class="rk-toggle-icon" aria-hidden="true" />
      <span v-if="!option.iconOnly">{{ option.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.rk-toggles {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 2px;
  border-radius: var(--radius-card);
  padding: 3px;
}

.rk-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-width: 2.25rem;
  height: 2.25rem;
  border-radius: calc(var(--radius-card) - 3px);
  padding: 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink-soft);
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.is-sm .rk-toggle {
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.625rem;
  font-size: 0.8125rem;
}

.rk-toggle:hover:not(:disabled) {
  background: var(--color-muted);
  color: var(--color-ink);
}

.rk-toggle[aria-pressed='true'] {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.rk-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.rk-toggle-icon {
  width: 1rem;
  height: 1rem;
}
</style>
