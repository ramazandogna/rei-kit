<script setup lang="ts" generic="V extends string">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

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
 */
const {
  label,
  options,
  placeholder = '',
  hint = '',
  error = '',
  disabled = false,
  emptyLabel,
} = defineProps<{
  label: string
  options: readonly ComboboxOption<V>[]
  placeholder?: string | undefined
  hint?: string | undefined
  error?: string | undefined
  disabled?: boolean | undefined
  /** Shown when nothing matches. Already translated. */
  emptyLabel: string
}>()

const model = defineModel<V | ''>({ default: '' })

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

const selected = computed(() => options.find((option) => option.value === model.value))

/** What the input shows: the query while typing, the chosen label otherwise. */
const text = computed({
  get: () => (open.value ? query.value : (selected.value?.label ?? '')),
  set: (value: string) => {
    query.value = value
    open.value = true
    highlighted.value = 0
  },
})

const matches = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!open.value || needle === '') return options

  return options.filter((option) => option.label.toLowerCase().includes(needle))
})

const describedBy = computed(() => {
  if (error) return errorId
  if (hint) return hintId
  return undefined
})

function choose(option: ComboboxOption<V> | undefined) {
  if (!option) return

  model.value = option.value
  query.value = ''
  open.value = false
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
    case 'Escape':
      // Close first, clear second. One press to get the list out of the way
      // without losing what was typed.
      event.preventDefault()
      if (open.value) {
        open.value = false
        query.value = ''
      } else {
        model.value = ''
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
  (isOpen) => {
    if (typeof document === 'undefined') return

    if (isOpen) document.addEventListener('pointerdown', onDocumentPointer)
    else document.removeEventListener('pointerdown', onDocumentPointer)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onDocumentPointer)
  }
})
</script>

<template>
  <div ref="root" class="rk-combo">
    <label :for="id" class="rk-combo-label">{{ label }}</label>

    <div class="rk-combo-field">
      <input
        :id="id"
        v-model="text"
        type="text"
        role="combobox"
        class="rk-combo-input"
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
      class="rk-combo-list"
      :aria-label="label"
    >
      <li
        v-for="(option, index) in matches"
        :id="optionId(index)"
        :key="option.value"
        role="option"
        class="rk-combo-option"
        :class="{
          'is-highlighted': index === highlighted,
          'is-selected': option.value === model,
        }"
        :aria-selected="option.value === model"
        @pointerdown.prevent="choose(option)"
        @pointermove="highlighted = index"
      >
        {{ option.label }}
      </li>

      <li v-if="matches.length === 0" class="rk-combo-empty">{{ emptyLabel }}</li>
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

/* 16px, like every other text control here: iOS zooms the viewport when it
   focuses a field under 16px and never zooms back. */
.rk-combo-input {
  width: 100%;
  height: 2.75rem;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-hair);
  background: var(--color-surface);
  padding: 0 2rem 0 0.75rem;
  font-size: 1rem;
  color: var(--color-ink);
}

.rk-combo-input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.rk-combo-input:disabled {
  opacity: 0.5;
}

.rk-combo-toggle {
  position: absolute;
  right: 0.5rem;
  color: var(--color-ink-soft);
  font-size: 0.75rem;
}

.rk-combo-list {
  position: absolute;
  top: calc(100% - 1.25rem);
  z-index: 50;
  max-height: 14rem;
  width: 100%;
  overflow-y: auto;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-hair);
  background: var(--color-surface);
  padding: 0.25rem;
  box-shadow: 0 10px 24px -8px rgb(0 0 0 / 0.25);
}

.rk-combo-option {
  cursor: pointer;
  border-radius: var(--radius-cell);
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
  color: var(--color-ink);
}

.rk-combo-option.is-highlighted {
  background: var(--color-muted);
}

.rk-combo-option.is-selected {
  font-weight: 600;
}

.rk-combo-empty {
  padding: 0.75rem 0.625rem;
  font-size: 0.875rem;
  color: var(--color-ink-soft);
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
