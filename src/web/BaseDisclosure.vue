<script setup lang="ts">
import { useId } from 'vue'

/**
 * One section that opens and closes.
 *
 * `BaseAccordion` is a list of these with the rule that only one stays open.
 * This is the same row on its own, for the common case where the list belongs
 * to the app — because it is staggered as it scrolls in, or interleaved with
 * something else, or rendered from a source the accordion cannot know about.
 *
 * That case is not hypothetical: the first list this kit met decorated every
 * row with a reveal directive, which has to sit on the element the accordion
 * would have owned. Shipping only the list would have meant choosing between
 * the component and the design.
 *
 * ## Why not `<details>`
 *
 * A browser removes `<details>` content from layout entirely when closed, so
 * there is nothing to animate between — the panel can only appear. Faking it by
 * leaving `open` set and hiding with CSS tells a screen reader the section is
 * expanded while a sighted reader sees it shut, which is worse than no
 * animation.
 *
 * So: a button carrying `aria-expanded`, the content always in the markup —
 * which is what a crawler and a reader without JavaScript get — and a grid row
 * travelling from `0fr` to `1fr`, the one way to animate to a height nobody has
 * measured.
 */
const { title = '', headingLevel = 3 } = defineProps<{
  /**
   * The question. Already translated.
   *
   * Optional only because the `title` slot is the other way to give one — pass
   * exactly one of them. A disclosure with neither has a control nobody can
   * read, which is why this is documented rather than defaulted to something.
   */
  title?: string | undefined
  /**
   * Which heading the control sits inside.
   *
   * A heading, always — it is how a screen reader user moves between sections
   * without opening any of them. The level depends on what is above it on the
   * page, and getting it wrong breaks the outline.
   */
  headingLevel?: 2 | 3 | 4 | undefined
}>()

const open = defineModel<boolean>({ default: false })

defineSlots<{
  /** The answer. */
  default: () => unknown
  /**
   * The question, when the prop is not enough.
   *
   * A slot as well as a prop because the size of a heading is a decision about
   * the page it is on, not about disclosure: the first list to use this wanted
   * the question a step larger on a wide screen, and a component that hard-codes
   * one size makes that an override against its own stylesheet.
   */
  title?: () => unknown
}>()

const id = useId()
</script>

<template>
  <div class="rk-disclosure">
    <component :is="`h${headingLevel}`">
      <button
        type="button"
        class="rk-disclosure-control"
        :aria-expanded="open"
        :aria-controls="id"
        @click="open = !open"
      >
        <span class="rk-disclosure-title">
          <slot name="title">{{ title }}</slot>
        </span>

        <!-- A plus that becomes a minus: one stroke turns, so the control keeps
             its place while it changes meaning. -->
        <span class="rk-disclosure-mark" aria-hidden="true">
          <span class="rk-disclosure-bar" />
          <span class="rk-disclosure-bar rk-disclosure-turn" :class="{ 'is-open': open }" />
        </span>
      </button>
    </component>

    <div :id="id" class="rk-disclosure-panel" :class="{ 'is-open': open }">
      <div class="rk-disclosure-clip">
        <div class="rk-disclosure-body" :class="{ 'is-open': open }"><slot /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rk-disclosure-control {
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

.rk-disclosure-control:hover {
  color: var(--color-primary);
}

.rk-disclosure-control:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-disclosure-title {
  color: var(--color-ink);
  font-size: 1rem;
  font-weight: 500;
}

.rk-disclosure-mark {
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
}

.rk-disclosure-bar {
  position: absolute;
  height: 1px;
  width: 0.875rem;
  background: var(--color-ink-soft);
}

.rk-disclosure-turn {
  transform: rotate(90deg);
  transition: transform 420ms ease-out;
}

.rk-disclosure-turn.is-open {
  transform: rotate(0deg);
}

/* 0fr to 1fr is the whole trick: a grid row can be animated to a height that
   was never measured, which `height: auto` cannot do. */
.rk-disclosure-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 420ms ease-out;
}

.rk-disclosure-panel.is-open {
  grid-template-rows: 1fr;
}

.rk-disclosure-clip {
  overflow: hidden;
}

.rk-disclosure-body {
  max-width: 68ch;
  padding-bottom: 1.5rem;
  color: var(--color-ink-soft);
  line-height: 1.625;
  opacity: 0;
  transition: opacity 300ms;
}

.rk-disclosure-body.is-open {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .rk-disclosure-panel,
  .rk-disclosure-turn,
  .rk-disclosure-body {
    transition: none;
  }
}
</style>
