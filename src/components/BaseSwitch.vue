<script setup lang="ts">
import { computed, useId } from 'vue'

/**
 * A setting that takes effect the moment it is touched.
 *
 * Not `BaseCheckbox` with a rounder skin, and the difference is not visual. A
 * checkbox states an intention that something else commits — a form is
 * submitted, a dialog is confirmed. A switch *is* the commit: there is no Save
 * after it, which is why it belongs in a settings row and why a form full of
 * them is usually a form of checkboxes drawn wrong.
 *
 * `role="switch"` rather than a styled checkbox, because a screen reader
 * announces "on"/"off" for a switch and "checked"/"unchecked" for a checkbox,
 * and those are different sentences about different things.
 *
 * The whole row is the label, so the words are part of the hit target. On a
 * phone that is the difference between a control and a coin toss.
 */
const {
  label,
  hint = '',
  disabled = false,
  labelHidden = false,
} = defineProps<{
  label: string
  hint?: string | undefined
  disabled?: boolean | undefined
  /** For a switch inside a row that already names it — it keeps its accessible name. */
  labelHidden?: boolean | undefined
}>()

const model = defineModel<boolean>({ default: false })

const id = useId()
const hintId = `${id}-hint`

const describedBy = computed(() => (hint ? hintId : undefined))

function toggle() {
  if (!disabled) model.value = !model.value
}
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <span v-if="!labelHidden" class="min-w-0">
      <span :id="id" class="text-ink block text-sm">{{ label }}</span>
      <span v-if="hint" :id="hintId" class="text-ink-soft mt-0.5 block text-xs">{{ hint }}</span>
    </span>

    <!--
      A button, not an <input type="checkbox">. The native control cannot carry
      `role="switch"` in every engine that matters, and the track has to be
      painted anyway; what a native input would have bought is the label
      association, and `aria-labelledby` buys that outright.
    -->
    <button
      type="button"
      role="switch"
      class="rk-switch"
      :class="{ 'is-on': model }"
      :aria-checked="model"
      :aria-labelledby="labelHidden ? undefined : id"
      :aria-label="labelHidden ? label : undefined"
      :aria-describedby="describedBy"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="rk-switch-knob" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.rk-switch {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  width: 2.75rem;
  height: 1.625rem;
  border-radius: 9999px;
  background: var(--color-hair);
  transition: background-color 180ms ease;
}

.rk-switch.is-on {
  background: var(--color-primary);
}

.rk-switch:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-switch:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.rk-switch-knob {
  position: absolute;
  left: 0.1875rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.25);
  transition: transform 180ms cubic-bezier(0.32, 0.72, 0, 1);
}

.rk-switch.is-on .rk-switch-knob {
  transform: translateX(1.125rem);
}

@media (prefers-reduced-motion: reduce) {
  .rk-switch,
  .rk-switch-knob {
    transition: none;
  }
}
</style>
