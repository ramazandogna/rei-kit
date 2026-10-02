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
 *
 * @example
 * ```vue
 * <AuthForm
 *   v-model:remember="remember"
 *   mode="signUp"
 *   :labels="labels"
 *   :busy="busy"
 *   @submit="signUp"
 *   @google="signInWithGoogle"
 * />
 * ```
 */
export { default as AuthForm } from './AuthForm.vue'
export type { AuthFormLabels, AuthFormValues } from './auth-form'
/**
 * The frame every sign-in screen sits in.
 *
 * @example
 * ```vue
 * <AuthShell>
 *   <template #brand>My app</template>
 *
 *   <AuthForm mode="signIn" :labels="labels" @submit="signIn" />
 * </AuthShell>
 * ```
 */
export { default as AuthShell } from './AuthShell.vue'
/**
 * The one action the app is built around, reachable from every screen.
 *
 * @example
 * ```vue
 * <FabButton label="New entry" @click="create">+</FabButton>
 * ```
 */
export { default as FabButton } from './FabButton.vue'
/**
 * Choosing the interface language, from a settings row.
 *
 * @example
 * ```vue
 * <LocaleSheet
 *   v-model="locale"
 *   label="Language"
 *   system-label="Same as device"
 *   :options="[
 *     { value: 'en', label: 'English' },
 *     { value: 'tr', label: 'Türkçe' },
 *   ]"
 *   close-label="Close"
 * />
 * ```
 */
export { default as LocaleSheet } from './LocaleSheet.vue'
/**
 * A floating note that the connection has gone.
 *
 * @example
 * ```vue
 * <OfflineBanner label="You are offline. Changes will sync when you are back." />
 * ```
 */
export { default as OfflineBanner } from './OfflineBanner.vue'
/**
 * The phone frame the whole app sits inside.
 *
 * @example
 * ```vue
 * <TabShell>
 *   <RouterView />
 *
 *   <template #aside>
 *     <p>© 2026 My app</p>
 *   </template>
 * </TabShell>
 * ```
 */
export { default as TabShell } from './TabShell.vue'
/**
 * The frame an onboarding guide runs inside.
 *
 * @example
 * ```vue
 * <TourShell
 *   v-model="open"
 *   :index="step"
 *   :total="3"
 *   dialog-label="Welcome tour"
 *   skip-label="Skip"
 *   back-label="Back"
 *   next-label="Next"
 *   last-label="Start"
 *   :step-label="(n) => `Step ${n}`"
 *   @next="step++"
 *   @back="step--"
 *   @dismiss="open = false"
 * >
 *   <template #default="{ index }">
 *     <h2>Step {{ index + 1 }}</h2>
 *   </template>
 * </TourShell>
 * ```
 */
export { default as TourShell } from './TourShell.vue'

export { createAuthGuard, createRouteAnnouncer, createTitleGuard } from './guards'
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
