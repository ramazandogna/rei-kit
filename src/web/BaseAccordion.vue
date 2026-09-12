<script setup lang="ts" generic="K extends string">
import { shallowRef, useId } from 'vue'

export interface AccordionItem<K extends string> {
  key: K
  /** The question. Already translated. */
  title: string
}

/**
 * A list that opens one section at a time.
 *
 * ## Why not `<details>`
 *
 * `<details>` is the honest element for this and it was the first choice. A
 * browser removes its content from layout entirely when closed, so there is
 * nothing to animate between — the panel can only appear. Faking it by leaving
 * `open` set and hiding with CSS tells a screen reader the section is expanded
 * while a sighted reader sees it shut, which is worse than no animation.
 *
 * So: a button carrying `aria-expanded`, the answer always in the markup — the
 * prerendered HTML carries every answer, which is what a crawler and a reader
 * without JavaScript get — and a grid row that travels from `0fr` to `1fr`,
 * which is the one way to animate to a height nobody has measured.
 *
 * The content is always present, so anything expensive in it is paid for on
 * first paint. That is the trade: a section a crawler can read costs a section
 * that is never lazy.
 */
const {
  items,
  multiple = false,
  headingLevel = 3,
} = defineProps<{
  items: readonly AccordionItem<K>[]
  /** Allow several open at once. Off by default, which is what makes it an accordion. */
  multiple?: boolean | undefined
  /**
   * Which heading the control sits inside.
   *
   * A heading, always — it is how a screen reader user moves between sections
   * without opening any of them. The level is a prop because it depends on what
   * is above it on the page, and getting it wrong breaks the outline.
   */
  headingLevel?: 2 | 3 | 4 | undefined
}>()

defineSlots<{
  /** The answer, per item. */
  default: (props: { item: AccordionItem<K>; open: boolean }) => unknown
  /** The question, when the item's `title` is not enough. */
  title?: (props: { item: AccordionItem<K>; open: boolean }) => unknown
}>()

const uid = useId()
/* `shallowRef` because the list is replaced wholesale rather than mutated, and
   because a deep ref unwraps a generic key type into something TypeScript can
   no longer match against `K`. */
const open = shallowRef<K[]>([])

const isOpen = (key: K) => open.value.includes(key)

function toggle(key: K) {
  if (isOpen(key)) {
    open.value = open.value.filter((k) => k !== key)
  } else {
    open.value = multiple ? [...open.value, key] : [key]
  }
}
</script>

<template>
  <ul class="rk-accordion">
    <li v-for="item in items" :key="item.key" class="rk-accordion-item">
      <component :is="`h${headingLevel}`">
        <button
          type="button"
          class="rk-accordion-control"
          :aria-expanded="isOpen(item.key)"
          :aria-controls="`${uid}-${item.key}`"
          @click="toggle(item.key)"
        >
          <span class="rk-accordion-title">
            <slot name="title" :item="item" :open="isOpen(item.key)">{{ item.title }}</slot>
          </span>

          <!-- A plus that becomes a minus: one stroke turns, so the control
               keeps its place while it changes meaning. -->
          <span class="rk-accordion-mark" aria-hidden="true">
            <span class="rk-accordion-bar" />
            <span
              class="rk-accordion-bar rk-accordion-bar-turn"
              :class="{ 'is-open': isOpen(item.key) }"
            />
          </span>
        </button>
      </component>

      <div
        :id="`${uid}-${item.key}`"
        class="rk-accordion-panel"
        :class="{ 'is-open': isOpen(item.key) }"
      >
        <div class="rk-accordion-clip">
          <div class="rk-accordion-body" :class="{ 'is-open': isOpen(item.key) }">
            <slot :item="item" :open="isOpen(item.key)" />
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.rk-accordion {
  border-top: 1px solid color-mix(in srgb, var(--color-hair) 70%, transparent);
}

.rk-accordion-item {
  border-bottom: 1px solid color-mix(in srgb, var(--color-hair) 70%, transparent);
}

.rk-accordion-control {
  display: flex;
  width: 100%;
  cursor: pointer;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 0;
  text-align: left;
  transition: color 150ms;
}

.rk-accordion-control:hover {
  color: var(--color-primary);
}

.rk-accordion-control:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-accordion-title {
  color: var(--color-ink);
  font-size: 1rem;
  font-weight: 500;
}

.rk-accordion-mark {
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
}

.rk-accordion-bar {
  position: absolute;
  height: 1px;
  width: 0.875rem;
  background: var(--color-ink-soft);
}

.rk-accordion-bar-turn {
  transform: rotate(90deg);
  transition: transform 420ms ease-out;
}

.rk-accordion-bar-turn.is-open {
  transform: rotate(0deg);
}

/* 0fr to 1fr is the whole trick: a grid row can be animated to a height that
   was never measured, which is what `height: auto` cannot do. */
.rk-accordion-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 420ms ease-out;
}

.rk-accordion-panel.is-open {
  grid-template-rows: 1fr;
}

.rk-accordion-clip {
  overflow: hidden;
}

.rk-accordion-body {
  max-width: 68ch;
  padding-bottom: 1.5rem;
  color: var(--color-ink-soft);
  line-height: 1.625;
  opacity: 0;
  transition: opacity 300ms;
}

.rk-accordion-body.is-open {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .rk-accordion-panel,
  .rk-accordion-bar-turn,
  .rk-accordion-body {
    transition: none;
  }
}
</style>
