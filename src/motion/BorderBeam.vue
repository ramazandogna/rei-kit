<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

import { prefersReducedMotion, watchVisibility } from './environment'

/**
 * A highlight that travels once around the edge of whatever it wraps.
 *
 * The beam is a conic gradient on a ring cut out of the border box, in two
 * palette colours. It circles twice and rests as a static highlight, unless
 * `loop` asks it to go on, and it is a static highlight from the start for a
 * reader who asked for less motion. It stops while offscreen.
 *
 * Glass adds a soft glow, soft narrows and lightens it, and brutal makes it
 * thick, stepped and hard-edged. The ring is decorative and never takes the
 * pointer. Pass the radius of the thing inside so the corners line up.
 *
 * @example
 * ```vue
 * <BorderBeam><BaseCard>Pro</BaseCard></BorderBeam>
 * ```
 */
const {
  duration = 6,
  width = 1.5,
  from = 'primary',
  to = 'accent',
  radius = 'card',
  loop = false,
  paused = false,
  reverse = false,
  as = 'div',
} = defineProps<{
  /** Seconds per turn. Without `loop` it is capped at 2.4 so two turns end within 5 s. */
  duration?: number | undefined
  /** Ring thickness in px. */
  width?: number | undefined
  from?: 'primary' | 'accent' | 'positive' | 'warning' | 'negative' | 'ink' | undefined
  to?: 'primary' | 'accent' | 'positive' | 'warning' | 'negative' | 'ink' | undefined
  radius?: 'control' | 'card' | 'shell' | undefined
  /** Keep circling. Off, two turns and a resting highlight. */
  loop?: boolean | undefined
  paused?: boolean | undefined
  reverse?: boolean | undefined
  as?: string | undefined
}>()

const root = useTemplateRef<HTMLElement>('root')
let stop: (() => void) | null = null

onMounted(() => {
  const el = root.value
  if (!el || prefersReducedMotion()) return
  stop = watchVisibility(el, (visible) => {
    if (visible) el.removeAttribute('data-paused')
    else el.setAttribute('data-paused', '')
  })
})

onBeforeUnmount(() => stop?.())
</script>

<template>
  <component
    :is="as"
    ref="root"
    class="bb"
    :class="{ 'bb--loop': loop, 'bb--paused': paused, 'bb--reverse': reverse }"
    :style="{
      '--bb-dur': `${loop ? duration : Math.min(duration, 2.4)}s`,
      '--bb-w': width,
      '--bb-from': `var(--color-${from})`,
      '--bb-to': `var(--color-${to})`,
      '--bb-r': `var(--radius-${radius})`,
    }"
  >
    <slot />
  </component>
</template>

<style scoped>
@property --beam-a {
  syntax: '<angle>';
  initial-value: 135deg;
  inherits: false;
}

.bb {
  position: relative;
  border-radius: var(--bb-r);
  --beam-a: 135deg;
  --bb-px: calc(var(--bb-w) * 1px);
  --bb-mix: 100%;
}

.bb::before,
.bb::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: var(--bb-px);
  pointer-events: none;
  background: conic-gradient(
    from var(--beam-a),
    transparent 0 72%,
    color-mix(in oklab, var(--bb-from) var(--bb-mix), transparent) 84%,
    color-mix(in oklab, var(--bb-to) var(--bb-mix), transparent) 96%,
    transparent
  );
  mask:
    linear-gradient(black 0 0) content-box exclude,
    linear-gradient(black 0 0);
  -webkit-mask:
    linear-gradient(black 0 0) content-box xor,
    linear-gradient(black 0 0);
  animation: bb-spin var(--bb-dur) linear 2 forwards;
}

/* The second layer exists only for the materials that glow. */
.bb::after {
  display: none;
}

.bb--loop::before,
.bb--loop::after {
  animation-iteration-count: infinite;
}
.bb--reverse::before,
.bb--reverse::after {
  animation-direction: reverse;
}
.bb--paused::before,
.bb--paused::after,
.bb[data-paused]::before,
.bb[data-paused]::after {
  animation-play-state: paused;
}

@keyframes bb-spin {
  from {
    --beam-a: 135deg;
  }
  to {
    --beam-a: 495deg;
  }
}

:where([data-material='glass']) .bb::after {
  display: block;
  filter: blur(8px);
  opacity: 0.6;
}

:where([data-material='soft']) .bb {
  --bb-px: 2px;
  --bb-mix: 70%;
}
:where([data-material='soft']) .bb::before {
  filter: blur(2px);
}

:where([data-material='brutal']) .bb {
  --bb-px: calc(max(2, var(--bb-w) * 1.5) * 1px);
}
:where([data-material='brutal']) .bb::before {
  background: conic-gradient(
    from var(--beam-a),
    transparent 0 72%,
    var(--bb-from) 72% 86%,
    var(--bb-to) 86% 100%
  );
  animation-timing-function: steps(12);
}

@media (prefers-reduced-motion: reduce) {
  .bb::before,
  .bb::after {
    animation: none !important;
  }
}
</style>
