<script setup lang="ts" generic="K extends string, M extends 'single' | 'multiple' = 'single'">
import { ChevronRight } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import { useBoundValue } from '../composables/use-bound-value'
import type { Component } from 'vue'

export interface TreeNode<K extends string> {
  key: K
  /** Already translated. */
  label: string
  icon?: Component | undefined
  disabled?: boolean | undefined
  /** Omitted or empty, it is a leaf. */
  children?: readonly TreeNode<K>[] | undefined
}

/**
 * A tree of things that contain things: folders, a category list, a table of
 * contents.
 *
 * The keyboard is the tree pattern, and it is the whole reason to reach for
 * this rather than nested lists: up and down move through what is on screen,
 * right opens a branch and then steps into it, left closes it and then steps
 * out to its parent, Home and End jump to the ends. One Tab stop for the
 * whole tree.
 *
 * Levels are stated with `aria-level`, `aria-setsize` and `aria-posinset`,
 * so a screen reader can say "level 2, 3 of 7" — the only way somebody
 * listening knows where they are in a shape they cannot see.
 *
 * What is open and what is chosen are both the app's: `v-model:expanded`
 * and `v-model`, so a tree can be restored from a URL or a saved state.
 */
const {
  modelValue = undefined,
  nodes,
  label,
  mode = 'single' as M,
} = defineProps<{
  /** The chosen key, or keys in `multiple` mode, with `v-model`. */
  modelValue?: Value | undefined
  nodes: readonly TreeNode<K>[]
  /** The tree's accessible name. */
  label: string
  /** `multiple` lets several be chosen, each with its own tick. */
  mode?: M | undefined
}>()

/* Multiple always hands back an array; only a single choice can be nothing. */
type Value = M extends 'multiple' ? K[] : K | undefined

const emit = defineEmits<{ 'update:modelValue': [value: Value] }>()
const model = useBoundValue<Value>(
  () => modelValue as Value | undefined,
  (value) => emit('update:modelValue', value),
)
/** Which branches are open. */
const expanded = defineModel<K[]>('expanded', { default: () => [] })

interface Row {
  node: TreeNode<K>
  level: number
  /** 1-based position among its siblings, and how many there are. */
  position: number
  size: number
  parent: K | null
}

/** Everything on screen, flattened: the arrows walk this, not the shape. */
const rows = computed(() => {
  const out: Row[] = []

  const walk = (list: readonly TreeNode<K>[], level: number, parent: K | null) => {
    list.forEach((node, index) => {
      out.push({ node, level, position: index + 1, size: list.length, parent })
      if (node.children?.length && expanded.value.includes(node.key)) {
        walk(node.children, level + 1, node.key)
      }
    })
  }

  walk(nodes, 1, null)

  return out
})

const active = ref(0)

const chosen = computed(() => {
  const value = model.value as K | K[] | undefined
  if (Array.isArray(value)) return new Set<K>(value)

  return new Set<K>(value === undefined ? [] : [value])
})

const isOpen = (node: TreeNode<K>) => expanded.value.includes(node.key)
const hasChildren = (node: TreeNode<K>) => Boolean(node.children?.length)

function setOpen(node: TreeNode<K>, open: boolean) {
  if (!hasChildren(node)) return

  expanded.value = open
    ? [...expanded.value, node.key]
    : expanded.value.filter((key) => key !== node.key)
}

function choose(node: TreeNode<K>) {
  if (node.disabled) return

  if (mode === 'multiple') {
    const next = new Set(chosen.value)
    if (next.has(node.key)) next.delete(node.key)
    else next.add(node.key)

    model.value = [...next] as Value
    return
  }

  model.value = node.key as Value
}

function moveTo(index: number) {
  active.value = Math.max(0, Math.min(rows.value.length - 1, index))
}

function onKeydown(event: KeyboardEvent) {
  const row = rows.value[active.value]
  if (!row) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      moveTo(active.value + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveTo(active.value - 1)
      break
    case 'ArrowRight':
      event.preventDefault()
      // Open, then step in: the two halves of "go deeper".
      if (hasChildren(row.node) && !isOpen(row.node)) setOpen(row.node, true)
      else if (hasChildren(row.node)) moveTo(active.value + 1)
      break
    case 'ArrowLeft': {
      event.preventDefault()
      if (hasChildren(row.node) && isOpen(row.node)) {
        setOpen(row.node, false)
        break
      }
      // Already closed, or a leaf: step out to the parent.
      const parent = rows.value.findIndex((one) => one.node.key === row.parent)
      if (parent >= 0) moveTo(parent)
      break
    }
    case 'Home':
      event.preventDefault()
      moveTo(0)
      break
    case 'End':
      event.preventDefault()
      moveTo(rows.value.length - 1)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      choose(row.node)
      break
  }
}

function onClick(index: number, row: Row) {
  active.value = index
  if (hasChildren(row.node)) setOpen(row.node, !isOpen(row.node))
  else choose(row.node)
}
</script>

<template>
  <ul
    class="rk-tree"
    role="tree"
    :aria-label="label"
    :aria-multiselectable="mode === 'multiple' ? true : undefined"
    tabindex="0"
    @keydown="onKeydown"
  >
    <li
      v-for="(row, index) in rows"
      :key="row.node.key"
      class="rk-tree-row"
      :class="{
        'is-active': index === active,
        'is-chosen': chosen.has(row.node.key),
        'is-disabled': row.node.disabled,
      }"
      role="treeitem"
      :aria-level="row.level"
      :aria-setsize="row.size"
      :aria-posinset="row.position"
      :aria-expanded="row.node.children?.length ? isOpen(row.node) : undefined"
      :aria-selected="chosen.has(row.node.key)"
      :aria-disabled="row.node.disabled || undefined"
      :style="{ '--rk-tree-level': row.level }"
      @click="onClick(index, row)"
    >
      <ChevronRight
        v-if="row.node.children?.length"
        class="rk-tree-twist"
        :class="{ 'is-open': isOpen(row.node) }"
        aria-hidden="true"
      />
      <span v-else class="rk-tree-twist-space" aria-hidden="true" />

      <component
        :is="row.node.icon"
        v-if="row.node.icon"
        class="size-4 shrink-0"
        aria-hidden="true"
      />
      <span class="truncate">{{ row.node.label }}</span>
    </li>
  </ul>
</template>

<style scoped>
.rk-tree {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-radius: var(--radius-card);
}

.rk-tree:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-tree-row {
  display: flex;
  cursor: pointer;
  align-items: center;
  gap: 0.375rem;
  border-radius: var(--radius-cell);
  /* Indented by level, so a branch reads as being inside its parent. */
  padding: 0.3125rem 0.5rem 0.3125rem calc(0.5rem + (var(--rk-tree-level) - 1) * 1rem);
  font-size: 0.875rem;
  color: var(--color-ink);
}

.rk-tree-row.is-active {
  background: var(--color-muted);
}

.rk-tree-row.is-chosen {
  color: var(--color-primary);
  font-weight: 500;
}

.rk-tree-row.is-chosen.is-active {
  background: color-mix(in oklab, var(--color-primary) 12%, transparent);
}

.rk-tree-row.is-disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.rk-tree-twist,
.rk-tree-twist-space {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.rk-tree-twist {
  color: var(--color-ink-soft);
  transition: rotate var(--duration-fast) var(--ease-standard);
}

.rk-tree-twist.is-open {
  rotate: 90deg;
}
</style>
