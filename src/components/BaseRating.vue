<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import { horizontalStep } from '../utils/direction'

/**
 * A score out of five, given or shown.
 *
 * Two components in one, and the difference is `readonly`: given, it is a
 * slider you can drag with the arrow keys; read-only, it is an image with
 * the score as its name, and nothing to Tab into. A row of five buttons that
 * do nothing is five stops in the tab order for a number.
 *
 * `valueLabel` builds the spoken name — "4 out of 5" — because the words and
 * their order are the app's language, not the kit's.
 */
const {
  max = 5,
  label,
  valueLabel,
  readonly = false,
  size = 'md',
  allowClear = true,
} = defineProps<{
  max?: number | undefined
  /** What is being rated: "Difficulty", "Your rating". Already translated. */
  label: string
  /** The spoken value: `(value, max) => \`${value} out of ${max}\`.` */
  valueLabel: (value: number, max: number) => string
  /** Shows a score rather than asks for one. */
  readonly?: boolean | undefined
  size?: 'sm' | 'md' | 'lg' | undefined
  /** Pressing the current score again clears it. */
  allowClear?: boolean | undefined
}>()

/** The score, with `v-model`. `0` is none given. */
const model = defineModel<number>({ default: 0 })

const hovered = ref(0)
const shown = computed(() => hovered.value || model.value)
const stars = computed(() => Array.from({ length: max }, (_, i) => i + 1))

function pick(value: number) {
  if (readonly) return
  model.value = allowClear && model.value === value ? 0 : value
}

function onKeydown(event: KeyboardEvent) {
  /* The stars run the way the language does, so the one to the left is the
     higher score in Arabic. Up is always more. */
  const along = horizontalStep(event.key, event.currentTarget as Element)
  const moves: Record<string, number> = {
    ArrowRight: model.value + along,
    ArrowLeft: model.value + along,
    ArrowUp: model.value + 1,
    ArrowDown: model.value - 1,
    Home: 0,
    End: max,
  }
  const next = moves[event.key]
  if (next === undefined) return

  event.preventDefault()
  model.value = Math.min(max, Math.max(0, next))
}
</script>

<template>
  <div
    class="rk-rating"
    :class="[`is-${size}`, { 'is-readonly': readonly }]"
    :role="readonly ? 'img' : 'slider'"
    :aria-label="`${label}: ${valueLabel(model, max)}`"
    :tabindex="readonly ? undefined : 0"
    :aria-valuenow="readonly ? undefined : model"
    :aria-valuemin="readonly ? undefined : 0"
    :aria-valuemax="readonly ? undefined : max"
    :aria-valuetext="readonly ? undefined : valueLabel(model, max)"
    @keydown="readonly ? undefined : onKeydown($event)"
    @pointerleave="hovered = 0"
  >
    <!--
      Spans, never buttons, even though these are pressable.

      The slider above is the control: it is what takes focus, what the
      arrows move, and what a reader is told about. A `<button>` in here
      was a second interactive thing inside it, and `aria-hidden` did not
      undo that — a mouse press still moved focus onto an element hidden
      from the accessibility tree, taking the slider's own focus ring with
      it. A span has no such claim, and the pointer works exactly as before.
    -->
    <span
      v-for="star in stars"
      :key="star"
      class="rk-rating-star"
      :class="{ 'is-on': star <= shown }"
      aria-hidden="true"
      @click="readonly ? undefined : pick(star)"
      @pointerenter="readonly ? undefined : (hovered = star)"
    >
      <Star class="rk-rating-icon" />
    </span>
  </div>
</template>

<style scoped>
.rk-rating {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  border-radius: var(--radius-cell);
}

.rk-rating:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-rating-star {
  display: grid;
  place-items: center;
  padding: 0.125rem;
  color: var(--color-hair);
  transition:
    color var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.rk-rating:not(.is-readonly) .rk-rating-star {
  cursor: pointer;
}

.rk-rating-star.is-on {
  color: var(--color-warning);
}

.rk-rating:not(.is-readonly) .rk-rating-star:hover {
  transform: scale(1.12);
}

.rk-rating-icon {
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
  stroke-width: 1.25;
}

.is-sm .rk-rating-icon {
  width: 1rem;
  height: 1rem;
}

.is-lg .rk-rating-icon {
  width: 1.75rem;
  height: 1.75rem;
}

@media (prefers-reduced-motion: reduce) {
  .rk-rating-star {
    transition: none;
  }

  .rk-rating:not(.is-readonly) .rk-rating-star:hover {
    transform: none;
  }
}
</style>
