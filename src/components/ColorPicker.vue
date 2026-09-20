<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import FormField from './FormField.vue'

export interface ColorSwatch {
  /** A hex value, `#rgb` or `#rrggbb`. */
  value: string
  /** What to call it. Already translated. */
  label: string
}

/**
 * A colour, as a hex value.
 *
 * ## A native `input[type="color"]`, painted
 *
 * The same decision as `BaseSlider`: the platform's own picker is better
 * than anything a page can build. It is the one the reader already knows, it
 * has the eyedropper on the desktops that have one, and on a phone it is a
 * full-screen control no web page matches. What it does not have is a look
 * that matches the rest of the kit, so the look is all that is replaced.
 *
 * ## What the kit supplies and what the app does
 *
 * `swatches` are the app's, values **and** names. A kit that shipped a row
 * of colours would be shipping a product decision, and one that shipped
 * unnamed colours would be shipping a set of buttons a screen reader reads
 * as nothing. `PALETTES` is a ready source for an app that wants the kit's
 * own ten.
 *
 * The hex field appears only when `hexLabel` is given, for the same reason
 * `BaseChip` grows a remove button only when it is told what to call it: a
 * control whose name the kit had to invent speaks a language the app does
 * not.
 *
 * ## The value contract
 *
 * In and out as `#rrggbb`, lowercase — the way dates are `YYYY-MM-DD` and
 * times are `HH:mm`. Short hex (`#abc`) and capitals are accepted from a
 * reader typing and normalised on the way out, so an app never has to
 * compare two spellings of the same colour.
 */
const {
  label,
  modelValue,
  swatches = [],
  hexLabel = '',
  hint = '',
  error = '',
  disabled = false,
  labelHidden = false,
} = defineProps<{
  /** Names the control. Already translated. */
  label: string
  /** The colour, as `#rrggbb`. Required: a picker with no colour shows none. */
  modelValue: string
  /** Colours to offer beside the picker. The app's values and names. */
  swatches?: readonly ColorSwatch[] | undefined
  /** Names the hex field. Without it, there is no hex field. */
  hexLabel?: string | undefined
  hint?: string | undefined
  error?: string | undefined
  disabled?: boolean | undefined
  labelHidden?: boolean | undefined
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

/** `#abc` and `#AABBCC` both mean the same colour; this is the spelling. */
function normalise(value: string): string | undefined {
  const text = value.trim().toLowerCase()
  const short = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(text)
  if (short) return `#${short[1]!}${short[1]!}${short[2]!}${short[2]!}${short[3]!}${short[3]!}`

  const long = /^#?([0-9a-f]{6})$/.exec(text)

  return long ? `#${long[1]!}` : undefined
}

/**
 * The value, or nothing when it cannot be read.
 *
 * No fallback colour: a hex written here would be a colour the kit chose,
 * and the kit chooses none — a test enforces that, and it is right to.
 * Unreadable input is handed to the native control as an empty value, and
 * whatever it shows then is the platform's decision rather than ours.
 */
const current = computed(() => normalise(modelValue))

function set(value: string) {
  const next = normalise(value)
  if (next && next !== current.value) emit('update:modelValue', next)
}

/**
 * What the hex field shows while it is being typed in.
 *
 * Not the value: "#ab" is not a colour, and rewriting the field on every
 * keystroke would make it impossible to type the third character. It
 * catches up with the value whenever the value changes from elsewhere — a
 * swatch, the native picker — and commits what it holds on blur and Enter.
 */
const draft = ref(current.value ?? '')
watch(current, (value) => (draft.value = value ?? ''))

function commit() {
  const next = normalise(draft.value)
  if (next) set(next)
  // Nothing recognisable: put back what the value actually is, rather than
  // leaving a field that says one thing while the colour is another.
  else draft.value = current.value ?? ''
}

const chosen = (value: string) => normalise(value) === current.value
</script>

<template>
  <FormField
    :label="label"
    :hint="hint"
    :error="error"
    :label-hidden="labelHidden"
    class="rk-color"
  >
    <template #default="{ id, describedBy, invalid }">
      <div class="rk-color-row">
        <span class="rk-color-well" :style="current ? { '--rk-color': current } : undefined">
          <input
            :id="id"
            type="color"
            class="rk-color-native focus-ring"
            :value="current ?? ''"
            :disabled="disabled"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
            @input="set(($event.target as HTMLInputElement).value)"
          />
        </span>

        <input
          v-if="hexLabel"
          v-model="draft"
          type="text"
          class="rk-color-hex control"
          spellcheck="false"
          autocomplete="off"
          :aria-label="hexLabel"
          :disabled="disabled"
          @blur="commit"
          @keydown.enter.prevent="commit"
        />

        <ul v-if="swatches.length > 0" class="rk-color-swatches">
          <li v-for="swatch in swatches" :key="swatch.value">
            <button
              type="button"
              class="rk-color-swatch focus-ring"
              :class="{ 'is-chosen': chosen(swatch.value) }"
              :style="{ '--rk-color': swatch.value }"
              :aria-label="swatch.label"
              :aria-pressed="chosen(swatch.value)"
              :disabled="disabled"
              @click="set(swatch.value)"
            />
          </li>
        </ul>
      </div>
    </template>
  </FormField>
</template>

<style scoped>
.rk-color-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

/* The well is what is seen; the input inside it is the whole target. A
   native colour input cannot be styled past its swatch in every browser, so
   it is stretched over a box that can be. */
.rk-color-well {
  position: relative;
  display: block;
  width: 2.75rem;
  height: 2.75rem;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-hair);
  background: var(--rk-color);
}

.rk-color-native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  opacity: 0;
}

/* The ring goes on the well, since the input it belongs to is invisible. */
.rk-color-well:has(.rk-color-native:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-color-native:disabled {
  cursor: not-allowed;
}

.rk-color-hex {
  width: 7.5rem;
  height: 2.75rem;
  border-radius: var(--radius-card);
  padding: 0 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  /* 16px like every other text control here: iOS zooms the viewport when it
     focuses a field under 16px and never zooms back. */
  font-size: 1rem;
  color: var(--color-ink);
}

.rk-color-hex:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.rk-color-hex:disabled {
  opacity: 0.5;
}

.rk-color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.rk-color-swatch {
  display: block;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  border: 1px solid var(--color-hair);
  background: var(--rk-color);
  transition: transform var(--duration-fast) var(--ease-standard);
}

.rk-color-swatch:hover:not(:disabled) {
  transform: scale(1.1);
}

/* A ring around the chosen one rather than a tick: a tick has to be dark or
   light to be seen, and the swatch beneath it is whatever the app chose. */
.rk-color-swatch.is-chosen {
  box-shadow:
    0 0 0 2px var(--color-surface),
    0 0 0 4px var(--color-primary);
}

.rk-color-swatch:disabled {
  opacity: 0.5;
}

@media (prefers-reduced-motion: reduce) {
  .rk-color-swatch {
    transition: none;
  }

  .rk-color-swatch:hover:not(:disabled) {
    transform: none;
  }
}
</style>
