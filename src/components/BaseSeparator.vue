<script setup lang="ts">
/**
 * A line between things — with, when it helps, a word on it.
 *
 * `role="separator"` when it only divides, and nothing at all to assistive
 * tech when it carries a label, because then the text is the point and the
 * line is decoration around it.
 *
 * Vertical needs a height from its parent: inside a flex row, that is
 * `align-items: stretch`, which is the default.
 */
const {
  orientation = 'horizontal',
  label = '',
  spacing = 'md',
} = defineProps<{
  orientation?: 'horizontal' | 'vertical' | undefined
  /** A word in the middle of the line: "or", "Today". Already translated. */
  label?: string | undefined
  /** Room around it. `none` for a divider inside a list that has its own. */
  spacing?: 'none' | 'sm' | 'md' | undefined
}>()
</script>

<template>
  <div
    v-if="label"
    class="rk-sep-labelled"
    :class="[`is-${orientation}`, `space-${spacing}`]"
    aria-hidden="true"
  >
    <span class="rk-sep-line" />
    <span class="rk-sep-label">{{ label }}</span>
    <span class="rk-sep-line" />
  </div>

  <div
    v-else
    class="rk-sep"
    :class="[`is-${orientation}`, `space-${spacing}`]"
    role="separator"
    :aria-orientation="orientation"
  />
</template>

<style scoped>
.rk-sep,
.rk-sep-labelled {
  --rk-sep-space: 1rem;
}

.space-sm {
  --rk-sep-space: 0.5rem;
}

.space-none {
  --rk-sep-space: 0px;
}

.rk-sep.is-horizontal {
  height: 1px;
  width: 100%;
  margin-block: var(--rk-sep-space);
  background: var(--color-hair);
}

.rk-sep.is-vertical {
  width: 1px;
  align-self: stretch;
  min-height: 1rem;
  margin-inline: var(--rk-sep-space);
  background: var(--color-hair);
}

.rk-sep-labelled {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-block: var(--rk-sep-space);
}

.rk-sep-labelled.is-vertical {
  flex-direction: column;
  align-self: stretch;
  margin-block: 0;
  margin-inline: var(--rk-sep-space);
}

.rk-sep-line {
  flex: 1;
  background: var(--color-hair);
}

.is-horizontal .rk-sep-line {
  height: 1px;
}

.is-vertical .rk-sep-line {
  width: 1px;
}

.rk-sep-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-ink-soft);
}
</style>
