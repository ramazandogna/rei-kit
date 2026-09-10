<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

import BaseButton from '../components/BaseButton.vue'

/**
 * The frame an onboarding guide runs inside.
 *
 * Both phone apps had this, 296 lines, 94% identical — and what differed was
 * every part that should: the slides, the wash colours, the illustrations. What
 * did not differ is here.
 *
 * The parts that are easy to get wrong and were written twice:
 *
 * - **`inert` on the app behind it.** Without it, Tab walks into a screen the
 *   reader cannot see. The same trick `BaseSheet` uses, and it has to be undone
 *   on unmount or the whole app stays inert forever.
 * - **Focusing the dialog**, which is the only reason the arrow keys work.
 * - **The direction.** A guide that can jump to slide two from slide seven has
 *   to animate backwards, so the transition name follows the index rather than
 *   the button that was pressed.
 * - **A segmented track, not dots.** Ten slides is a sequence with a length,
 *   and the reader deserves to see how much is left.
 *
 * Every string is a prop and the slide is a slot: the kit renders the frame and
 * knows nothing about what is being explained.
 */
const {
  index,
  total,
  dialogLabel,
  skipLabel,
  backLabel,
  nextLabel,
  lastLabel,
  stepLabel,
  teleportTo = 'body',
} = defineProps<{
  /** Which slide, zero-based. */
  index: number
  total: number
  /** The dialog's accessible name. */
  dialogLabel: string
  skipLabel: string
  backLabel: string
  nextLabel: string
  /** The button on the final slide — "Start", rather than "Next". */
  lastLabel: string
  /** Names one segment for a screen reader, e.g. `(n) => \`Step ${n} of ${total}\``. */
  stepLabel: (position: number) => string
  /**
   * Where the dialog goes. A phone shell clips its children, so the guide has
   * to leave the tree to cover the tab bar and the header alike.
   */
  teleportTo?: string | undefined
}>()

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{ next: []; back: []; dismiss: []; goTo: [position: number] }>()

const dialog = ref<HTMLElement | null>(null)

/** Direction, so a jump backwards still animates backwards. */
const transitionName = ref('tour-forward')

watch(
  () => index,
  (next, previous) => {
    transitionName.value = next >= previous ? 'tour-forward' : 'tour-backward'
  },
)

const isLast = computed(() => index >= total - 1)

/* `immediate`, because a layout that mounts this only once the guide has been
   asked for would otherwise have the first `true` predate the watcher. */
watch(
  open,
  async (isOpen) => {
    if (typeof document === 'undefined') return

    document.getElementById('app')?.toggleAttribute('inert', isOpen)
    if (!isOpen) return

    await nextTick()
    dialog.value?.focus()
  },
  { immediate: true },
)

onUnmounted(() => {
  if (typeof document !== 'undefined') document.getElementById('app')?.removeAttribute('inert')
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') emit('next')
  if (event.key === 'ArrowLeft') emit('back')
  if (event.key === 'Escape') emit('dismiss')
}
</script>

<template>
  <Teleport :to="teleportTo">
    <Transition name="tour" appear>
      <div
        v-if="open"
        ref="dialog"
        class="fixed inset-0 z-[60] flex items-center justify-center outline-none"
        role="dialog"
        aria-modal="true"
        :aria-label="dialogLabel"
        tabindex="-1"
        @keydown="onKeydown"
      >
        <div class="shell-frame md:rounded-shell bg-canvas relative flex flex-col overflow-hidden">
          <!-- Behind everything: the app's mood for this slide. -->
          <slot name="wash" />

          <header class="relative flex shrink-0 items-center justify-between gap-3 px-6 pt-6">
            <span class="text-ink-soft text-xs font-semibold tabular-nums">
              {{ stepLabel(index + 1) }}
            </span>

            <BaseButton pill size="sm" variant="quiet" @click="$emit('dismiss')">
              {{ skipLabel }}
            </BaseButton>
          </header>

          <!-- min-h-0 keeps the body inside the shell, so a long slide scrolls
               here rather than pushing the buttons off the bottom. -->
          <div
            class="relative flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-6 py-6"
          >
            <Transition :name="transitionName" mode="out-in">
              <slot :index="index" />
            </Transition>
          </div>

          <footer
            class="relative flex shrink-0 flex-col gap-4 px-6 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
          >
            <!-- A segmented track rather than dots: ten slides is a sequence
                 with a length, and the reader deserves to see how much is left. -->
            <div
              class="-my-2 flex items-center gap-1"
              role="tablist"
              :aria-label="stepLabel(index + 1)"
            >
              <BaseButton
                v-for="position in total"
                :key="position"
                variant="unstyled"
                role="tab"
                :aria-selected="position - 1 === index"
                :aria-label="stepLabel(position)"
                class="group flex flex-1 items-center py-2.5"
                @click="$emit('goTo', position - 1)"
              >
                <span
                  class="h-1 w-full rounded-full transition-colors duration-300"
                  :class="
                    position - 1 <= index ? 'bg-primary' : 'bg-hair group-hover:bg-ink-soft/40'
                  "
                />
              </BaseButton>
            </div>

            <div class="flex gap-2">
              <BaseButton
                v-if="index > 0"
                variant="ghost"
                class="shrink-0 px-5"
                @click="$emit('back')"
              >
                {{ backLabel }}
              </BaseButton>

              <BaseButton class="flex-1" @click="$emit('next')">
                {{ isLast ? lastLabel : nextLabel }}
              </BaseButton>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* The dialog's own fade. The *slide* transition is not here: a scoped rule
   cannot reach slot content, which belongs to the caller's scope, so
   `.tour-forward-*` and `.tour-backward-*` ship unscoped in
   `rei-kit/shell/mobile.css` where the caller's slide can actually see them. */
.tour-enter-active,
.tour-leave-active {
  transition: opacity 220ms ease;
}

.tour-enter-from,
.tour-leave-to {
  opacity: 0;
}
</style>
