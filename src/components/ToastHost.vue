<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-vue-next'

import BaseButton from './BaseButton.vue'
import { useToast } from '../composables/use-toast'
import type { ToastTone } from '../composables/use-toast'

/**
 * Where the toasts land. One of these, at the app root.
 *
 * @example
 * ```vue
 * <!-- App.vue -->
 * <ToastHost :close-label="$t('common.close')" />
 * ```
 */
const { closeLabel, bottom = false } = defineProps<{
  /**
   * The accessible name of each dismiss button. Required, because the button
   * is an X and an X has no name — and the kit does not know the language.
   */
  closeLabel: string
  /**
   * Stack from the bottom instead of the top. For a phone shell, where the top
   * is a status bar and a header and the thumb is nowhere near it.
   */
  bottom?: boolean | undefined
}>()

const { toasts, dismiss, pause, resume } = useToast()

/**
 * Teleport needs a `body`, and a server has none.
 *
 * Rendering nothing until mounted is also correct rather than merely safe: a
 * prerendered page has no toasts in it, so there is nothing to hydrate and
 * nothing to flash.
 */
const mounted = ref(false)
onMounted(() => (mounted.value = true))

const ICON = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: XCircle,
} as const satisfies Record<ToastTone, unknown>

/* Roles, never colours. The app repaints these by redefining the token. */
const TONE_CLASS = {
  info: 'text-primary',
  success: 'text-positive',
  warning: 'text-warning',
  danger: 'text-negative',
} as const satisfies Record<ToastTone, string>
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <!--
      `polite`, not `assertive`, and it is a considered choice: a toast reports
      something that already happened, and interrupting a screen reader
      mid-sentence to say "saved" is ruder than waiting. A failure the reader
      must act on belongs in a `BaseAlert` beside the thing that failed.

      `role="status"` rather than `role="log"` so the whole region is read when
      it changes, not only the appended line.
    -->
    <div
      class="pointer-events-none fixed inset-x-0 z-[100] flex flex-col items-center gap-2 px-4"
      :class="bottom ? 'bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))]' : 'top-0 pt-4'"
      role="status"
      aria-live="polite"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="border-hair bg-surface text-ink rounded-card pointer-events-auto flex w-full max-w-sm items-start gap-3 border p-3 shadow-lg"
          @mouseenter="pause(toast.id)"
          @mouseleave="resume(toast.id)"
          @focusin="pause(toast.id)"
          @focusout="resume(toast.id)"
        >
          <component
            :is="ICON[toast.tone]"
            class="mt-0.5 size-5 shrink-0"
            :class="TONE_CLASS[toast.tone]"
            aria-hidden="true"
          />

          <p class="flex-1 text-sm leading-snug">{{ toast.message }}</p>

          <BaseButton
            variant="quiet"
            icon
            pill
            size="sm"
            class="-my-1 shrink-0"
            :aria-label="closeLabel"
            @click="dismiss(toast.id)"
          >
            <X class="size-4" />
          </BaseButton>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* Movement is small and downward from the top, upward from the bottom — the
   direction it came from either way. */
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 200ms ease-out,
    transform 200ms ease-out;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* Leaving is taken out of flow so the ones below close the gap smoothly
   instead of jumping when it unmounts. */
.toast-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition-duration: 1ms;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
