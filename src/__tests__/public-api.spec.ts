import { describe, expect, it } from 'vitest'

import * as kit from '../index'
import * as app from '../app/index'
import * as motion from '../motion/index'
import * as pwa from '../pwa/index'
import * as supabase from '../supabase/index'
import * as web from '../web/index'

/**
 * The package's promise, written down.
 *
 * Removing or renaming an export is a breaking change for every consumer, and
 * nothing else in this repo would notice — the kit compiles perfectly well
 * without an export nobody here calls. Adding to this list is routine; removing
 * from it should make someone stop and bump the major version.
 *
 * ## Every entry, not only the root
 *
 * This guarded `rei-kit` alone for a long time, which read as more than it
 * was: `rei-kit/web` could lose a composable and every check here stayed
 * green. The catalogue test covers the *components* in each entry, because
 * they have to appear in AGENTS.md — but a helper is not a component, and
 * `useInstall`, `createAuthGuard` and `fieldErrors` were each one deletion
 * away from silence.
 *
 * **Type exports are still not guarded here**, and cannot be: these files
 * are excluded from every tsconfig on purpose, so a type imported in this
 * one would not be checked by anything. What holds them is the usage
 * samples, which are type-checked under `strictTemplates`.
 */
const PUBLIC_API = [
  'VERSION',
  // appearance
  'MATERIALS',
  'PALETTES',
  'applyMaterial',
  'applyPalette',
  'isMaterial',
  'isPaletteName',
  'setMaterialStorageKey',
  'setPaletteStorageKey',
  'useMaterial',
  'usePalette',
  // utils
  'addDays',
  'eachDayOfYear',
  'formatDate',
  'formatNumber',
  'fromDateKey',
  'lastNDays',
  'leadingBlanks',
  'relativeDayLabel',
  'setFormatLocale',
  'startOfWeek',
  'toDateKey',
  'todayKey',
  'downloadJson',
  'SHEET_ROOT_ID',
  'ensureSheetRoot',
  'safeRedirect',
  'toRedirectPath',
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
  'useMediaQuery',
  'useVisualViewport',
  'useToast',
  // components
  'BaseAlert',
  'BaseAvatar',
  'BaseBadge',
  'BaseButton',
  'BaseInput',
  'BaseMenu',
  'BaseSheet',
  'BaseSlider',
  'AvatarStack',
  'BaseCalendar',
  'BaseChip',
  'BaseKbd',
  'BaseListbox',
  'BaseLink',
  'BaseRating',
  'BaseSeparator',
  'BaseSkeleton',
  'CopyButton',
  'DescriptionList',
  'FileDrop',
  'TagsInput',
  'TimePicker',
  'BaseDatePicker',
  'BasePopconfirm',
  'BasePopover',
  'BaseStepper',
  'CircularProgress',
  'NumberInput',
  'PinInput',
  'ToggleGroup',
  'BaseSpinner',
  'BaseSwitch',
  'BaseTable',
  'BaseCard',
  'BaseCheckbox',
  'BaseCombobox',
  'BaseRadioGroup',
  'BaseSelect',
  'BaseTextarea',
  'EmptyState',
  'FormField',
  'ErrorBoundary',
  'GoogleButton',
  'LocaleLinks',
  'PageContainer',
  'PageHeader',
  'ProgressBar',
  'PriceCard',
  'SectionHeading',
  'SegmentedControl',
  'SettingsGroup',
  'SettingsRow',
  'SkeletonList',
  'SliderField',
  'StatCard',
  'ToastHost',
  'TabBar',
  'ToneDot',
  // i18n
  'createI18nRuntime',
].sort()

/** `rei-kit/web` — a wide site with a header and a mouse. */
const WEB_API = [
  'BaseAccordion',
  'BaseBreadcrumb',
  'BaseDisclosure',
  'BaseModal',
  'BasePagination',
  'BaseSplitter',
  'BaseTabs',
  'BaseToolbar',
  'BaseTooltip',
  'BaseTree',
  'CommandMenu',
  'DataTable',
  'MegaMenu',
  'NavLinks',
  'ResponsiveDialog',
  'TransferList',
].sort()

/** `rei-kit/app` — a phone-shaped app with tabs and a sign-in screen. */
const APP_API = [
  'AuthForm',
  'AuthShell',
  'FabButton',
  'LocaleSheet',
  'OfflineBanner',
  'TabShell',
  'TourShell',
  'createAuthGuard',
  'createQueryDefaults',
  'createTabTransition',
  'createTitleGuard',
  'createWriteReport',
  'fieldErrors',
  'useThemeSync',
].sort()

/** `rei-kit/pwa` — installing and updating. */
const PWA_API = [
  'InstallPrompt',
  'InstallSettings',
  'UpdatePrompt',
  'useInstall',
  'useSnooze',
  'watchInstallability',
].sort()

/**
 * `rei-kit/supabase` — optional; importing it is the opt-in, and the import
 * itself registers the Postgres error mapping.
 */
const SUPABASE_API = [
  'AUTH_ERROR_CODES',
  'createSupabaseClient',
  'setRememberMe',
  'toAuthMessageKey',
].sort()

/** `rei-kit/motion` — numbers that count, words that change. */
const MOTION_API = [
  'BaseMarquee',
  'BaseReveal',
  'CountUp',
  'NumberTicker',
  'TextRotate',
  'TypeWriter',
].sort()

describe('public API', () => {
  const entries = [
    ['rei-kit', kit, PUBLIC_API],
    ['rei-kit/web', web, WEB_API],
    ['rei-kit/app', app, APP_API],
    ['rei-kit/pwa', pwa, PWA_API],
    ['rei-kit/motion', motion, MOTION_API],
    ['rei-kit/supabase', supabase, SUPABASE_API],
  ] as const

  for (const [name, module, promised] of entries) {
    it(`${name} exports exactly what it promises`, () => {
      expect(Object.keys(module).sort()).toEqual(promised)
    })
  }
})
