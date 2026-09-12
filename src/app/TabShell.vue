<script setup lang="ts">
/**
 * The phone frame the whole app sits inside.
 *
 * On a phone this is invisible — the shell fills the screen and there is
 * nothing around it. On a desktop it is the bordered, rounded card in the
 * middle of a textured field, which is what makes a phone-shaped app look
 * deliberate on a wide screen rather than stretched or abandoned.
 *
 * Both phone apps had this at 120 lines, differing in the product name, two
 * colour variables and one hover colour. None of those is a reason to own a
 * frame, so the colours are custom properties and the name is a slot.
 *
 * ## What stays in the app
 *
 * Which layout a route uses, and the `RouterView` inside it. That is the one
 * part that genuinely differs — an app with no auth screens has no layout
 * switch — and it is also the part that must stay in the app so a page that
 * throws does not take the tab bar with it.
 *
 * @example
 * ```vue
 * <TabShell>
 *   <template #aside><AppCredits /></template>
 *   <template #chrome><UpdatePrompt /></template>
 *
 *   <component :is="layoutComponent">
 *     <RouterView v-slot="{ Component, route }">
 *       <Transition :name="tabTransition.name.value">
 *         <component :is="Component" :key="route.path" :class="pageClass" />
 *       </Transition>
 *     </RouterView>
 *   </component>
 * </TabShell>
 * ```
 */
defineSlots<{
  /**
   * Beside the shell, on a desktop only. Credits, a build number, a link home.
   *
   * Hidden below `md` rather than left out: on a phone the shell covers the
   * whole viewport, so anything here would be behind it.
   */
  aside?: () => unknown
  /**
   * Inside the shell and above everything in it — an update prompt, typically.
   *
   * Above the tab bar on purpose, and outside the layout so it also appears on
   * the sign-in screens, which is where somebody who has been away the longest
   * arrives.
   */
  chrome?: () => unknown
  /** The layout and the page. */
  default: () => unknown
}>()
</script>

<template>
  <div class="rk-screen">
    <aside v-if="$slots.aside" class="rk-screen-aside">
      <slot name="aside" />
    </aside>

    <div class="shell-frame rk-shell">
      <slot name="chrome" />
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* A barely-there diamond lattice, so the area around the shell is not a flat
   slab. Both layers are theme colours at very low alpha, so it reads as texture
   rather than decoration and inverts with the theme for free.

   The colour is a custom property because it is the one thing each app wants
   different: set `--rk-lattice` on any ancestor. It defaults to the ink colour,
   which is legible against every theme the tokens can produce. */
.rk-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-canvas);
  background-image:
    repeating-linear-gradient(
      45deg,
      color-mix(
          in srgb,
          var(--rk-lattice, var(--color-ink)) var(--rk-lattice-alpha, 5%),
          transparent
        )
        0 1px,
      transparent 1px 56px
    ),
    repeating-linear-gradient(
      -45deg,
      color-mix(
          in srgb,
          var(--rk-lattice, var(--color-ink)) var(--rk-lattice-alpha, 5%),
          transparent
        )
        0 1px,
      transparent 1px 56px
    );
}

.rk-screen-aside {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 11px;
  color: var(--color-ink-soft);
}

@media (min-width: 48rem) {
  .rk-screen-aside {
    display: flex;
  }
}

/* `shell-frame` from `rei-kit/shell/mobile.css` supplies the geometry — the
   430px column and the desktop height. This adds only the surface. */
.rk-shell {
  position: relative;
  margin: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-surface);
}

@media (min-width: 48rem) {
  .rk-shell {
    border: 1px solid var(--color-hair);
    border-radius: var(--radius-shell);
    box-shadow:
      0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
  }
}
</style>
