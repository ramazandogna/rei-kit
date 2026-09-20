<script setup lang="ts">
import { computed } from 'vue'

import BaseAvatar from './BaseAvatar.vue'

/**
 * The people on a thing, overlapped: who is in a conversation, who shares a
 * list.
 *
 * Past `max` it stops drawing faces and says how many are left, because ten
 * overlapping circles are neither ten faces nor a number. The whole stack is
 * one thing to a screen reader — `label` names it, usually with the count in
 * it, which is what somebody listening actually needs.
 */
const {
  people,
  label,
  max = 4,
  size = 'md',
} = defineProps<{
  /** Each person's name, and a picture where there is one. */
  people: readonly { name: string; src?: string | undefined }[]
  /** The stack's accessible name: "Shared with 6 people". Already translated. */
  label: string
  /** How many faces before the rest become a number. */
  max?: number | undefined
  size?: 'sm' | 'md' | 'lg' | undefined
}>()

const shown = computed(() => people.slice(0, max))
const rest = computed(() => Math.max(0, people.length - shown.value.length))
</script>

<template>
  <div class="rk-stack" :class="`is-${size}`" role="img" :aria-label="label">
    <span v-for="person in shown" :key="person.name" class="rk-stack-item" aria-hidden="true">
      <BaseAvatar :name="person.name" :src="person.src" :size="size" fallback="initials" />
    </span>
    <span v-if="rest" class="rk-stack-item rk-stack-rest" aria-hidden="true">+{{ rest }}</span>
  </div>
</template>

<style scoped>
.rk-stack {
  display: inline-flex;
  align-items: center;
}

/* Overlapped by a third, with a ring in the page's own colour so each face
   keeps an edge against the one under it — on any material. */
.rk-stack-item + .rk-stack-item {
  margin-left: -0.5rem;
}

.rk-stack.is-sm .rk-stack-item + .rk-stack-item {
  margin-left: -0.5rem;
}

.rk-stack.is-lg .rk-stack-item + .rk-stack-item {
  margin-left: -0.875rem;
}

.rk-stack-item {
  display: inline-flex;
  border-radius: 9999px;
  box-shadow: 0 0 0 2px var(--color-surface);
}

.rk-stack-rest {
  display: inline-grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  background: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-ink-soft);
  font-variant-numeric: tabular-nums;
}

.rk-stack.is-sm .rk-stack-rest {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.6875rem;
}

.rk-stack.is-lg .rk-stack-rest {
  width: 3rem;
  height: 3rem;
  font-size: 0.8125rem;
}
</style>
