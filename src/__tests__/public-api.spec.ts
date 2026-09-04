import { describe, expect, it } from 'vitest'

import * as kit from '../index'

/**
 * The package's promise, written down.
 *
 * Removing or renaming an export is a breaking change for every consumer, and
 * nothing else in this repo would notice — the kit compiles perfectly well
 * without an export nobody here calls. Adding to this list is routine; removing
 * from it should make someone stop and bump the major version.
 */
const PUBLIC_API = [
  'VERSION',
  // utils
  'addDays',
  'eachDayOfYear',
  'formatDate',
  'fromDateKey',
  'lastNDays',
  'leadingBlanks',
  'relativeDayLabel',
  'setFormatLocale',
  'startOfWeek',
  'toDateKey',
  'todayKey',
  'downloadJson',
  'safeRedirect',
  'tapFeedback',
  'isApplePortable',
  'isInstalled',
  'needsIosInstall',
  'AppError',
  'registerErrorMapper',
  'toAppError',
  // composables
  'applyTheme',
  'isThemePreference',
  'readStoredTheme',
  'setThemeStorageKey',
  'useTheme',
  'useToday',
  'useOnline',
  'useDebouncedCallback',
  'useDragScroll',
  'useVisualViewport',
  // components
  'BaseButton',
  'BaseInput',
  'BaseSheet',
  'EmptyState',
  'GoogleButton',
  'LocaleLinks',
  'PageHeader',
  'PriceCard',
  'SectionHeading',
  'SegmentedControl',
  'SettingsGroup',
  'SettingsRow',
  'SkeletonList',
  'StatCard',
  'TabBar',
  'ToneDot',
  // i18n
  'createI18nRuntime',
].sort()

describe('public API', () => {
  it('exports exactly what it promises', () => {
    expect(Object.keys(kit).sort()).toEqual(PUBLIC_API)
  })
})
