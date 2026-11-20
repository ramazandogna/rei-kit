<script setup lang="ts">
import { onBeforeUnmount, useTemplateRef } from 'vue'

import { nextFrame } from './environment'

/**
 * A card that leans toward the pointer, with a sheen that slides across it.
 *
 * The surface is `BaseCard`'s. The lean is a few degrees and returns slowly
 * when the pointer leaves. Touch does not tilt it, and neither does keyboard
 * focus: focus lifts it with the raised shadow instead, because a card that
 * rotates under a keyboard user is only in the way.
 *
 * Brutal halves the lean, drops the sheen and steps; glass brightens the sheen;
 * soft tilts less and glows softly. For a reader who asked for less motion
 * there is no rotation, scale or sheen — hover lifts the shadow only.
 *
 * @example
 * ```vue
 * <TiltCard><h3>Pro</h3><p>Hover me.</p></TiltCard>
 * ```
 */
const {
  max = 8,
  scale = 1.02,
  perspective = 900,
  glare = true,
  as = 'div',
} = defineProps<{
  /** Largest lean, in degrees. */
  max?: number | undefined
  /** Size of the card while the pointer is on it. */
  scale?: number | undefined
  /** Perspective distance in px; lower is more dramatic. */
  perspective?: number | undefined
  /** The sheen that follows the pointer. */
  glare?: boolean | undefined
  as?: string | undefined
}>()

const inner = useTemplateRef<HTMLElement>('inner')
let cancel: (() => void) | null = null

function move(event: PointerEvent) {
  const el = inner.value
  if (!el || event.pointerType === 'touch') return
  const { clientX, clientY } = event
  cancel?.()
  cancel = nextFrame(() => {
    const r = el.getBoundingClientRect()
    const nx = ((clientX - r.left) / (r.width || 1) - 0.5) * 2
    const ny = ((clientY - r.top) / (r.height || 1) - 0.5) * 2
    el.style.setProperty('--rx', String(nx * max))
    el.style.setProperty('--ry', String(-ny * max))
    // The sheen's direction: from the pointer through the centre.
    el.style.setProperty('--ga', `${Math.round((Math.atan2(ny, nx) * 180) / Math.PI + 90)}deg`)
  })
}

function leave() {
  cancel?.()
  for (const name of ['--rx', '--ry', '--ga']) inner.value?.style.removeProperty(name)
}

onBeforeUnmount(() => cancel?.())
</script>

<template>
  <component :is="as" class="tc" :style="{ '--tc-persp': `${perspective}px`, '--tc-scale': scale }">
    <div
      ref="inner"
      class="tc-inner surface rounded-card"
      :class="{ 'tc--glare': glare }"
      @pointermove="move"
      @pointerleave="leave"
    >
      <slot />
    </div>
  </component>
</template>

<style scoped>
.tc {
  perspective: var(--tc-persp);
}

.tc-inner {
  --rx: 0;
  --ry: 0;
  --ts: 1;
  --ga: 135deg;
  --tc-k: 1;
  --tc-glare: 22%;
  position: relative;
  padding: 1rem;
  transform-style: preserve-3d;
  transform: rotateX(calc(var(--ry) * 1deg * var(--tc-k)))
    rotateY(calc(var(--rx) * 1deg * var(--tc-k))) scale(var(--ts));
  transition:
    transform var(--duration-slow) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard);
}

.tc-inner:hover {
  --ts: var(--tc-scale);
  transition:
    transform var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard);
}

.tc-inner:hover,
.tc:focus-within .tc-inner {
  --surface-shadow: var(--shadow-raised);
}

/* Keyboard focus: a lift, never a lean. */
.tc:focus-within .tc-inner {
  --rx: 0 !important;
  --ry: 0 !important;
  --ts: 1;
}

.tc--glare::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  mix-blend-mode: overlay;
  background: linear-gradient(
    var(--ga),
    color-mix(in oklab, white var(--tc-glare), transparent),
    transparent 60%
  );
  transition: opacity var(--duration-base) var(--ease-standard);
}
.tc--glare:hover::after {
  opacity: 1;
}

:where(.dark) .tc-inner {
  --tc-glare: 12%;
}
:where([data-material='glass']) .tc-inner {
  --tc-glare: 30%;
}
:where([data-material='soft']) .tc-inner {
  --tc-glare: 15%;
}
:where([data-material='soft']) .tc-inner:hover {
  --ts: calc(1 + (var(--tc-scale) - 1) / 2);
}
:where([data-material='brutal']) .tc-inner {
  --tc-k: 0.5;
  transition-timing-function: steps(3);
}
:where([data-material='brutal']) .tc--glare::after {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .tc-inner {
    transform: none !important;
  }
  .tc--glare::after {
    display: none;
  }
}
</style>
