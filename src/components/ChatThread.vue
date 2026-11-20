<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, useSlots } from 'vue'

import BaseButton from './BaseButton.vue'

/**
 * The scrolling list of messages in a conversation.
 *
 * It is a `role="log"`: new messages are announced politely as they are added,
 * and nothing is re-read. It keeps you at the bottom as messages arrive — but
 * only if you were already there. Scroll up to read something and it leaves you
 * alone and offers a "jump to latest" button instead, so a reply never yanks
 * the page out from under a reader.
 *
 * While `busy` it shows three pulsing dots (and says `typingLabel` to screen
 * readers). Reduced motion gets still dots.
 *
 * @example
 * ```vue
 * <ChatThread label="Conversation" :busy="waiting">
 *   <ChatMessage from="user">Hi</ChatMessage>
 * </ChatThread>
 * ```
 */
const {
  label,
  busy = false,
  typingLabel = 'Assistant is typing',
  jumpLabel = 'Jump to latest',
  emptyLabel = undefined,
} = defineProps<{
  label: string
  /** The assistant is typing. */
  busy?: boolean | undefined
  typingLabel?: string | undefined
  jumpLabel?: string | undefined
  /** Shown when there are no messages. */
  emptyLabel?: string | undefined
}>()

defineSlots<{
  default?: () => unknown
  empty?: () => unknown
  /** Replaces the dots. */
  typing?: () => unknown
}>()

const slots = useSlots()
const scroller = useTemplateRef<HTMLElement>('scroller')
const away = ref(false)
let atBottom = true
let mo: MutationObserver | null = null

const near = (el: HTMLElement) => el.scrollHeight - el.scrollTop - el.clientHeight <= 80

function toBottom() {
  const el = scroller.value
  if (!el) return
  el.scrollTop = el.scrollHeight
  atBottom = true
  away.value = false
}

function onScroll() {
  const el = scroller.value
  if (!el) return
  atBottom = near(el)
  if (atBottom) away.value = false
}

onMounted(() => {
  const el = scroller.value
  if (!el) return
  toBottom()
  if (typeof MutationObserver === 'undefined') return
  mo = new MutationObserver(() => {
    if (atBottom) void nextTick(toBottom)
    else away.value = true
  })
  mo.observe(el, { childList: true, subtree: true, characterData: true })
})

onBeforeUnmount(() => mo?.disconnect())
</script>

<template>
  <div class="ct">
    <div
      ref="scroller"
      class="ct-scroll"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      :aria-label="label"
      tabindex="0"
      @scroll.passive="onScroll"
    >
      <div v-if="!slots.default && (slots.empty || emptyLabel)" class="ct-empty">
        <slot name="empty">{{ emptyLabel }}</slot>
      </div>
      <slot />
      <div v-if="busy" class="ct-typing">
        <slot name="typing"
          ><span class="ct-dots" aria-hidden="true"><i /><i /><i /></span
        ></slot>
        <span class="sr-only" role="status">{{ typingLabel }}</span>
      </div>
    </div>
    <BaseButton v-if="away" class="ct-jump" size="sm" variant="secondary" @click="toBottom">
      {{ jumpLabel }}
    </BaseButton>
  </div>
</template>

<style scoped>
.ct {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.ct-scroll {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.ct-scroll:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.ct-empty {
  margin: auto;
  color: var(--color-ink-soft);
  font-size: 0.875rem;
  text-align: center;
}

.ct-jump {
  position: absolute;
  inset-block-end: 0.75rem;
  inset-inline-start: 50%;
  translate: -50% 0;
}

.ct-dots {
  display: inline-flex;
  gap: 4px;
  padding: 0.5rem 0;
}
.ct-dots i {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-ink-soft);
  animation: ct-pulse 1.2s ease-in-out infinite;
}
.ct-dots i:nth-child(2) {
  animation-delay: 150ms;
}
.ct-dots i:nth-child(3) {
  animation-delay: 300ms;
}
:where([data-material='brutal']) .ct-dots i {
  border-radius: 0;
  animation-timing-function: steps(2);
}

@keyframes ct-pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ct-dots i {
    animation: none;
    opacity: 1;
  }
}
</style>
