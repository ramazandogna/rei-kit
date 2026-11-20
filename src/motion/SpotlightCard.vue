<script setup lang="ts">
import { onBeforeUnmount, useTemplateRef } from 'vue'

import { nextFrame } from './environment'

/**
 * A card with a soft light that follows the pointer, and lights its own edge.
 *
 * The surface is `BaseCard`'s — same tokens, same material — so it sits beside
 * one without a seam. The light is two decorative layers drawn from the
 * palette's primary: a glow under the pointer and a ring along the border.
 * Touch does not move it (a finger would leave it stranded); keyboard focus
 * centres it so a tab stop is lit too.
 *
 * Glass brightens it, soft widens and calms it, and brutal swaps the gradient
 * for a hard primary ring and a press into the shadow.
 *
 * @example
 * ```vue
 * <SpotlightCard><h3>Fast</h3><p>Zero dependencies.</p></SpotlightCard>
 * ```
 */
const {
  as = 'div',
  size = 320,
  intensity = 0.14,
  border = true,
  padding = 'md',
} = defineProps<{
  as?: string | undefined
  /** Radius of the light in px. */
  size?: number | undefined
  /** Strength of the glow, 0 to 1. The edge ring is three times this. */
  intensity?: number | undefined
  /** Light the card's border as well as its face. */
  border?: boolean | undefined
  /** Room around the contents, on `BaseCard`'s scale. */
  padding?: 'none' | 'sm' | 'md' | 'lg' | undefined
}>()

const PAD = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' } as const

const root = useTemplateRef<HTMLElement>('root')
let cancel: (() => void) | null = null

function move(event: PointerEvent) {
  const el = root.value
  if (!el || event.pointerType === 'touch') return
  const { clientX, clientY } = event
  cancel?.()
  // One write per frame, whatever the pointer's report rate.
  cancel = nextFrame(() => {
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--sx', `${clientX - rect.left}px`)
    el.style.setProperty('--sy', `${clientY - rect.top}px`)
  })
}

/** Back to the centre, which is where focus lights it. */
function reset() {
  cancel?.()
  root.value?.style.removeProperty('--sx')
  root.value?.style.removeProperty('--sy')
}

onBeforeUnmount(() => cancel?.())
</script>

<template>
  <component
    :is="as"
    ref="root"
    class="sc surface rounded-card"
    :class="[PAD[padding], border ? 'sc--ring' : '']"
    :style="{ '--sc-size': size, '--sc-int': intensity }"
    @pointermove="move"
    @pointerleave="reset"
    @focusin="reset"
  >
    <span class="sc-glow" aria-hidden="true" />
    <span v-if="border" class="sc-ring" aria-hidden="true" />
    <slot />
  </component>
</template>

<style scoped>
.sc {
  position: relative;
  /* Material knobs: glass lights more, soft spreads and calms. */
  --sc-k: 1;
  --sc-s: 1;
  --sx: 50%;
  --sy: 50%;
}

:where([data-material='glass']) .sc {
  --sc-k: 1.5;
}
:where([data-material='soft']) .sc {
  --sc-k: 0.7;
  --sc-s: 1.5;
}

.sc-glow,
.sc-ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-standard);
  --sc-light: radial-gradient(
    calc(var(--sc-size) * var(--sc-s) * 1px) circle at var(--sx) var(--sy),
    color-mix(in oklab, var(--color-primary) var(--sc-a), transparent),
    transparent 70%
  );
}

.sc-glow {
  --sc-a: calc(var(--sc-int) * var(--sc-k) * 100%);
  background: var(--sc-light);
}

/* The ring sits over the surface border, so it is drawn outside the padding
   box by the border's own width. */
.sc-ring {
  --sc-a: calc(var(--sc-int) * var(--sc-k) * 300%);
  inset: calc(-1 * var(--surface-border-width, 1px));
  padding: var(--surface-border-width, 1px);
  background: var(--sc-light);
  mask:
    linear-gradient(#000 0 0) content-box exclude,
    linear-gradient(#000 0 0);
  -webkit-mask:
    linear-gradient(#000 0 0) content-box xor,
    linear-gradient(#000 0 0);
}

.sc:hover .sc-glow,
.sc:hover .sc-ring,
.sc:focus-within .sc-glow,
.sc:focus-within .sc-ring {
  opacity: 1;
}

:where(.dark) :where([data-material='glass']) .sc-glow,
:where(.dark[data-material='glass']) .sc-glow {
  mix-blend-mode: plus-lighter;
}

/* Brutal: no light, a hard ring and a press into the shadow. */
:where([data-material='brutal']) .sc {
  transition:
    translate var(--duration-fast) steps(1),
    box-shadow var(--duration-fast) steps(1);
}
:where([data-material='brutal']) .sc-glow {
  display: none;
}
:where([data-material='brutal']) .sc-ring {
  --sc-light: var(--color-primary);
  background: var(--color-primary);
  padding: 2px;
  inset: -2px;
  transition: none;
}
:where([data-material='brutal']) .sc:hover,
:where([data-material='brutal']) .sc:focus-within {
  translate: var(--press-offset) var(--press-offset);
  --surface-shadow: calc(4px - var(--press-offset)) calc(4px - var(--press-offset)) 0
    var(--color-ink);
}

@media (prefers-reduced-motion: reduce) {
  .sc-glow,
  .sc-ring,
  .sc {
    transition: none !important;
  }
}
</style>
