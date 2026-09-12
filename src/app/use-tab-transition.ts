import { computed, readonly, ref } from 'vue'

/** Which way the screens slide during a tab change. */
export type SlideDirection = 'forward' | 'backward' | 'none'

/**
 * Which way a tabbed app is moving.
 *
 * A phone app slides sideways between its tabs, and the direction has to come
 * from somewhere: going from the second tab to the fourth is forward, the
 * other way is back, and arriving from nowhere is neither. That is index
 * arithmetic over the tab order, and it was written twice, identically, in the
 * two phone apps this kit came from — thirty-four lines each, byte for byte
 * the same.
 *
 * Generic over the tab key, so the app keeps its own union and the kit never
 * learns what a tab is called.
 *
 * @example
 * ```ts
 * // shared/lib/tabs.ts
 * export const tabs = createTabTransition(['today', 'week', 'year', 'profile'] as const)
 *
 * // the router guard
 * router.afterEach((to, from) => tabs.resolve(to.meta.tab, from.meta.tab))
 *
 * // App.vue
 * const name = computed(() =>
 *   tabs.direction.value === 'none' ? '' : `slide-${tabs.direction.value}`,
 * )
 * ```
 *
 * The `slide-forward-*` and `slide-backward-*` classes those names refer to
 * ship in `rei-kit/shell/mobile.css`.
 */
export function createTabTransition<K extends string>(order: readonly K[]) {
  const direction = ref<SlideDirection>('none')
  let override: SlideDirection | null = null

  return {
    /** Direction of the current tab change. Read by the route transition. */
    direction: readonly(direction),

    /**
     * The `<Transition>` name for the current direction, ready to bind.
     *
     * Empty when there is nothing to slide, which is how a `<Transition>` is
     * told to do nothing — an unnamed transition still runs a default `v-*`
     * animation, so the empty string matters.
     *
     * Both phone apps derived this from `direction` in their `App.vue`, in the
     * same three lines, and the names match the classes shipped in
     * `rei-kit/shell/mobile.css`.
     */
    name: computed(() => (direction.value === 'none' ? '' : `slide-${direction.value}`)),

    /**
     * Resolves the direction for a navigation. Call once per route change.
     *
     * @param to - Tab being entered, if the route has one.
     * @param from - Tab being left, if the route had one.
     */
    resolve(to: K | undefined, from: K | undefined): void {
      if (override) {
        direction.value = override
        override = null

        return
      }

      if (!to || !from || to === from) {
        direction.value = 'none'

        return
      }

      direction.value = order.indexOf(to) > order.indexOf(from) ? 'forward' : 'backward'
    },

    /**
     * Forces the next navigation's direction, whatever the indices say.
     *
     * For the navigations that are not a tab change at heart: going back from
     * a detail screen, or being sent to sign-in. Without it, leaving a detail
     * page under the fourth tab for the first tab slides backward, which is
     * right, and arriving there slides forward, which is not.
     */
    force(next: SlideDirection): void {
      override = next
    },
  }
}
