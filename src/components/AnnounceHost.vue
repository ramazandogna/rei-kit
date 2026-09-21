<script setup lang="ts">
import { useAnnounce } from '../composables/use-announce'

/**
 * The two live regions `announce()` speaks through. Render one per app,
 * anywhere — nothing here is ever visible.
 *
 * Both regions are rendered empty from mount and stay in the page for its
 * whole life. That is the point of the component: a live region inserted
 * along with its first message is usually not announced at all, because
 * the reader has nothing to notice a change *to*. Only the text inside
 * them ever changes.
 */
const { polite, assertive } = useAnnounce()
</script>

<template>
  <div class="rk-announcer">
    <!-- `status` waits for a pause; `alert` interrupts. Two regions rather
         than one with a changing `aria-live`, because changing the
         politeness of a live region is not reliably picked up. -->
    <p role="status" aria-live="polite" aria-atomic="true">{{ polite }}</p>
    <p role="alert" aria-live="assertive" aria-atomic="true">{{ assertive }}</p>
  </div>
</template>

<style scoped>
/* Clipped rather than `display: none`: a hidden live region is not read at
   all, which is the quietest possible way for this to fail. */
.rk-announcer {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
