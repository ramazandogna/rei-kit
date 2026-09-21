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

export { formatDate, formatNumber, setFormatLocale } from './utils/format'
export { relativeDayLabel } from './utils/day-label'
export type { DayLabels } from './utils/day-label'

export { downloadJson } from './utils/download'
export {
  MATERIALS,
  PALETTES,
  applyMaterial,
  applyPalette,
  isMaterial,
  isPaletteName,
  setMaterialStorageKey,
  setPaletteStorageKey,
  useMaterial,
  usePalette,
} from './utils/appearance'
export type { Material, Palette, PaletteName, PaletteRoles } from './utils/appearance'
export { ensureSheetRoot, SHEET_ROOT_ID } from './utils/sheet-root'
export { safeRedirect, toRedirectPath } from './utils/redirect'
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
export type { Toast, ToastAction, ToastOptions, ToastTone } from './composables/use-toast'
export type { VisualViewportRect } from './composables/use-visual-viewport'

// ── Components ─────────────────────────────────────────────────────────────
/** The person, in the corner where the account lives. */
export { default as BaseAvatar } from './components/BaseAvatar.vue'
/** A message the reader has to take in before carrying on. */
export { default as BaseAlert } from './components/BaseAlert.vue'
/** A small standing label: a level, a state, a count. */
export { default as BaseBadge } from './components/BaseBadge.vue'
/** The kit's button, and — when asked — its link. */
export { default as BaseButton } from './components/BaseButton.vue'
/** A text field with its label, hint and error already wired to it. */
export { default as BaseInput } from './components/BaseInput.vue'
/** A list of actions behind one control. */
export { default as BaseMenu } from './components/BaseMenu.vue'
/** Pins the sheet to the area the keyboard has left visible. */
export { default as BaseSheet } from './components/BaseSheet.vue'
/** A surface with a border, and optionally a head and a foot. */
export { default as BaseCard } from './components/BaseCard.vue'
/** A field you type into to narrow a list, then choose from it. */
export { default as BaseCombobox } from './components/BaseCombobox.vue'
export type { ComboboxOption } from './components/BaseCombobox.vue'
/** A single checkbox, with its label beside it. */
export { default as BaseCheckbox } from './components/BaseCheckbox.vue'
/** A set of radios, and the reason there is no `BaseRadio`. */
export { default as BaseRadioGroup } from './components/BaseRadioGroup.vue'
/** A native `<select>`, wearing the kit's field. */
export { default as BaseSelect } from './components/BaseSelect.vue'
/** A value picked from a range, where roughly right is the point. */
export { default as BaseSlider } from './components/BaseSlider.vue'

/**
 * A slider and a number field on one value: drag to find it, type to land
 * on it. See `SliderField.vue` for why both carry the same name.
 */
export { default as SliderField } from './components/SliderField.vue'
/** Work in progress, with no idea how much is left. */
export { default as BaseSpinner } from './components/BaseSpinner.vue'
/** A setting that takes effect the moment it is touched. */
export { default as BaseSwitch } from './components/BaseSwitch.vue'
/** Rows of data, with the parts a hand-written `<table>` leaves out. */
export { default as BaseTable } from './components/BaseTable.vue'
export type { Column } from './components/BaseTable.vue'
/** A multi-line field. */
export { default as BaseTextarea } from './components/BaseTextarea.vue'
/** A list with nothing in it yet, said kindly. */
export { default as EmptyState } from './components/EmptyState.vue'
/** A label, a hint, an error, and the wiring between them. */
export { default as FormField } from './components/FormField.vue'
/** Keeps one broken screen from taking the whole app down. */
export { default as ErrorBoundary } from './components/ErrorBoundary.vue'
/** One measure, centred, with the page's gutters. */
export { default as PageContainer } from './components/PageContainer.vue'
/** The bar at the top of a screen: a title with room either side of it. */
export { default as PageHeader } from './components/PageHeader.vue'
/** How far through something somebody is. */
export { default as ProgressBar } from './components/ProgressBar.vue'
/** One plan in a pricing table. */
export { default as PriceCard } from './components/PriceCard.vue'
/** A pill heading for a group of things. */
export { default as SectionHeading } from './components/SectionHeading.vue'
/** A row of mutually exclusive choices. */
export { default as SegmentedControl } from './components/SegmentedControl.vue'
/** A titled run of settings rows. */
export { default as SettingsGroup } from './components/SettingsGroup.vue'
/** One line in a settings card. */
export { default as SettingsRow } from './components/SettingsRow.vue'
/** A length starts with a digit, a dot, or opens a CSS function. */
export { default as SkeletonList } from './components/SkeletonList.vue'
/** One number, with what it means and which way it is going. */
export { default as StatCard } from './components/StatCard.vue'
/** Where the toasts land. One of these, at the app root. */
export { default as ToastHost } from './components/ToastHost.vue'
/** A small coloured dot, optionally labelled. */
export { default as ToneDot } from './components/ToneDot.vue'
export type { Tone } from './components/SectionHeading.vue'
/** A flat language switcher for screens with no Settings behind them. */
export { default as LocaleLinks } from './components/LocaleLinks.vue'
/** Sign in with Google, in Google's own clothes. */
export { default as GoogleButton } from './components/GoogleButton.vue'
/** The floating bottom bar. */
export { default as TabBar } from './components/TabBar.vue'
export type { TabItem } from './components/TabBar.vue'
/**
 * `ActivityGrid`, a year at a glance — a real table, so the DOM order is
 * the picture's order, and one tab stop rather than three hundred odd.
 */
export { default as ActivityGrid } from './components/ActivityGrid.vue'
/**
 * `BarChart` and `DonutChart`: the two shapes the kit's own dashboard
 * vocabulary — `StatCard`, `ProgressBar`, `ActivityGrid` — creates a need
 * for and did not answer. Both are the data as text with a picture beside
 * it, rather than a picture with a sentence describing it.
 */
export { default as BarChart } from './components/BarChart.vue'
/** Parts of a whole. */
export { default as DonutChart } from './components/DonutChart.vue'
/**
 * `ScrollArea`, a scrolling box with the two things a hand-written one
 * leaves out: a fade at whichever edge has more content past it, and a
 * focus stop — but only when nothing inside it can take focus.
 */
export { default as ScrollArea } from './components/ScrollArea.vue'
/**
 * `VirtualList`, a long list where only the rows near the viewport exist —
 * and every one of them states its place in the whole, which is the half
 * that is usually dropped.
 */
export { default as VirtualList } from './components/VirtualList.vue'
/**
 * `AnnounceHost` and `useAnnounce`, for saying something to a reader when
 * nothing on screen has changed enough to say it: a filter that narrowed a
 * list, a route that changed, a draft that saved itself.
 */
export { default as AnnounceHost } from './components/AnnounceHost.vue'
/**
 * `ErrorSummary`, the answer to "did that work?" at the top of a rejected
 * form — and a way from there into each field in one press.
 */
export { default as ErrorSummary } from './components/ErrorSummary.vue'
export { useAnnounce, announce } from './composables/use-announce'
/**
 * `textDirection`, because every logical property and every `start`/`end`
 * prop in the kit is inert until the document says which way the language
 * runs. The i18n runtime sets `dir` from it; this is for an app that has
 * no i18n runtime and still has more than one direction.
 */
export { textDirection } from './utils/direction'
/**
 * `elementDirection` and `horizontalStep`, for an app writing the keyboard
 * behaviour the kit does not cover. `ArrowLeft` means "back through the
 * list" only where the language runs left to right; read as a step, it
 * means the same thing in both.
 */
export { elementDirection, horizontalStep } from './utils/direction'
export type { TextDirection } from './utils/direction'
export type { AnnounceOptions } from './composables/use-announce'
/**
 * The people on a thing, overlapped: who is in a conversation, who shares
 * a list.
 */
export { default as AvatarStack } from './components/AvatarStack.vue'
/** A month of days, for choosing one or a stretch of them. */
export { default as BaseCalendar } from './components/BaseCalendar.vue'
/**
 * A short label with, when it is one of a set someone assembled, a way to
 * take it off: a filter, a recipient, a tag.
 */
export { default as BaseChip } from './components/BaseChip.vue'
/** A keyboard key, or a chord of them: `⌘ K`, `Ctrl Shift P`. */
export { default as BaseKbd } from './components/BaseKbd.vue'
/** A list you choose from, open on the page. */
export { default as BaseListbox } from './components/BaseListbox.vue'
export type { ListboxOption } from './components/BaseListbox.vue'
/** A link in a sentence — the one thing a button is not. */
export { default as BaseLink } from './components/BaseLink.vue'
/** A score out of five, given or shown. */
export { default as BaseRating } from './components/BaseRating.vue'
/** A line between things — with, when it helps, a word on it. */
export { default as BaseSeparator } from './components/BaseSeparator.vue'
/** One grey box standing in for content that has not arrived. */
export { default as BaseSkeleton } from './components/BaseSkeleton.vue'
/** A colour, as a hex value. */
export { default as ColorPicker } from './components/ColorPicker.vue'
export type { ColorSwatch } from './components/ColorPicker.vue'
/**
 * `CodeBlock`, a sample as written — no highlighting and no `v-html`, and
 * focusable when it scrolls, or the end of a long line is unreachable.
 */
export { default as CodeBlock } from './components/CodeBlock.vue'
/** Copies a piece of text, and says that it did. */
export { default as CopyButton } from './components/CopyButton.vue'
/**
 * Pairs of "what it is" and "what it says": the summary at the top of a
 * detail page, the facts under an invoice.
 */
export { default as DescriptionList } from './components/DescriptionList.vue'
export type { DescriptionItem } from './components/DescriptionList.vue'
/** Files, dropped on or chosen from a real file input. */
export { default as FileDrop } from './components/FileDrop.vue'
/** A field that holds several short values: recipients, labels, skills. */
export { default as TagsInput } from './components/TagsInput.vue'
/** A time of day, chosen from two columns. */
export { default as TimePicker } from './components/TimePicker.vue'
/** What happened, in order, on a rail. */
export { default as BaseTimeline } from './components/BaseTimeline.vue'
export type { TimelineEvent } from './components/BaseTimeline.vue'
export type { DateRange } from './components/BaseCalendar.vue'
/** A date, or a stretch of dates, chosen from a calendar in a popover. */
export { default as BaseDatePicker } from './components/BaseDatePicker.vue'
export type { DatePreset } from './components/BaseDatePicker.vue'
/** "Are you sure?", asked beside the button that asked it. */
export { default as BasePopconfirm } from './components/BasePopconfirm.vue'
/**
 * A panel of anything — a form, a picker, a few settings — anchored to the
 * control that opened it.
 */
export { default as BasePopover } from './components/BasePopover.vue'
export type { PopoverTriggerProps } from './components/BasePopover.vue'
/** A row of buttons that stay pressed — one at a time, or several at once. */
export { default as ToggleGroup } from './components/ToggleGroup.vue'
/** A number, typed or stepped — a quantity, a price, a count of minutes. */
export { default as NumberInput } from './components/NumberInput.vue'
/** A short code typed one character per box — a sign-in code, a PIN. */
export { default as PinInput } from './components/PinInput.vue'
/** A password field you can look at. */
export { default as PasswordInput } from './components/PasswordInput.vue'
/** Progress as a ring — for a small space, a card's corner, a goal. */
export { default as CircularProgress } from './components/CircularProgress.vue'
/**
 * Where someone is in a process of several steps — a sign-up, a checkout,
 * a form split into pages.
 */
export { default as BaseStepper } from './components/BaseStepper.vue'
export type { StepperStep } from './components/BaseStepper.vue'

// ── i18n ───────────────────────────────────────────────────────────────────
export { createI18nRuntime } from './i18n/runtime'
export type { I18nRuntimeOptions, LocalePreference } from './i18n/runtime'
