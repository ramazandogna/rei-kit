<script setup lang="ts">
import { tapFeedback } from '../utils/haptics'

/**
 * The one action the app is built around, reachable from every screen.
 *
 * Extended rather than a bare circle: a lone "+" says nothing about what it
 * adds, and this is the button the whole product is arranged around. Both phone
 * apps reached the same conclusion and wrote the same forty lines of CSS to get
 * there.
 *
 * It shares the tab bar's column rather than being anchored to the layout, so
 * it lines up with the bar's right edge at every width. Anchored to the layout
 * instead, it sat four hundred pixels away from the shell on a desktop screen —
 * which is how the shared version came to exist.
 */
defineProps<{
  /** The words beside the icon. */
  label: string
}>()

const emit = defineEmits<{ click: [] }>()

defineSlots<{
  /** The icon. A `lucide-vue-next` component, usually. */
  default: () => unknown
}>()

function press() {
  // The haptic belongs to the press, not to what the press opens: it has to
  // fire even when the sheet it opens is still being fetched.
  tapFeedback()
  emit('click')
}
</script>

<template>
  <div class="rk-fab-slot">
    <button type="button" class="rk-fab" @click="press">
      <span class="rk-fab-icon" aria-hidden="true"><slot /></span>
      <span class="rk-fab-label">{{ label }}</span>
    </button>
  </div>
</template>

<style scoped>
.rk-fab-slot {
  position: absolute;
  bottom: calc(6rem + env(safe-area-inset-bottom, 0px));
  left: 50%;
  z-index: 40;
  display: flex;
  width: 100%;
  max-width: 360px;
  transform: translateX(-50%);
  justify-content: flex-end;
  padding: 0 1rem;
  /* The slot spans the shell so the button can line up with the tab bar; it
     must not swallow taps meant for the page underneath it. */
  pointer-events: none;
}

.rk-fab {
  pointer-events: auto;
  display: flex;
  height: 3rem;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  padding-left: 1rem;
  padding-right: 1.25rem;
  color: #fff;
  background: var(--color-primary);
  transition: transform 150ms;
  /* A ring in the canvas colour separates it from whatever scrolls behind. */
  box-shadow:
    0 0 0 4px var(--color-canvas),
    0 10px 24px -8px color-mix(in srgb, var(--color-primary) 60%, transparent);
}

.rk-fab:active {
  transform: scale(0.95);
}

/* The ring is not decoration. This button was a `BaseButton variant="unstyled"`
   in the app it came from, which meant it inherited a focus ring for free; a
   bare <button> here would have dropped it, and a keyboard user would have had
   no way to see where they were. */
.rk-fab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.rk-fab-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.rk-fab-icon :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2.5px;
}

.rk-fab-label {
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .rk-fab {
    transition: none;
  }
}
</style>
