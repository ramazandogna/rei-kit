<script setup lang="ts">
import { RefreshCw, X } from 'lucide-vue-next'

import BaseButton from '../components/BaseButton.vue'

/**
 * The card that says a new version is waiting.
 *
 * `registerType: 'prompt'` means a new service worker waits rather than taking
 * over, and this is what asks whether to apply it. Asking rather than reloading
 * is the decision worth keeping: an automatic swap mid-sentence loses whatever
 * was being typed.
 *
 * **The service worker stays the app's.** `virtual:pwa-register/vue` is a
 * build-time module from `vite-plugin-pwa`, and a library cannot import one —
 * so the app owns `useRegisterSW` and hands the answer down as `open`. That
 * split is also honest: whether an update is waiting is the app's business,
 * and what the card looks like is this component's.
 *
 * @example
 * ```vue
 * <script setup>
 * const { needRefresh, updateServiceWorker } = useRegisterSW()
 * <\/script>
 *
 * <UpdatePrompt
 *   :open="needRefresh"
 *   :title="t('pwa.updateTitle')"
 *   :body="t('pwa.updateBody')"
 *   :action="t('pwa.reload')"
 *   :dismiss-label="t('pwa.later')"
 *   @update="updateServiceWorker(true)"
 *   @dismiss="needRefresh = false"
 * />
 * ```
 */
defineProps<{
  open: boolean
  title: string
  body: string
  action: string
  /** The X's accessible name. An X on its own has none. */
  dismissLabel: string
}>()

defineEmits<{ update: []; dismiss: [] }>()
</script>

<template>
  <Transition name="update">
    <aside v-if="open" class="update-card" role="status">
      <span class="update-icon" aria-hidden="true">
        <RefreshCw class="size-4" />
      </span>

      <div class="min-w-0 flex-1">
        <p class="text-ink text-sm font-semibold">{{ title }}</p>
        <p class="text-ink-soft text-xs leading-snug">{{ body }}</p>
      </div>

      <BaseButton
        variant="primary"
        pill
        size="xs"
        class="shrink-0 font-semibold"
        @click="$emit('update')"
      >
        {{ action }}
      </BaseButton>

      <BaseButton
        variant="quiet"
        icon
        pill
        size="sm"
        class="shrink-0"
        :aria-label="dismissLabel"
        @click="$emit('dismiss')"
      >
        <X class="size-4" />
      </BaseButton>
    </aside>
  </Transition>
</template>

<style scoped>
/* Sits above the tab bar and the action button, because it outranks both — but
   absolutely inside its container, so on a desktop-sized shell it does not
   float off into the page. Give the shell `relative`. */
.update-card {
  border-color: var(--color-hair);
  background: color-mix(in srgb, var(--color-surface) 95%, transparent);
  border-radius: var(--radius-card);
  position: absolute;
  left: 50%;
  z-index: 50;
  display: flex;
  width: 100%;
  max-width: 360px;
  align-items: center;
  gap: 0.75rem;
  border-width: 1px;
  padding: 0.75rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  transform: translateX(-50%);
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
}

.update-icon {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
  display: flex;
  height: 2.25rem;
  width: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

.update-enter-active,
.update-leave-active {
  transition:
    opacity 250ms ease,
    transform 250ms cubic-bezier(0.32, 0.72, 0, 1);
}

.update-enter-from,
.update-leave-to {
  opacity: 0;
  transform: translate(-50%, 1rem);
}

@media (prefers-reduced-motion: reduce) {
  .update-enter-from,
  .update-leave-to {
    transform: translate(-50%, 0);
  }
}
</style>
