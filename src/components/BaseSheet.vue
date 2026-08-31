<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

import { useVisualViewport } from '../composables/use-visual-viewport'

const open = defineModel<boolean>({ required: true })
const {
  title,
  subtitle = '',
  closeLabel = 'Close',
} = defineProps<{
  title: string
  subtitle?: string
  /**
   * Accessible name for the close button.
   *
   * A prop rather than a translation: a component that calls t() forces every
   * consumer onto one i18n setup, and this is the package's only visible string.
   */
  closeLabel?: string
}>()

const viewport = useVisualViewport()

/**
 * Pins the sheet to the area the keyboard has left visible.
 *
 * Only needed where the layout viewport does not shrink on its own — iOS. On
 * Android the numbers already agree, so this is a no-op there rather than a
 * second, competing adjustment.
 */
const viewportStyle = computed(() =>
  viewport.value
    ? { height: `${viewport.value.height}px`, top: `${viewport.value.offsetTop}px` }
    : undefined,
)

const panel = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null

function close() {
  open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(open, async (isOpen) => {
  if (isOpen) {
    setBackgroundInert(true)
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    panel.value?.focus()
  } else {
    window.removeEventListener('keydown', onKeydown)
    lastFocused?.focus()
    lastFocused = null
    setBackgroundInert(false)
  }
})

/**
 * `inert` takes the whole app out of tab order and pointer events while the
 * sheet is open — a real focus trap without keydown bookkeeping.
 *
 * The sheet itself is teleported to `#sheet-root`, a sibling of `#app`, so it
 * stays interactive.
 */
function setBackgroundInert(isInert: boolean) {
  document.getElementById('app')?.toggleAttribute('inert', isInert)
}

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  // Unmounting while open would otherwise leave the whole app inert forever.
  setBackgroundInert(false)
})
</script>

<template>
  <Teleport to="#sheet-root">
    <Transition name="sheet">
      <div
        v-if="open"
        class="fixed inset-x-0 top-0 bottom-0 z-50 flex items-center justify-center"
        :style="viewportStyle"
      >
        <div
          class="shell-frame md:rounded-shell relative flex max-h-full flex-col justify-end overflow-hidden"
        >
          <div class="bg-ink/45 absolute inset-0 backdrop-blur-[2px]" @click="close" />

          <!-- Header and footer stay put; only the slot scrolls. Sized in dvh so
               the on-screen keyboard shrinks the sheet instead of pushing its
               content out of reach. -->
          <section
            ref="panel"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
            tabindex="-1"
            class="sheet-panel bg-surface relative flex max-h-[94%] min-h-[56dvh] flex-col rounded-t-[28px] shadow-2xl outline-none"
          >
            <div class="flex shrink-0 justify-center pt-3" aria-hidden="true">
              <span class="bg-hair h-1.5 w-10 rounded-full" />
            </div>

            <header class="flex shrink-0 items-start gap-3 px-6 pt-4 pb-5">
              <div class="min-w-0 flex-1">
                <h2 class="text-ink text-xl leading-tight font-semibold">{{ title }}</h2>
                <p v-if="subtitle" class="text-ink-soft mt-1 text-sm leading-snug">
                  {{ subtitle }}
                </p>
              </div>

              <button
                type="button"
                class="text-ink-soft hover:bg-muted hover:text-ink -mt-1 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors active:scale-90"
                :aria-label="closeLabel"
                @click="close"
              >
                <X class="size-5" />
              </button>
            </header>

            <div
              class="min-h-0 flex-1 overflow-y-auto px-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
            >
              <slot />
            </div>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 200ms ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

/* The panel travels further than the scrim fades, which is what makes the
   sheet read as rising rather than appearing. */
.sheet-enter-active .sheet-panel,
.sheet-leave-active .sheet-panel {
  transition: transform 280ms cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from .sheet-panel,
.sheet-leave-to .sheet-panel {
  transform: translateY(6%);
}

@media (prefers-reduced-motion: reduce) {
  .sheet-enter-from .sheet-panel,
  .sheet-leave-to .sheet-panel {
    transform: none;
  }
}
</style>
