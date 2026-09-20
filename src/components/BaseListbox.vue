<script setup lang="ts" generic="V extends string, M extends 'single' | 'multiple' = 'single'">
import { Check } from 'lucide-vue-next'
import { computed, ref, useId } from 'vue'

import { useBoundValue } from '../composables/use-bound-value'

export interface ListboxOption<V extends string> {
  value: V
  /** Already translated. */
  label: string
  /** A line under the label. */
  description?: string | undefined
  disabled?: boolean | undefined
}

/**
 * A list you choose from, open on the page.
 *
 * Between `BaseRadioGroup` and `BaseSelect`: a radio group is a handful of
 * options that are all visible and all equal; a select opens the platform's
 * own picker; this is a scrollable list of many, choosing one or several,
 * that stays on screen — a list of accounts, of tags, of files to act on.
 *
 * One Tab stop. The list itself takes focus and `aria-activedescendant`
 * says which option is current, so the arrows move without thirty stops in
 * the tab order. Typing a letter jumps to the next option that starts with
 * it, which is how every native list has always worked and the first thing
 * people try.
 *
 * In `single` mode the selection follows the arrows, because that is what a
 * listbox does; in `multiple` mode Space and Enter toggle the current one.
 */
const {
  modelValue = undefined,
  options,
  label,
  mode = 'single' as M,
  height = '14rem',
} = defineProps<{
  /** The chosen option, or options, with `v-model`. */
  modelValue?: Value | undefined
  options: readonly ListboxOption<V>[]
  /** The list's accessible name. */
  label: string
  /** One option, or any number of them. */
  mode?: M | undefined
  /** How tall before it scrolls. Any CSS length. */
  height?: string | undefined
}>()

/* Multiple always hands back an array — toggling one produces a list, never
   nothing — so only the single value can be undefined. */
type Value = M extends 'multiple' ? V[] : V | undefined

/* Declared by hand rather than with defineModel, which cannot both accept
   `undefined` and promise never to emit it. See `use-bound-value.ts`. */
const emit = defineEmits<{ 'update:modelValue': [value: Value] }>()
const model = useBoundValue<Value>(
  () => modelValue as Value | undefined,
  (value) => emit('update:modelValue', value),
)

const id = useId()
const active = ref(0)

let typed = ''
let typedAt = 0

const chosen = computed(() => {
  const value = model.value
  if (Array.isArray(value)) return new Set<V>(value)

  return new Set<V>(value === undefined ? [] : [value as V])
})

function select(option: ListboxOption<V>) {
  if (option.disabled) return

  if (mode === 'multiple') {
    const next = new Set(chosen.value)
    if (next.has(option.value)) next.delete(option.value)
    else next.add(option.value)

    // In the order of the options, so the value reads the same however the
    // reader got there.
    model.value = options
      .map((one) => one.value)
      .filter((value) => next.has(value)) as typeof model.value
    return
  }

  model.value = option.value as typeof model.value
}

function moveTo(index: number) {
  if (options.length === 0) return

  active.value = Math.max(0, Math.min(options.length - 1, index))
  const option = options[active.value]

  // Single: the selection follows the focus, which is what a listbox does.
  if (mode === 'single' && option && !option.disabled) select(option)

  document.getElementById(`${id}-${active.value}`)?.scrollIntoView?.({ block: 'nearest' })
}

/** The next option after the current one that starts with what was typed. */
function jumpTo(letter: string) {
  const now = Date.now()
  typed = now - typedAt > 700 ? letter : typed + letter
  typedAt = now

  const from = typed.length === 1 ? active.value + 1 : active.value
  const order = [...options.slice(from), ...options.slice(0, from)]
  const found = order.find(
    (option) => !option.disabled && option.label.toLowerCase().startsWith(typed.toLowerCase()),
  )

  if (found) moveTo(options.indexOf(found))
}

function onKeydown(event: KeyboardEvent) {
  const moves: Record<string, number> = {
    ArrowDown: active.value + 1,
    ArrowUp: active.value - 1,
    Home: 0,
    End: options.length - 1,
  }

  if (event.key in moves) {
    event.preventDefault()
    moveTo(moves[event.key]!)
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    const option = options[active.value]
    if (!option) return
    event.preventDefault()
    select(option)
    return
  }

  // A single printable character: the typeahead every native list has.
  if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
    jumpTo(event.key)
  }
}
</script>

<template>
  <div
    class="rk-listbox control"
    :style="{ maxHeight: height }"
    role="listbox"
    tabindex="0"
    :aria-label="label"
    :aria-multiselectable="mode === 'multiple' ? true : undefined"
    :aria-activedescendant="options.length ? `${id}-${active}` : undefined"
    @keydown="onKeydown"
  >
    <div
      v-for="(option, index) in options"
      :id="`${id}-${index}`"
      :key="option.value"
      class="rk-listbox-option"
      :class="{
        'is-active': index === active,
        'is-chosen': chosen.has(option.value),
        'is-disabled': option.disabled,
      }"
      role="option"
      :aria-selected="chosen.has(option.value)"
      :aria-disabled="option.disabled"
      @click="((active = index), select(option))"
    >
      <span class="min-w-0 flex-1">
        <span class="rk-listbox-label">{{ option.label }}</span>
        <span v-if="option.description" class="rk-listbox-description">{{
          option.description
        }}</span>
      </span>

      <Check v-if="chosen.has(option.value)" class="size-4 shrink-0" aria-hidden="true" />
    </div>

    <p v-if="options.length === 0" class="rk-listbox-empty" />
  </div>
</template>

<style scoped>
.rk-listbox {
  overflow-y: auto;
  border-radius: var(--radius-card);
  padding: 0.25rem;
}

.rk-listbox:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.rk-listbox-option {
  display: flex;
  cursor: pointer;
  align-items: center;
  gap: 0.625rem;
  border-radius: var(--radius-cell);
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
  color: var(--color-ink);
}

/* The current row shows only while the list has focus. A list that is not
   being used has no "current" row, and a highlight left behind on one reads
   as a selection — which is exactly what it is not. */
.rk-listbox:focus-within .rk-listbox-option.is-active {
  background: var(--color-muted);
}

.rk-listbox-option.is-chosen {
  color: var(--color-primary);
  font-weight: 500;
}

/* Chosen is the tick and the tint, and it holds whether the list is in use
   or not: the current option and the chosen one are different things. */
.rk-listbox-option.is-chosen {
  background: color-mix(in oklab, var(--color-primary) 10%, transparent);
}

.rk-listbox:focus-within .rk-listbox-option.is-chosen.is-active {
  background: color-mix(in oklab, var(--color-primary) 20%, transparent);
}

.rk-listbox-option.is-disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.rk-listbox-label {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rk-listbox-description {
  display: block;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}

.rk-listbox-empty {
  padding: 1rem;
}
</style>
