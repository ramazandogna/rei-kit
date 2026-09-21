<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from 'vue'

/**
 * A card that appears beside something when you rest on it.
 *
 * ## `BaseHoverCard` or `BaseTooltip`
 *
 * A tooltip is a sentence naming what a control does, and it is wired with
 * `aria-describedby` — which flattens whatever is inside it to text. That
 * is right for a sentence and wrong for anything else: a card holding a
 * name, an avatar and a link would be read as one run-on string, and the
 * link inside it could not be reached at all.
 *
 * So this is not a described-by bubble. The trigger says a popup is there
 * with `aria-expanded` and `aria-controls`; the card is an ordinary region
 * of the page that happens to be revealed, and everything inside it stays
 * reachable.
 *
 * Reach for the tooltip when the answer is a sentence. Reach for this when
 * the answer is a *thing* — a profile, a preview of what a link leads to, a
 * definition with a source.
 *
 * ## The pointer has to be able to get there
 *
 * A card that vanishes the moment the pointer leaves the trigger is a card
 * whose contents can never be used: the gap between the two is enough to
 * close it. So leaving starts a delay rather than closing, and entering the
 * card cancels it. That delay is the whole reason this is a component
 * instead of two CSS rules.
 *
 * ## It opens without a pointer too
 *
 * Focus opens it, with no delay — waiting makes sense for a pointer sweeping
 * across a page, and no sense for somebody who deliberately tabbed onto it.
 * Escape closes it while leaving focus where it is, so a keyboard is never
 * stuck with a card in the way.
 *
 * A hover card is supplementary by definition: everything in it has to be
 * reachable some other way, because a touch screen has no hover at all.
 */
const {
  label,
  openDelay = 300,
  closeDelay = 200,
  placement = 'bottom',
} = defineProps<{
  /** Names the card for a screen reader. Already translated. */
  label: string
  /** How long a pointer has to rest before it opens, in ms. */
  openDelay?: number | undefined
  /** How long it survives the pointer leaving, so the card can be reached. */
  closeDelay?: number | undefined
  placement?: 'top' | 'bottom' | undefined
}>()

defineSlots<{
  /** The thing being rested on. `props` says a popup is here. */
  default: (props: {
    props: { 'aria-expanded': boolean; 'aria-controls': string | undefined }
  }) => unknown
  /** What appears: a profile, a preview, a definition. */
  card: () => unknown
}>()

const id = useId()
const open = ref(false)

/* One timer for both directions: opening while a close is pending has to
   cancel it, or the card shuts a moment after it was asked to stay. */
let timer: ReturnType<typeof setTimeout> | undefined

function clear() {
  if (timer !== undefined) clearTimeout(timer)
  timer = undefined
}

function schedule(next: boolean, delay: number) {
  clear()
  if (open.value === next) return

  // Zero waits a tick rather than firing synchronously, so an enter that
  // follows a leave in the same gesture still cancels it.
  timer = setTimeout(() => {
    open.value = next
    timer = undefined
  }, delay)
}

const show = () => schedule(true, openDelay)
const hide = () => schedule(false, closeDelay)

/** Focus is deliberate, so it skips the wait a sweeping pointer needs. */
function showNow() {
  clear()
  open.value = true
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return

  // Focus is left where it is: this closes a card that is in the way, and
  // moving focus as well would take the reader somewhere they did not ask
  // to go.
  event.stopPropagation()
  clear()
  open.value = false
}

/*
 * Focus leaving the whole thing closes it, and focus moving *inside* it
 * does not. `focusout` fires for both, so the one that matters is whether
 * what took focus is still in here.
 */
function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget
  if (next instanceof Node && (event.currentTarget as HTMLElement).contains(next)) return

  clear()
  open.value = false
}

const triggerProps = computed(() => ({
  'aria-expanded': open.value,
  'aria-controls': open.value ? id : undefined,
}))

// A timer outliving the component would set a ref on something that is gone.
onBeforeUnmount(clear)
</script>

<template>
  <div
    class="rk-hovercard"
    @pointerenter="show"
    @pointerleave="hide"
    @focusin="showNow"
    @focusout="onFocusOut"
    @keydown="onKeydown"
  >
    <slot :props="triggerProps" />

    <div
      v-if="open"
      :id="id"
      class="rk-hovercard-panel surface-raised"
      :class="`is-${placement}`"
      role="group"
      :aria-label="label"
    >
      <slot name="card" />
    </div>
  </div>
</template>

<style scoped>
.rk-hovercard {
  position: relative;
  display: inline-flex;
}

.rk-hovercard-panel {
  position: absolute;
  z-index: 40;
  inset-inline-start: 0;
  width: max-content;
  max-width: 20rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-overlay);
}

/*
 * The card sits a little off the trigger, and the gap is bridged.
 *
 * Crossing that gap leaves the trigger without yet entering the card, which
 * starts the close. `closeDelay` already covers a pointer moving at any
 * normal speed, but the bridge means the pointer never actually leaves:
 * a transparent strip, part of the panel, fills the space. Belt and braces,
 * because the failure it prevents -- a card whose contents cannot be
 * reached -- is total rather than cosmetic.
 */
.rk-hovercard-panel::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  height: 0.5rem;
}

.rk-hovercard-panel.is-bottom::before {
  top: -0.5rem;
}

.rk-hovercard-panel.is-top::before {
  bottom: -0.5rem;
}

.rk-hovercard-panel.is-bottom {
  top: 100%;
  margin-block-start: 0.5rem;
}

.rk-hovercard-panel.is-top {
  bottom: 100%;
  margin-block-end: 0.5rem;
}
</style>
