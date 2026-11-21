<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

import { prefersReducedMotion, watchVisibility } from './environment'

/**
 * A decorative field behind a hero: dots, a grid, a soft aurora, blobs or
 * grain, built only from the active palette so it follows the palette, dark
 * mode and material without being told.
 *
 * `auto` picks the look the material suggests — dots for quiet, aurora for
 * glass, a grid for brutal, blobs for soft — in CSS, so there is no script
 * and no flash. The slot sits above the backdrop in its own stacking context.
 *
 * The backdrop is hidden from assistive tech and never takes the pointer. The
 * drift plays one cycle and rests unless `loop` is set (nothing here may move
 * for ever unless the caller chose it), pauses while offscreen, and is a
 * still frame for a reader who asked for less motion or on a server.
 *
 * @example
 * ```vue
 * <HeroBackdrop variant="aurora" intensity="bold"><h1>Hello</h1></HeroBackdrop>
 * ```
 */
const {
  variant = 'auto',
  intensity = 'subtle',
  animate = true,
  loop = false,
  fade = 'radial',
  as = 'div',
} = defineProps<{
  /** The pattern. `auto` follows the nearest `data-material`. */
  variant?: 'auto' | 'dots' | 'grid' | 'aurora' | 'blobs' | 'noise' | undefined
  intensity?: 'subtle' | 'bold' | undefined
  /** Let aurora and blobs drift. Off, every variant is a still frame. */
  animate?: boolean | undefined
  /** Keep drifting. Off, the drift plays one cycle and rests. */
  loop?: boolean | undefined
  /** How the edges dissolve into the page. */
  fade?: 'none' | 'bottom' | 'radial' | undefined
  as?: string | undefined
}>()

const layer = useTemplateRef<HTMLElement>('layer')
let stop: (() => void) | null = null

onMounted(() => {
  const el = layer.value
  if (!el || !animate || prefersReducedMotion()) return
  stop = watchVisibility(el, (visible) => {
    if (visible) el.removeAttribute('data-paused')
    else el.setAttribute('data-paused', '')
  })
})

onBeforeUnmount(() => stop?.())
</script>

<template>
  <component :is="as" class="hb relative isolate">
    <div
      ref="layer"
      class="hb-layer"
      :class="[`hb--${variant}`, `hb--${intensity}`, `hb-fade--${fade}`]"
      :data-still="!animate || undefined"
      :data-loop="loop || undefined"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>

<style scoped>
.hb-layer {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  /* subtle / bold */
  --hb-dots: 14%;
  --hb-p: 35%;
  --hb-a: 30%;
  --hb-g: 20%;
  --hb-bl-a: 22%;
  --hb-bl-p: 22%;
  --hb-noise: 0.05;
}

.hb--bold {
  --hb-dots: 22%;
  --hb-p: 50%;
  --hb-a: 45%;
  --hb-g: 30%;
  --hb-bl-a: 32%;
  --hb-bl-p: 32%;
  --hb-noise: 0.09;
}

.hb-fade--radial {
  mask-image: radial-gradient(ellipse at 50% 40%, black 40%, transparent 75%);
}

.hb-fade--bottom {
  mask-image: linear-gradient(black 60%, transparent);
}

.hb-layer::before {
  content: '';
  position: absolute;
  inset: 0;
}

/* dots — also what `auto` means for quiet */
.hb--dots::before,
.hb--auto::before {
  background-image: radial-gradient(
    color-mix(in oklab, var(--color-ink) var(--hb-dots), transparent) 1px,
    transparent 1.5px
  );
  background-size: 24px 24px;
}

.hb--grid::before {
  background-image:
    linear-gradient(var(--color-hair) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-hair) 1px, transparent 1px);
  background-size: 48px 48px;
}

.hb--aurora::before,
.hb--blobs::before {
  inset: -10%;
  filter: blur(64px);
  animation: hb-drift 5s ease-in-out 1 both;
}

.hb--aurora::before {
  background:
    radial-gradient(
      40% 50% at 20% 25%,
      color-mix(in oklab, var(--color-primary) var(--hb-p), transparent),
      transparent
    ),
    radial-gradient(
      40% 50% at 80% 30%,
      color-mix(in oklab, var(--color-accent) var(--hb-a), transparent),
      transparent
    ),
    radial-gradient(
      50% 40% at 50% 85%,
      color-mix(in oklab, var(--color-positive) var(--hb-g), transparent),
      transparent
    );
}

.hb--blobs::before {
  background:
    radial-gradient(
      45% 55% at 25% 30%,
      color-mix(in oklab, var(--color-accent) var(--hb-bl-a), transparent),
      transparent
    ),
    radial-gradient(
      45% 55% at 75% 70%,
      color-mix(in oklab, var(--color-primary) var(--hb-bl-p), transparent),
      transparent
    );
}

.hb--noise::before {
  opacity: var(--hb-noise);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* auto: the material decides. Later rules win at equal weight, and `:where`
   keeps the material check free. */
:where([data-material='glass']) .hb--auto::before {
  inset: -10%;
  filter: blur(64px);
  animation: hb-drift 5s ease-in-out 1 both;
  background:
    radial-gradient(
      40% 50% at 20% 25%,
      color-mix(in oklab, var(--color-primary) var(--hb-p), transparent),
      transparent
    ),
    radial-gradient(
      40% 50% at 80% 30%,
      color-mix(in oklab, var(--color-accent) var(--hb-a), transparent),
      transparent
    ),
    radial-gradient(
      50% 40% at 50% 85%,
      color-mix(in oklab, var(--color-positive) var(--hb-g), transparent),
      transparent
    );
}

:where([data-material='soft']) .hb--auto::before {
  inset: -10%;
  filter: blur(64px);
  animation: hb-drift 5s ease-in-out 1 both;
  background:
    radial-gradient(
      45% 55% at 25% 30%,
      color-mix(in oklab, var(--color-accent) var(--hb-bl-a), transparent),
      transparent
    ),
    radial-gradient(
      45% 55% at 75% 70%,
      color-mix(in oklab, var(--color-primary) var(--hb-bl-p), transparent),
      transparent
    );
}

:where([data-material='brutal']) .hb--auto::before {
  background-image:
    linear-gradient(color-mix(in oklab, var(--color-ink) 12%, transparent) 2px, transparent 2px),
    linear-gradient(
      90deg,
      color-mix(in oklab, var(--color-ink) 12%, transparent) 2px,
      transparent 2px
    );
  background-size: 48px 48px;
}

/* dark: light blends onto the page instead of tinting it */
:where(.dark) .hb--aurora::before,
:where(.dark) :where([data-material='glass']) .hb--auto::before,
:where(.dark[data-material='glass']) .hb--auto::before {
  mix-blend-mode: screen;
}

.hb-layer[data-still]::before {
  animation: none;
}

.hb-layer[data-loop]::before {
  animation-duration: 18s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.hb--blobs[data-loop]::before,
:where([data-material='soft']) .hb--auto[data-loop]::before {
  animation-duration: 24s;
}

.hb-layer[data-paused]::before {
  animation-play-state: paused;
}

@keyframes hb-drift {
  from {
    translate: -6% -6%;
  }
  to {
    translate: 6% 6%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hb-layer::before {
    animation: none !important;
  }
}
</style>
