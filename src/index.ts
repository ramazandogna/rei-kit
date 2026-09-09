/**
 * rei-kit — the layer every app starts from.
 *
 * Everything here is free of any backend, router or i18n choice. Components
 * take strings rather than calling a translator, and utilities take the clock
 * rather than reading it, so nothing in this package can force a decision on
 * the app that installs it.
 *
 * @see https://github.com/ramazandogna/rei-kit
 */

/**
 * The published version, replaced at build time from `package.json`.
 *
 * It was a literal `'0.0.0'` and nothing ever rewrote it, so every consumer
 * that imported this — and the showcase, which is how it was noticed — was
 * told the kit was at 0.0.0 whatever it actually was. A symbol in a public API
 * that reports something false is worse than one that is missing: nobody
 * checks a value that looks like it works.
 *
 * The fallback keeps `vitest` and `vite dev` honest, where no define runs.
 */
export const VERSION: string =
  typeof __REI_KIT_VERSION__ === 'string' ? __REI_KIT_VERSION__ : '0.0.0-dev'

// ── Utilities ──────────────────────────────────────────────────────────────
export {
  addDays,
  eachDayOfYear,
  fromDateKey,
  lastNDays,
  leadingBlanks,
  startOfWeek,
  toDateKey,
  todayKey,
} from './utils/date'
export type { WeekStart } from './utils/date'

export { formatDate, setFormatLocale } from './utils/format'
export { relativeDayLabel } from './utils/day-label'
export type { DayLabels } from './utils/day-label'

export { downloadJson } from './utils/download'
export { safeRedirect } from './utils/redirect'
export type { QueryValue } from './utils/redirect'
export { tapFeedback } from './utils/haptics'
export { isApplePortable, isInstalled, needsIosInstall } from './utils/platform'

export { AppError, registerErrorMapper, toAppError } from './utils/app-error'
export type { AppErrorKind, ErrorMapper } from './utils/app-error'

// ── Composables ────────────────────────────────────────────────────────────
export {
  applyTheme,
  isThemePreference,
  readStoredTheme,
  setThemeStorageKey,
  useTheme,
} from './composables/use-theme'
export type { ThemePreference } from './composables/use-theme'

export { useToday } from './composables/use-today'
export { useOnline } from './composables/use-online'
export { useDebouncedCallback } from './composables/use-debounced-callback'
export { useDragScroll } from './composables/use-drag-scroll'
export { useMediaQuery } from './composables/use-media-query'
export { useVisualViewport } from './composables/use-visual-viewport'
export { useToast } from './composables/use-toast'
export type { Toast, ToastOptions, ToastTone } from './composables/use-toast'
export type { VisualViewportRect } from './composables/use-visual-viewport'

// ── Components ─────────────────────────────────────────────────────────────
export { default as BaseAlert } from './components/BaseAlert.vue'
export { default as BaseBadge } from './components/BaseBadge.vue'
export { default as BaseButton } from './components/BaseButton.vue'
export { default as BaseInput } from './components/BaseInput.vue'
export { default as BaseSheet } from './components/BaseSheet.vue'
export { default as BaseCard } from './components/BaseCard.vue'
export { default as BaseCheckbox } from './components/BaseCheckbox.vue'
export { default as BaseRadioGroup } from './components/BaseRadioGroup.vue'
export { default as BaseSelect } from './components/BaseSelect.vue'
export { default as BaseTextarea } from './components/BaseTextarea.vue'
export { default as EmptyState } from './components/EmptyState.vue'
export { default as FormField } from './components/FormField.vue'
export { default as ErrorBoundary } from './components/ErrorBoundary.vue'
export { default as PageContainer } from './components/PageContainer.vue'
export { default as PageHeader } from './components/PageHeader.vue'
export { default as ProgressBar } from './components/ProgressBar.vue'
export { default as PriceCard } from './components/PriceCard.vue'
export { default as SectionHeading } from './components/SectionHeading.vue'
export { default as SegmentedControl } from './components/SegmentedControl.vue'
export { default as SettingsGroup } from './components/SettingsGroup.vue'
export { default as SettingsRow } from './components/SettingsRow.vue'
export { default as SkeletonList } from './components/SkeletonList.vue'
export { default as StatCard } from './components/StatCard.vue'
export { default as ToastHost } from './components/ToastHost.vue'
export { default as ToneDot } from './components/ToneDot.vue'
export type { Tone } from './components/SectionHeading.vue'
export { default as LocaleLinks } from './components/LocaleLinks.vue'
export { default as GoogleButton } from './components/GoogleButton.vue'
export { default as TabBar } from './components/TabBar.vue'
export type { TabItem } from './components/TabBar.vue'

// ── i18n ───────────────────────────────────────────────────────────────────
export { createI18nRuntime } from './i18n/runtime'
export type { I18nRuntimeOptions, LocalePreference } from './i18n/runtime'
