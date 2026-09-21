<script setup lang="ts" generic="V extends string, M extends 'single' | 'multiple' = 'single'">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

import { useBoundValue } from '../composables/use-bound-value'
import { useAnchoredPanel } from '../composables/use-anchored-panel'
import { useVirtualWindow } from '../composables/use-virtual-window'
import BaseSkeleton from './BaseSkeleton.vue'

export interface ComboboxOption<V extends string> {
  value: V
  /** Already translated. */
  label: string
}

/**
 * A field you type into to narrow a list, then choose from it.
 *
 * ## When to reach for this instead of `BaseSelect`
 *
 * A native select is better up to a few dozen options: it uses the platform's
 * own picker, which on a phone is a wheel the reader already knows and which no
 * web control can match. This is for when the list is long enough that reading
 * it is the problem — a country, a currency, a course — and typing three
 * letters beats scrolling.
 *
 * ## What the pattern requires
 *
 * The ARIA combobox is prescribed down to which element owns which attribute,
 * and hand-written ones get the same three things wrong:
 *
 * - **`aria-activedescendant`, not focus.** Focus stays in the text field while
 *   the arrows move a highlight through the list. Moving real focus into the
 *   list means typing stops working, which is the entire point of the control.
 * - **`aria-expanded` on the input**, not the wrapper. A screen reader looks for
 *   it on the element with `role="combobox"`.
 * - **Escape closes before it clears.** One press shuts the list, a second
 *   empties the field. Clearing on the first press throws away what was typed
 *   when somebody only wanted the list out of the way.
 *
 * The highlighted option is scrolled into view, because a highlight below the
 * fold is a selection nobody can see.
 *
 * ## A list that comes from a server
 *
 * `@search` is the typed text, debounced — the kit holds the timer so every
 * app does not write the same one, and it is cancelled on unmount so a
 * request is never fired at a component that has gone. Set `filter="none"`
 * alongside it: when the server has already narrowed the list, narrowing it
 * again here hides rows that matched for a reason the client cannot see.
 *
 * `loading` marks the list `aria-busy` while the answer is on its way, which
 * is the part that is heard. `loadingLabel` is the part that is read, and it
 * is optional for the same reason every other visible string here is a prop:
 * the kit has no language of its own.
 *
 * ## More than one answer
 *
 * `mode="multiple"` keeps the chosen ones as chips in the field, and choosing
 * an option again takes it back off. Backspace on an empty field removes the
 * last one. The chips carry a remove button only when `removeLabel` is given,
 * because a button whose name the kit had to invent would be a button that
 * speaks a language the app does not.
 *
 * ## A list too long to render
 *
 * Past `virtualizeAfter` options only the rows near the viewport are in the
 * DOM, with a spacer above and below standing in for the rest. Every row
 * still states `aria-setsize` and `aria-posinset`, so what a screen reader
 * hears is the whole list — "3 of 4000" — rather than the window.
 */
const {
  modelValue = undefined,
  label,
  options,
  placeholder = '',
  hint = '',
  error = '',
  disabled = false,
  emptyLabel,
  mode = 'single' as M,
  removeLabel = undefined,
  loading = false,
  loadingLabel = '',
  filter = 'local',
  debounce = 200,
  virtualizeAfter = 150,
  rowHeight = 36,
} = defineProps<{
  /** The chosen value, or values in `multiple` mode, with `v-model`. */
  modelValue?: Value | undefined
  label: string
  options: readonly ComboboxOption<V>[]
  placeholder?: string | undefined
  hint?: string | undefined
  error?: string | undefined
  disabled?: boolean | undefined
  /** Shown when nothing matches. Already translated. */
  emptyLabel: string
  /** `multiple` keeps the chosen ones as chips in the field. */
  mode?: M | undefined
  /** Names a chip's remove button. Without it, chips carry no button. */
  removeLabel?: ((label: string) => string) | undefined
  /** Marks the list busy while an answer is on its way. */
  loading?: boolean | undefined
  /** Read while `loading`. Already translated. */
  loadingLabel?: string | undefined
  /** `none` when the server has already narrowed the list. */
  filter?: 'local' | 'none' | undefined
  /** How long typing settles before `search`, in milliseconds. */
  debounce?: number | undefined
  /** Past this many options, only the rows near the viewport are rendered. */
  virtualizeAfter?: number | undefined
  /** A row's height in pixels; the virtual window is measured in these. */
  rowHeight?: number | undefined
}>()

/** Multiple always hands back an array; a single choice is the value or ''. */
type Value = M extends 'multiple' ? V[] : V | ''

/* Declared by hand rather than with defineModel, which cannot both accept
   `undefined` and promise never to emit it -- and an app whose model is
   `ref('')` is exactly the one that breaks. See `use-bound-value.ts`. */
const emit = defineEmits<{
  'update:modelValue': [value: Value]
  /** The typed text, once it has settled. For a list that lives on a server. */
  search: [query: string]
}>()

const model = useBoundValue<Value>(
  () => modelValue as Value | undefined,
  (value) => emit('update:modelValue', value),
)

const multiple = computed(() => mode === 'multiple')

/** The chosen values, however many there are, as a plain array. */
const chosen = computed<V[]>(() => {
  const value = model.value as V | V[] | '' | undefined
  if (Array.isArray(value)) return value
  return value === undefined || value === '' ? [] : [value]
})

const chosenOptions = computed(() =>
  chosen.value.map(
    (value) => options.find((option) => option.value === value) ?? { value, label: value },
  ),
)

const id = useId()
const listId = `${id}-list`
const hintId = `${id}-hint`
const errorId = `${id}-error`
const optionId = (index: number) => `${id}-opt-${index}`

const open = ref(false)
const query = ref('')
const highlighted = ref(0)
const root = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)

/* A field near the bottom of a form is where a combobox usually is — the
   last question before the button — so the list opens above it when that
   is where the room is. */
const { placed, shift } = useAnchoredPanel({ root, panel: list, open })

const single = computed(() => (multiple.value ? undefined : chosenOptions.value[0]))

/**
 * What the input shows.
 *
 * In multiple mode it is always the query: the answers are the chips beside
 * it, and writing one of them into the field would mean deleting it to search
 * for the next.
 */
const text = computed({
  get: () => (multiple.value || open.value ? query.value : (single.value?.label ?? '')),
  set: (value: string) => {
    query.value = value
    open.value = true
    highlighted.value = 0
    announce(value)
  },
})

const matches = computed(() => {
  const needle = query.value.trim().toLowerCase()
  // `none` is for a list the server has already narrowed: filtering again
  // here would hide rows that matched for a reason this side cannot see.
  if (filter === 'none' || !open.value || needle === '') return options

  return options.filter((option) => option.label.toLowerCase().includes(needle))
})

const describedBy = computed(() => {
  if (error) return errorId
  if (hint) return hintId
  return undefined
})

/* ─── A list that comes from a server ─── */

let timer: ReturnType<typeof setTimeout> | undefined

function announce(value: string) {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => emit('search', value.trim()), debounce)
}

/* ─── Virtualisation ─── */

/* The windowing arithmetic lives in `useVirtualWindow`, which `VirtualList`
   shares: one copy, so the padding that keeps the scrollbar honest about
   the length of the list cannot drift between them. */
const {
  active: virtual,
  window: window_,
  padTop,
  padBottom,
  viewportHeight: viewport,
  onScroll,
} = useVirtualWindow({
  count: computed(() => matches.value.length),
  rowHeight: computed(() => rowHeight),
  threshold: computed(() => virtualizeAfter),
})

/** How tall the list box is; read once it is open, and this until then. */
viewport.value = 224

const rows = computed(() =>
  matches.value.slice(window_.value.start, window_.value.end).map((option, index) => ({
    option,
    /** The row's place in the whole list, not in the window. */
    index: window_.value.start + index,
  })),
)

/* ─── Choosing ─── */

function choose(option: ComboboxOption<V> | undefined) {
  if (!option) return

  if (multiple.value) {
    const next = chosen.value.includes(option.value)
      ? chosen.value.filter((one) => one !== option.value)
      : [...chosen.value, option.value]

    model.value = next as Value
    // The field stays open: choosing several means choosing again.
    query.value = ''
    return
  }

  model.value = option.value as Value
  query.value = ''
  open.value = false
}

function remove(value: V) {
  if (!multiple.value) return
  model.value = chosen.value.filter((one) => one !== value) as Value
}

function move(delta: number) {
  const count = matches.value.length
  if (count === 0) return

  open.value = true
  highlighted.value = (highlighted.value + delta + count) % count
  void scrollHighlightIntoView()
}

async function scrollHighlightIntoView() {
  await nextTick()

  // A virtual row may not be in the DOM at all, so the scroller is moved by
  // arithmetic rather than by asking an element that is not there.
  if (virtual.value && list.value) {
    const top = highlighted.value * rowHeight
    const bottom = top + rowHeight
    if (top < list.value.scrollTop) list.value.scrollTop = top
    else if (bottom > list.value.scrollTop + viewport.value) {
      list.value.scrollTop = bottom - viewport.value
    }
    return
  }

  // By position rather than by selector: `CSS.escape` does not exist in jsdom
  // or on a server, and the rows are the only children here -- the spacers
  // are rendered only in the virtual case, which returned above.
  const el = list.value?.children[highlighted.value] as HTMLElement | undefined
  // A highlight below the fold is a selection nobody can see. Feature-detected
  // rather than called: `scrollIntoView` is missing in jsdom and in more than
  // one embedded webview, and a keyboard that throws is worse than a list that
  // does not scroll.
  el?.scrollIntoView?.({ block: 'nearest' })
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      break
    case 'Enter':
      if (!open.value) return
      event.preventDefault()
      choose(matches.value[highlighted.value])
      break
    case 'Backspace':
      // Only with nothing to delete in the field, or it would eat a letter
      // and a chip with the same press.
      if (multiple.value && query.value === '' && chosen.value.length > 0) {
        event.preventDefault()
        remove(chosen.value[chosen.value.length - 1]!)
      }
      break
    case 'Escape':
      // Close first, clear second. One press to get the list out of the way
      // without losing what was typed.
      event.preventDefault()
      if (open.value) {
        open.value = false
        query.value = ''
      } else if (!multiple.value) {
        model.value = '' as Value
      }
      break
    case 'Tab':
      open.value = false
      break
  }
}

function onDocumentPointer(event: Event) {
  if (root.value && !root.value.contains(event.target as Node)) {
    open.value = false
    query.value = ''
  }
}

watch(
  open,
  async (isOpen) => {
    if (typeof document === 'undefined') return

    if (isOpen) {
      document.addEventListener('pointerdown', onDocumentPointer)
      await nextTick()
      // Measured, not assumed: the height is a CSS value an app may change.
      if (list.value) viewport.value = list.value.clientHeight || viewport.value
    } else document.removeEventListener('pointerdown', onDocumentPointer)
  },
  { immediate: true },
)

/* A shorter list can leave the highlight past its end. */
watch(matches, () => {
  if (highlighted.value >= matches.value.length) highlighted.value = 0
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onDocumentPointer)
  }
})
</script>

<template>
  <div ref="root" class="rk-combo">
    <label :for="id" class="rk-combo-label">{{ label }}</label>

    <!-- With chips the whole box is the control, so it is the box that
         carries the `control` surface and the focus ring; the input inside
         it is plain text. Leaving `control` on the input drew a second
         field inside the first. -->
    <div class="rk-combo-field" :class="multiple ? 'is-multiple control' : ''">
      <span
        v-for="option in multiple ? chosenOptions : []"
        :key="option.value"
        class="rk-combo-chip"
      >
        <span>{{ option.label }}</span>
        <button
          v-if="removeLabel"
          type="button"
          class="rk-combo-chip-x focus-ring"
          :aria-label="removeLabel(option.label)"
          :disabled="disabled"
          @click="remove(option.value)"
        >
          ×
        </button>
      </span>

      <input
        :id="id"
        v-model="text"
        type="text"
        role="combobox"
        class="rk-combo-input"
        :class="{ control: !multiple }"
        autocomplete="off"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-expanded="open"
        :aria-controls="listId"
        aria-autocomplete="list"
        :aria-activedescendant="open ? optionId(highlighted) : undefined"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy"
        @keydown="onKeydown"
        @focus="open = true"
      />

      <button
        type="button"
        class="rk-combo-toggle"
        tabindex="-1"
        aria-hidden="true"
        :disabled="disabled"
        @click="open = !open"
      >
        ▾
      </button>
    </div>

    <ul
      v-show="open"
      :id="listId"
      ref="list"
      role="listbox"
      class="rk-combo-list surface-overlay"
      :class="`is-${placed}`"
      :style="shift ? { '--rk-combo-shift': `${shift}px` } : undefined"
      :aria-label="label"
      :aria-multiselectable="multiple ? true : undefined"
      :aria-busy="loading ? true : undefined"
      @scroll="onScroll"
    >
      <li v-if="padTop > 0" :style="{ height: `${padTop}px` }" aria-hidden="true" />

      <li
        v-for="row in rows"
        :id="optionId(row.index)"
        :key="row.option.value"
        role="option"
        class="rk-combo-option"
        :class="{
          'is-highlighted': row.index === highlighted,
          'is-selected': chosen.includes(row.option.value),
        }"
        :style="virtual ? { height: `${rowHeight}px` } : undefined"
        :aria-selected="chosen.includes(row.option.value)"
        :aria-setsize="matches.length"
        :aria-posinset="row.index + 1"
        @pointerdown.prevent="choose(row.option)"
        @pointermove="highlighted = row.index"
      >
        {{ row.option.label }}
      </li>

      <li v-if="padBottom > 0" :style="{ height: `${padBottom}px` }" aria-hidden="true" />

      <!-- Rows in the shape of the rows that are coming, rather than a
           spinner: the list keeps its height, so the page under it does not
           jump when the answer lands. The list says `aria-busy`, which is
           what is heard; `loadingLabel` is what is read, when given. -->
      <li v-if="loading" class="rk-combo-status">
        <span v-if="loadingLabel">{{ loadingLabel }}</span>
        <span class="rk-combo-status-rows" aria-hidden="true">
          <BaseSkeleton v-for="n in 3" :key="n" shape="text" height="0.75rem" />
        </span>
      </li>

      <li v-else-if="matches.length === 0" class="rk-combo-empty">{{ emptyLabel }}</li>
    </ul>

    <p v-if="error" :id="errorId" class="rk-combo-error">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="rk-combo-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.rk-combo {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.rk-combo-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
}

.rk-combo-field {
  position: relative;
  display: flex;
  align-items: center;
}

/* With chips the field is a box that wraps, and the input is one item in it
   that grows into whatever is left. */
.rk-combo-field.is-multiple {
  flex-wrap: wrap;
  gap: 0.25rem;
  min-height: 2.75rem;
  border-radius: var(--radius-card);
  padding: 0.3125rem 2rem 0.3125rem 0.375rem;
}

.rk-combo-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 9999px;
  background: var(--color-muted);
  padding: 0.125rem 0.25rem 0.125rem 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-ink);
}

.rk-combo-chip-x {
  display: grid;
  width: 1.125rem;
  height: 1.125rem;
  place-items: center;
  border-radius: 9999px;
  color: var(--color-ink-soft);
  line-height: 1;
}

.rk-combo-chip-x:hover {
  color: var(--color-ink);
}

/* 16px, like every other text control here: iOS zooms the viewport when it
   focuses a field under 16px and never zooms back. */
.rk-combo-input {
  width: 100%;
  height: 2.75rem;
  border-radius: var(--radius-card);
  padding: 0 2rem 0 0.75rem;
  font-size: 1rem;
  color: var(--color-ink);
}

.is-multiple .rk-combo-input {
  width: auto;
  height: 1.75rem;
  min-width: 6rem;
  flex: 1;
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.rk-combo-input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.is-multiple .rk-combo-input:focus-visible {
  outline: none;
}

/* The ring belongs to the whole box once the box is the control. */
.rk-combo-field.is-multiple:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.rk-combo-input:disabled {
  opacity: 0.5;
}

.rk-combo-toggle {
  position: absolute;
  inset-inline-end: 0.5rem;
  color: var(--color-ink-soft);
  font-size: 0.75rem;
}

.rk-combo-list {
  position: absolute;
  z-index: 50;
  transform: translateX(var(--rk-combo-shift, 0px));
  max-height: 14rem;
  width: 100%;
  overflow-y: auto;
  border-radius: var(--radius-card);
  padding: 0.25rem;
}

.rk-combo-list.is-bottom {
  top: calc(100% - 1.25rem);
}

.rk-combo-list.is-top {
  bottom: calc(100% - 1.25rem);
}

.rk-combo-option {
  cursor: pointer;
  border-radius: var(--radius-cell);
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
  color: var(--color-ink);
}

/* A virtual row's height is the arithmetic the spacers are built on, so it
   cannot be left to the text inside it. */
.rk-combo-option[style] {
  display: flex;
  align-items: center;
  padding-block: 0;
}

.rk-combo-option.is-highlighted {
  background: var(--color-muted);
}

.rk-combo-option.is-selected {
  font-weight: 600;
}

.rk-combo-empty,
.rk-combo-status {
  padding: 0.75rem 0.625rem;
  font-size: 0.875rem;
  color: var(--color-ink-soft);
}

.rk-combo-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rk-combo-status-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rk-combo-error {
  font-size: 0.75rem;
  color: var(--color-negative);
}

.rk-combo-hint {
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}
</style>
