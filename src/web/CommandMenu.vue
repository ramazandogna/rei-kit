<script setup lang="ts" generic="Id extends string">
import { Search } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'
import type { Component } from 'vue'

import { inertOutside } from '../utils/inert'
import { ensureSheetRoot } from '../utils/sheet-root'

export interface CommandItem<Id extends string> {
  id: Id
  /** Already translated. */
  label: string
  /** A line under it, or a shortcut to show on the right. */
  hint?: string | undefined
  icon?: Component | undefined
  /** Extra words that should find it — synonyms, the English name. */
  keywords?: readonly string[] | undefined
}

export interface CommandGroup<Id extends string> {
  /** Already translated. Omitted, the items sit without a heading. */
  label?: string | undefined
  items: readonly CommandItem<Id>[]
}

/**
 * Everything the app can do, behind one shortcut.
 *
 * The pattern people know from their editor: a dialog with a field at the
 * top, results under it, arrows to move and Enter to run. It is the fastest
 * way to reach the twelfth thing in a menu, and the only way that does not
 * cost a menu.
 *
 * The field is a combobox and the results are its listbox, which is what
 * makes it work with a screen reader: focus stays in the field the whole
 * time and `aria-activedescendant` says which result is current, so typing
 * and moving do not fight each other.
 *
 * `hotkey` is the letter pressed with ⌘ or Ctrl — 'k' for the usual one.
 * Matching is over the label and the `keywords` beside it, so "new" can find
 * "Write an entry" in an app whose language is not English.
 */
const {
  groups,
  label,
  placeholder,
  emptyLabel,
  hotkey = undefined,
} = defineProps<{
  groups: readonly CommandGroup<Id>[]
  /** The dialog's accessible name, e.g. "Commands". */
  label: string
  /** The field's placeholder, e.g. "Type a command or search". */
  placeholder: string
  /** Shown when nothing matches, e.g. "Nothing found". */
  emptyLabel: string
  /** The letter that opens it with ⌘ or Ctrl. Unset, the app opens it itself. */
  hotkey?: string | undefined
}>()

const emit = defineEmits<{ select: [id: Id] }>()

/** Open or closed, with `v-model`. */
const open = defineModel<boolean>({ default: false })

const query = ref('')
const active = ref(0)
const id = useId()
const field = useTemplateRef<HTMLInputElement>('field')

const sheetRoot = ensureSheetRoot()
let release: (() => void) | null = null

const matches = computed(() => {
  const needle = query.value.trim().toLowerCase()
  const keep = (item: CommandItem<Id>) =>
    needle === '' ||
    [item.label, ...(item.keywords ?? [])].some((word) => word.toLowerCase().includes(needle))

  return groups
    .map((group) => ({ ...group, items: group.items.filter(keep) }))
    .filter((group) => group.items.length > 0)
})

/** Flattened, because the arrows walk the results and not the groups. */
const flat = computed(() => matches.value.flatMap((group) => group.items))

function choose(item: CommandItem<Id>) {
  emit('select', item.id)
  open.value = false
}

function move(step: number) {
  if (flat.value.length === 0) return
  active.value = (active.value + step + flat.value.length) % flat.value.length

  // `?.()`: scrollIntoView is not everywhere — jsdom has no layout, and a
  // missing scroll must not take the keyboard down with it.
  void nextTick(() => {
    document.getElementById(`${id}-${active.value}`)?.scrollIntoView?.({ block: 'nearest' })
  })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    active.value = 0
  } else if (event.key === 'End') {
    event.preventDefault()
    active.value = Math.max(0, flat.value.length - 1)
  } else if (event.key === 'Enter') {
    const item = flat.value[active.value]
    if (item) {
      event.preventDefault()
      choose(item)
    }
  } else if (event.key === 'Escape') {
    event.preventDefault()
    open.value = false
  }
}

/* The shortcut is global, because a command menu you have to find a button
   for is a menu, not a shortcut. */
function onWindowKeydown(event: KeyboardEvent) {
  if (!hotkey || event.key.toLowerCase() !== hotkey.toLowerCase()) return
  if (!event.metaKey && !event.ctrlKey) return

  event.preventDefault()
  open.value = !open.value
}

if (typeof window !== 'undefined') window.addEventListener('keydown', onWindowKeydown)

/* `immediate`, because a palette can be mounted already open — driven from a
   route, or in a test. Without it that one never takes focus and never holds
   the page: it looks open and behaves like a div. */
watch(
  open,
  async (isOpen) => {
    if (typeof document === 'undefined') return

    if (!isOpen) {
      release?.()
      release = null
      return
    }

    query.value = ''
    active.value = 0
    await nextTick()
    field.value?.focus()
    const panel = field.value?.closest('.rk-command-panel')
    if (panel) release = inertOutside(panel)
  },
  { immediate: true },
)

watch(query, () => (active.value = 0))

onBeforeUnmount(() => {
  release?.()
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onWindowKeydown)
})

const indexOf = (item: CommandItem<Id>) => flat.value.indexOf(item)
</script>

<template>
  <Teleport :to="sheetRoot">
    <Transition name="rk-command">
      <div v-if="open" class="rk-command" @keydown="onKeydown">
        <div class="rk-command-scrim" @click="open = false" />

        <div
          class="rk-command-panel surface-overlay"
          role="dialog"
          aria-modal="true"
          :aria-label="label"
        >
          <div class="rk-command-field">
            <Search class="text-ink-soft size-4 shrink-0" aria-hidden="true" />
            <input
              ref="field"
              v-model="query"
              type="text"
              role="combobox"
              class="rk-command-input"
              autocomplete="off"
              :placeholder="placeholder"
              :aria-label="label"
              :aria-expanded="true"
              :aria-controls="id"
              :aria-activedescendant="flat.length ? `${id}-${active}` : undefined"
            />
          </div>

          <div :id="id" class="rk-command-list" role="listbox" :aria-label="label">
            <template v-for="group in matches" :key="group.label ?? 'items'">
              <p v-if="group.label" class="rk-command-group">{{ group.label }}</p>

              <div
                v-for="item in group.items"
                :id="`${id}-${indexOf(item)}`"
                :key="item.id"
                class="rk-command-item"
                :class="{ 'is-active': indexOf(item) === active }"
                role="option"
                :aria-selected="indexOf(item) === active"
                @click="choose(item)"
                @pointermove="active = indexOf(item)"
              >
                <component
                  :is="item.icon"
                  v-if="item.icon"
                  class="size-4 shrink-0"
                  aria-hidden="true"
                />
                <span class="truncate">{{ item.label }}</span>
                <span v-if="item.hint" class="rk-command-hint">{{ item.hint }}</span>
              </div>
            </template>

            <p v-if="flat.length === 0" class="rk-command-empty">{{ emptyLabel }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rk-command {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  justify-content: center;
  padding: 1rem;
  /* Near the top, not centred: the eye is already up there, and the list
     grows downwards into space rather than pushing itself off both edges. */
  padding-top: min(12vh, 6rem);
}

.rk-command-scrim {
  position: absolute;
  inset: 0;
  background: color-mix(in oklab, var(--color-ink) 45%, transparent);
  backdrop-filter: blur(2px);
}

.rk-command-panel {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 34rem;
  max-height: min(28rem, 70vh);
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-card);
}

.rk-command-field {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  border-bottom: 1px solid var(--surface-border-color);
  padding: 0.875rem 1rem;
}

.rk-command-input {
  min-width: 0;
  flex: 1;
  background: transparent;
  font-size: 1rem;
  color: var(--color-ink);
  outline: none;
}

/* The field takes focus the moment this opens, so a full ring around it
   would be on the whole time. The rule under it turns instead: enough to
   say where the keyboard is, quiet enough to live with. */
.rk-command-field:has(.rk-command-input:focus-visible) {
  border-bottom-color: var(--color-primary);
  box-shadow: inset 0 -1px 0 var(--color-primary);
}

.rk-command-list {
  overflow-y: auto;
  padding: 0.375rem;
}

.rk-command-group {
  padding: 0.5rem 0.625rem 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

.rk-command-item {
  display: flex;
  cursor: pointer;
  align-items: center;
  gap: 0.625rem;
  border-radius: var(--radius-cell);
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
  color: var(--color-ink);
}

.rk-command-item.is-active {
  background: var(--color-muted);
}

.rk-command-hint {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}

.rk-command-empty {
  padding: 1.5rem 0.625rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-ink-soft);
}

.rk-command-enter-active,
.rk-command-leave-active {
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.rk-command-enter-active .rk-command-panel,
.rk-command-leave-active .rk-command-panel {
  transition: transform var(--duration-fast) var(--ease-standard);
}

.rk-command-enter-from,
.rk-command-leave-to {
  opacity: 0;
}

.rk-command-enter-from .rk-command-panel,
.rk-command-leave-to .rk-command-panel {
  transform: translateY(-0.5rem) scale(0.98);
}
</style>
