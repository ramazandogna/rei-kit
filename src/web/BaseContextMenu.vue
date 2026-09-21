<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

import { useMenuKeys } from '../composables/use-menu-keys'

/**
 * The menu a right-click opens, on whatever it was opened over.
 *
 * ## The keyboard is the whole difficulty
 *
 * A right-click menu is trivial to draw and easy to ship broken, because
 * the thing that breaks is invisible to the person writing it: there is no
 * mouse in it. The platform's own answer is **Shift+F10**, and on keyboards
 * that have one, the **Menu** key — both of which this listens for, on the
 * area itself. A context menu without them is a set of actions that simply
 * do not exist for anyone not holding a mouse, and nothing on screen says
 * so.
 *
 * Opened that way there is no pointer to anchor to, so it opens at the
 * focused element instead of at coordinates nobody chose.
 *
 * ## It is a menu, with everything that promises
 *
 * `role="menu"` is a contract: the arrows move, Home and End go to the
 * ends, Escape closes, and Tab *leaves*. That is `useMenuKeys`, the same
 * one `BaseMenu` uses — a menu hung off a pointer and a menu hung off a
 * button are the same keyboard and two different positions, and only the
 * position is worth writing twice.
 *
 * ## The items are yours
 *
 * The kit draws no actions: they arrive in the slot as
 * `<button role="menuitem">`, because their words, their order and what
 * they do are the app's, and a kit that guessed them would be wrong in
 * every app.
 */
const { label, disabled = false } = defineProps<{
  /** Names the menu for a screen reader. Already translated. */
  label: string
  /** Leaves the browser's own menu alone — for a text field, or a link. */
  disabled?: boolean | undefined
}>()

defineSlots<{
  /**
   * What the menu belongs to: a row, a canvas, a card.
   *
   * `props` carries the ARIA that says a menu is here. Spread it onto the
   * element a reader actually lands on, the same way `BasePopover` hands a
   * trigger its props.
   *
   * That element has to be one whose role takes these attributes — a
   * `button`, or a `row`, `gridcell`, `treeitem`, `tab`. It is not the
   * wrapper, and `tabindex` on a `div` does not make it one: focusable and
   * "has a role that supports `aria-expanded`" are different things, and
   * the second is what a reader is told. Writing them anywhere else puts
   * an attribute on the page that a browser is entitled to ignore, which
   * is worse than leaving them off, because it looks done.
   */
  default: (props: {
    props: { 'aria-haspopup'?: 'menu'; 'aria-expanded'?: boolean; 'aria-controls'?: string }
  }) => unknown
  /** The actions, each a `[role="menuitem"]`. */
  items: (props: { close: () => void }) => unknown
}>()

const id = useId()
const open = ref(false)
const at = ref({ x: 0, y: 0 })
const area = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)

/* Who had focus when it opened. A menu that closes should give focus back
   to the row you opened it on, not drop it on the body -- and where it
   goes back to is not always the area itself. */
let restoreTo: HTMLElement | null = null

function close() {
  open.value = false
}

/* Handed to the app's own element rather than written on the wrapper: a
   plain `div` may not carry `aria-expanded`, and the kit does not know
   which thing inside is the one a reader is on. */
const triggerProps = computed(() =>
  disabled
    ? {}
    : {
        'aria-haspopup': 'menu' as const,
        'aria-expanded': open.value,
        ...(open.value ? { 'aria-controls': id } : {}),
      },
)

const { items, onKeydown: onMenuKeydown } = useMenuKeys({ panel, onClose: close })

/**
 * Keeps the panel on screen.
 *
 * A menu opened near the right or bottom edge would otherwise run off it,
 * and the items past the edge cannot be reached with a pointer at all. It
 * flips rather than clamps, because a menu that slides back over the point
 * you clicked hides what you were acting on.
 */
function place(x: number, y: number) {
  const width = panel.value?.offsetWidth ?? 0
  const height = panel.value?.offsetHeight ?? 0
  const room = { w: window.innerWidth, h: window.innerHeight }

  at.value = {
    x: x + width > room.w ? Math.max(0, x - width) : x,
    y: y + height > room.h ? Math.max(0, y - height) : y,
  }
}

async function openAt(x: number, y: number) {
  if (disabled) return

  restoreTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
  open.value = true

  await nextTick()
  // After the panel exists, so its size is known and the flip is a
  // measurement rather than a guess.
  place(x, y)
  items()[0]?.focus()
}

function onContextMenu(event: MouseEvent) {
  if (disabled) return

  event.preventDefault()
  void openAt(event.clientX, event.clientY)
}

/**
 * Shift+F10 and the Menu key, which is how this is opened without a mouse.
 *
 * Anchored to the focused element rather than to coordinates, because there
 * is no pointer to take them from.
 */
function onAreaKeydown(event: KeyboardEvent) {
  const wanted = event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)
  if (!wanted || disabled) return

  event.preventDefault()

  const target = event.target instanceof HTMLElement ? event.target : area.value
  const box = target?.getBoundingClientRect()
  void openAt(box?.left ?? 0, box ? box.bottom : 0)
}

function onPanelKeydown(event: KeyboardEvent) {
  onMenuKeydown(event)
}

function onDocumentPointer(event: Event) {
  if (panel.value && !panel.value.contains(event.target as Node)) close()
}

/*
 * A right-click somewhere else closes this one.
 *
 * Not one inside our own area: that is the area's own handler moving the
 * menu to the new point, and closing here would race it — the menu opened
 * and shut again in the same gesture, which looked like right-click simply
 * not working the second time.
 */
function onDocumentContextMenu(event: MouseEvent) {
  const target = event.target as Node
  if (panel.value?.contains(target) || area.value?.contains(target)) return

  close()
}

watch(open, async (isOpen) => {
  if (typeof document === 'undefined') return

  if (isOpen) {
    document.addEventListener('pointerdown', onDocumentPointer)
    document.addEventListener('contextmenu', onDocumentContextMenu)
    window.addEventListener('resize', close)
    // A menu pinned to a point on the page has to go when the page moves
    // under it, or it points at nothing.
    window.addEventListener('scroll', close, true)
    await nextTick()
  } else {
    document.removeEventListener('pointerdown', onDocumentPointer)
    document.removeEventListener('contextmenu', onDocumentContextMenu)
    window.removeEventListener('resize', close)
    window.removeEventListener('scroll', close, true)
    // Only when focus is still inside: otherwise it is closing *because*
    // the reader went somewhere else, and dragging them back is rude.
    if (panel.value?.contains(document.activeElement)) restoreTo?.focus()
    restoreTo = null
  }
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return

  document.removeEventListener('pointerdown', onDocumentPointer)
  document.removeEventListener('contextmenu', onDocumentContextMenu)
  window.removeEventListener('resize', close)
  window.removeEventListener('scroll', close, true)
})

defineExpose({ close })
</script>

<template>
  <div ref="area" class="rk-ctx-area" @contextmenu="onContextMenu" @keydown="onAreaKeydown">
    <slot :props="triggerProps" />

    <Teleport to="body">
      <div
        v-if="open"
        :id="id"
        ref="panel"
        class="rk-ctx-panel surface-overlay"
        role="menu"
        :aria-label="label"
        :style="{ left: `${at.x}px`, top: `${at.y}px` }"
        @keydown="onPanelKeydown"
      >
        <slot name="items" :close="close" />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.rk-ctx-area {
  /*
   * A real box, not `display: contents`.
   *
   * `contents` would have kept the app's layout untouched, and it also
   * drops the element from the accessibility tree in some browsers --
   * taking `aria-haspopup` with it, silently. So this renders a plain
   * block, and the class is the app's to change.
   */
  display: block;
}

.rk-ctx-panel {
  position: fixed;
  z-index: 60;
  min-width: 11rem;
  padding: 0.25rem;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-overlay);
}
</style>

<style>
/* Unscoped: the items come from the app's slot, so a scoped rule would not
   reach them. Named off the panel rather than on their own, so this cannot
   paint a menu item somewhere else on the page. */
.rk-ctx-panel [role='menuitem'] {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--radius-cell);
  padding: 0.5rem 0.625rem;
  text-align: start;
  font-size: 0.875rem;
  color: var(--color-ink);
}

.rk-ctx-panel [role='menuitem']:hover:not(:disabled),
.rk-ctx-panel [role='menuitem']:focus-visible {
  background: var(--color-muted);
}

.rk-ctx-panel [role='menuitem']:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.rk-ctx-panel [role='menuitem']:disabled {
  opacity: 0.45;
}

.rk-ctx-panel hr {
  margin: 0.25rem 0;
  border: 0;
  border-block-start: 1px solid var(--color-hair);
}
</style>
