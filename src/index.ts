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

export const VERSION = '0.0.0'

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
export { applyTheme, readStoredTheme, setThemeStorageKey, useTheme } from './composables/use-theme'
export type { ThemePreference } from './composables/use-theme'

export { useToday } from './composables/use-today'
export { useOnline } from './composables/use-online'
export { useDebouncedCallback } from './composables/use-debounced-callback'
export { useDragScroll } from './composables/use-drag-scroll'
export { useVisualViewport } from './composables/use-visual-viewport'
export type { VisualViewportRect } from './composables/use-visual-viewport'
