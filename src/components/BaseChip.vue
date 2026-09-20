<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { Component } from 'vue'

/**
 * A short label with, when it is one of a set someone assembled, a way to
 * take it off: a filter, a recipient, a tag.
 *
 * Next to `BaseBadge`, which is a standing label and never a control. A chip
 * is removable, or selectable, or both. If it neither removes nor selects,
 * reach for the badge.
 *
 * `removeLabel` is required when it can be removed, because "×" alone is a
 * button a screen reader reads as "times".
 *
 * A chip that both selects and removes is two buttons side by side, never
 * one inside the other: a button nested in a button is not a control a
 * browser or a screen reader can make sense of.
 */
const {
  label,
  icon = undefined,
  tone = 'neutral',
  removeLabel = undefined,
  selected = undefined,
  disabled = false,
} = defineProps<{
  /** The text. Already translated. */
  label: string
  icon?: Component | undefined
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | undefined
  /** Given, the chip grows a remove button. Its accessible name. */
  removeLabel?: string | undefined
  /** Given, the whole chip is a toggle and this is its state. */
  selected?: boolean | undefined
  disabled?: boolean | undefined
}>()

const emit = defineEmits<{ remove: []; select: [] }>()
</script>

<template>
  <span
    class="rk-chip"
    :class="[`tone-${tone}`, { 'is-selected': selected, 'is-disabled': disabled }]"
  >
    <component
      :is="selected === undefined ? 'span' : 'button'"
      :type="selected === undefined ? undefined : 'button'"
      class="rk-chip-body"
      :class="{ 'focus-ring is-button': selected !== undefined }"
      :aria-pressed="selected"
      :disabled="selected === undefined ? undefined : disabled"
      @click="selected === undefined ? undefined : emit('select')"
    >
      <component :is="icon" v-if="icon" class="size-3.5 shrink-0" aria-hidden="true" />
      <span class="truncate">{{ label }}</span>
    </component>

    <button
      v-if="removeLabel"
      type="button"
      class="rk-chip-remove focus-ring"
      :aria-label="removeLabel"
      :disabled="disabled"
      @click="emit('remove')"
    >
      <X class="size-3" aria-hidden="true" />
    </button>
  </span>
</template>

<style scoped>
.rk-chip {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  padding: 0.1875rem 0.5rem 0.1875rem 0.625rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: var(--color-muted);
  color: var(--color-ink);
}

.rk-chip-body {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  color: inherit;
}

.rk-chip-body.is-button {
  cursor: pointer;
}

.rk-chip.is-selected {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.rk-chip.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* The tones tint rather than fill: a row of chips in five solid colours is a
   row where nothing stands out. The selected one fills, and that is the point
   of it. */
.rk-chip.tone-primary {
  background: color-mix(in oklab, var(--color-primary) 12%, transparent);
  border-color: color-mix(in oklab, var(--color-primary) 25%, transparent);
  color: var(--color-primary);
}

.rk-chip.tone-success {
  background: color-mix(in oklab, var(--color-positive) 14%, transparent);
  border-color: color-mix(in oklab, var(--color-positive) 28%, transparent);
  color: color-mix(in oklab, var(--color-positive) 80%, var(--color-ink));
}

.rk-chip.tone-warning {
  background: color-mix(in oklab, var(--color-warning) 16%, transparent);
  border-color: color-mix(in oklab, var(--color-warning) 30%, transparent);
  color: color-mix(in oklab, var(--color-warning) 75%, var(--color-ink));
}

.rk-chip.tone-danger {
  background: color-mix(in oklab, var(--color-negative) 12%, transparent);
  border-color: color-mix(in oklab, var(--color-negative) 26%, transparent);
  color: var(--color-negative);
}

.rk-chip-remove {
  display: grid;
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  color: currentColor;
  opacity: 0.7;
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.rk-chip-remove:hover {
  opacity: 1;
  background: color-mix(in oklab, currentColor 15%, transparent);
}
</style>
