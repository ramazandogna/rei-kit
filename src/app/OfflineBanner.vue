<script setup lang="ts">
import { useOnline } from '../composables/use-online'

/**
 * A floating note that the connection has gone.
 *
 * Floating, not in flow: connectivity flickers in lifts and tunnels, and a
 * banner that reflows the page on every flicker is worse than the outage it is
 * reporting. It sits under the top bar and above the content, so appearing and
 * disappearing costs no layout at all.
 *
 * `role="status"`, not `alert`: losing signal is a condition to know about, not
 * something to interrupt a reader mid-sentence for.
 *
 * Both phone apps had this, identically, down to the 200ms and the half-rem
 * travel.
 */
const { label } = defineProps<{
  /** The message. Required, because the kit has no language of its own. */
  label: string
}>()

const isOnline = useOnline()
</script>

<template>
  <Transition name="rk-offline">
    <p v-if="!isOnline" role="status" class="rk-offline-banner">{{ label }}</p>
  </Transition>
</template>

<style scoped>
.rk-offline-banner {
  position: absolute;
  top: 4.75rem;
  left: 50%;
  z-index: 30;
  width: 100%;
  max-width: 360px;
  transform: translateX(-50%);
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-ink);
  background: color-mix(in srgb, var(--color-warning) 90%, transparent);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  backdrop-filter: blur(4px);
}

.rk-offline-enter-active,
.rk-offline-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms cubic-bezier(0.32, 0.72, 0, 1);
}

.rk-offline-enter-from,
.rk-offline-leave-to {
  opacity: 0;
  transform: translate(-50%, -0.5rem);
}

/* The travel is the part that causes trouble; the fade is not. */
@media (prefers-reduced-motion: reduce) {
  .rk-offline-enter-from,
  .rk-offline-leave-to {
    transform: translate(-50%, 0);
  }
}
</style>
