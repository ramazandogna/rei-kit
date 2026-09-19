<script setup lang="ts" generic="K extends string">
import { Check, X } from 'lucide-vue-next'
import { computed } from 'vue'

export interface StepperStep<K extends string> {
  key: K
  /** Already translated. */
  label: string
  /** A line under the label: what the step asks for. */
  description?: string | undefined
  /** Marks a step that needs fixing — a form page with errors on it. */
  error?: boolean | undefined
}

/**
 * Where someone is in a process of several steps — a sign-up, a checkout, a
 * form split into pages.
 *
 * It shows the way, it does not drive it: the current step is a `v-model`,
 * and the pages and the Next and Back buttons are the app's. With
 * `interactive`, a step already done can be clicked to go back to it; steps
 * ahead never can, because skipping ahead is how a form arrives half filled.
 *
 * An ordered list, with `aria-current="step"` on the step in progress, so a
 * screen reader hears "step 2 of 4, current" without the kit inventing a
 * sentence. The words for done and needs-fixing are the app's, passed in
 * `stateLabels`, and read only to assistive tech.
 */
const {
  steps,
  label,
  orientation = 'horizontal',
  interactive = false,
  stateLabels = undefined,
} = defineProps<{
  steps: readonly StepperStep<K>[]
  /** The list's accessible name, e.g. "Checkout". */
  label: string
  orientation?: 'horizontal' | 'vertical' | undefined
  /** Completed steps become buttons that go back to them. */
  interactive?: boolean | undefined
  /** Read to a screen reader after a step's label: `{ complete: 'done', error: 'needs attention' }`. */
  stateLabels?: { complete: string; error: string } | undefined
}>()

/** The step in progress, by key, with `v-model`. */
const current = defineModel<K>({ required: true })

const currentIndex = computed(() => steps.findIndex((step) => step.key === current.value))

/* Only back: a step ahead is never a way in, or a form arrives half filled. */
const canGoTo = (index: number) => interactive && index < currentIndex.value

function goTo(index: number) {
  if (canGoTo(index)) current.value = steps[index]!.key
}

function state(index: number) {
  const step = steps[index]!
  if (step.error) return 'error'
  if (index < currentIndex.value) return 'complete'
  if (index === currentIndex.value) return 'current'
  return 'upcoming'
}
</script>

<template>
  <nav :aria-label="label">
    <ol class="rk-steps" :class="`is-${orientation}`">
      <li
        v-for="(step, index) in steps"
        :key="step.key"
        class="rk-step"
        :class="`is-${state(index)}`"
        :aria-current="index === currentIndex ? 'step' : undefined"
      >
        <component
          :is="canGoTo(index) ? 'button' : 'div'"
          :type="canGoTo(index) ? 'button' : undefined"
          class="rk-step-body"
          :class="{ 'focus-ring is-clickable': canGoTo(index) }"
          @click="goTo(index)"
        >
          <span class="rk-step-mark" aria-hidden="true">
            <X v-if="state(index) === 'error'" class="size-3.5" />
            <Check v-else-if="state(index) === 'complete'" class="size-3.5" />
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="rk-step-text">
            <span class="rk-step-label">{{ step.label }}</span>
            <span v-if="step.description" class="rk-step-description">{{ step.description }}</span>
            <span
              v-if="stateLabels && (state(index) === 'complete' || state(index) === 'error')"
              class="sr-only"
            >
              — {{ state(index) === 'error' ? stateLabels.error : stateLabels.complete }}
            </span>
          </span>
        </component>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.rk-steps {
  display: flex;
  gap: 0.5rem;
}

.rk-steps.is-horizontal {
  align-items: flex-start;
}

.rk-steps.is-vertical {
  flex-direction: column;
  gap: 0;
}

.rk-step {
  position: relative;
  flex: 1;
  min-width: 0;
}

/* The connecting line, drawn from each step to the next. */
.rk-step:not(:last-child)::after {
  content: '';
  position: absolute;
  background: var(--color-hair);
  transition: background-color var(--duration-base) var(--ease-standard);
}

.is-horizontal .rk-step:not(:last-child)::after {
  top: 0.875rem;
  left: calc(1.75rem + 0.5rem);
  right: 0.5rem;
  height: 2px;
}

.is-vertical .rk-step:not(:last-child)::after {
  top: 2.125rem;
  bottom: 0.25rem;
  left: 0.8125rem;
  width: 2px;
}

.rk-step.is-complete::after {
  background: var(--color-primary);
}

.rk-step-body {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  width: 100%;
  border-radius: var(--radius-cell);
  text-align: left;
}

.is-horizontal .rk-step-body {
  flex-direction: column;
}

.is-vertical .rk-step-body {
  padding-bottom: 1.5rem;
}

.rk-step-body.is-clickable {
  cursor: pointer;
}

.rk-step-mark {
  position: relative;
  z-index: 1;
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  border: 2px solid var(--color-hair);
  background: var(--color-surface);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-ink-soft);
  transition:
    background-color var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard),
    color var(--duration-base) var(--ease-standard);
}

.is-current .rk-step-mark {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.is-complete .rk-step-mark {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.is-error .rk-step-mark {
  border-color: var(--color-negative);
  background: var(--color-negative);
  color: var(--color-on-negative);
}

.is-clickable:hover .rk-step-mark {
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-primary) 18%, transparent);
}

.rk-step-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.125rem;
  padding-top: 0.25rem;
}

.rk-step-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-ink-soft);
}

.is-current .rk-step-label,
.is-complete .rk-step-label {
  color: var(--color-ink);
}

.is-error .rk-step-label {
  color: var(--color-negative);
}

.rk-step-description {
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-ink-soft);
}
</style>
