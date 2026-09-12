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
export { default as AuthForm } from './AuthForm.vue'
export type { AuthFormLabels, AuthFormValues } from './auth-form'
export { default as AuthShell } from './AuthShell.vue'
export { default as FabButton } from './FabButton.vue'
export { default as LocaleSheet } from './LocaleSheet.vue'
export { default as OfflineBanner } from './OfflineBanner.vue'
export { default as TabShell } from './TabShell.vue'
export { default as TourShell } from './TourShell.vue'

export { createAuthGuard, createTitleGuard } from './guards'
export type { AuthGuardOptions } from './guards'

export { createQueryDefaults } from './query-defaults'
export type { QueryDefaultsOverrides } from './query-defaults'

export { createWriteReport } from './write-report'
export type { WriteReport, WriteReportMessages } from './write-report'

export { fieldErrors } from './field-errors'
export type { SafeParsable } from './field-errors'

export { createTabTransition } from './use-tab-transition'
export type { SlideDirection } from './use-tab-transition'

export { useThemeSync } from './use-theme-sync'
