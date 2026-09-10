/**
 * rei-kit/app — the parts a phone app is made of.
 *
 * Separate from the main entry because these are not primitives: they assume
 * an app with tabs, an account and a sign-in screen. A wide site importing the
 * kit should not have to know they exist.
 *
 * Everything here came out of two apps that had written it identically —
 * `AuthShell` was thirty-seven lines with no difference at all between them,
 * the tab transition thirty-four. What differs between two phone apps is the
 * product; this is the part underneath it.
 */
export { default as AuthShell } from './AuthShell.vue'

export { createTabTransition } from './use-tab-transition'
export type { SlideDirection } from './use-tab-transition'

export { useThemeSync } from './use-theme-sync'
