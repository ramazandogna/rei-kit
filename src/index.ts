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
/**
 * The person, in the corner where the account lives.
 *
 * @example
 * ```vue
 * <BaseAvatar name="Aiko Tanaka" fallback="initials" size="lg" />
 * ```
 */
export { default as BaseAvatar } from './components/BaseAvatar.vue'
/**
 * A message the reader has to take in before carrying on.
 *
 * @example
 * ```vue
 * <BaseAlert tone="warning">
 *   <template #title>Unsaved changes</template>
 *   Leave now and the last edit is lost.
 * </BaseAlert>
 * ```
 */
export { default as BaseAlert } from './components/BaseAlert.vue'
/**
 * A small standing label: a level, a state, a count.
 *
 * @example
 * ```vue
 * <BaseBadge tone="success">Paid</BaseBadge>
 * ```
 *
 * @see {@link BaseChip} — the near-neighbour this is mistaken for
 */
export { default as BaseBadge } from './components/BaseBadge.vue'
/**
 * The kit's button, and — when asked — its link.
 *
 * @example
 * ```vue
 * <div class="flex flex-wrap gap-2">
 *   <BaseButton @click="save">Save</BaseButton>
 *   <BaseButton variant="secondary">Cancel</BaseButton>
 *   <BaseButton variant="danger" :loading="deleting">Delete</BaseButton>
 *   <BaseButton as="a" href="/docs" variant="ghost">Read the docs</BaseButton>
 * </div>
 * ```
 *
 * @see {@link BaseLink} — the near-neighbour this is mistaken for
 */
export { default as BaseButton } from './components/BaseButton.vue'
/**
 * A text field with its label, hint and error already wired to it.
 *
 * @example
 * ```vue
 * <BaseInput v-model="email" label="Email" type="email" hint="We never share it." />
 *
 * <!-- A unit attached to the field. It is `aria-hidden` because the label
 *      already says what the number is; a mark that is the only place the
 *      unit appears belongs in the label instead. -->
 * <BaseInput v-model="weight" label="Weight in kilograms" type="number">
 *   <template #suffix><span aria-hidden="true">kg</span></template>
 * </BaseInput>
 * ```
 *
 * @see {@link PasswordInput} — the near-neighbour this is mistaken for
 */
export { default as BaseInput } from './components/BaseInput.vue'
/**
 * A list of actions behind one control.
 *
 * @example
 * ```vue
 * <BaseMenu label="Account">
 *   <template #trigger>
 *     <BaseAvatar name="Aiko Tanaka" fallback="initials" />
 *   </template>
 *
 *   <a href="/profile" role="menuitem">Profile</a>
 *   <button type="button" role="menuitem" @click="signOut">Sign out</button>
 * </BaseMenu>
 * ```
 *
 * @see {@link BaseModal}, {@link BasePopover}, {@link CommandMenu}, {@link MegaMenu}, {@link NavLinks} — the near-neighbours this is mistaken for
 */
export { default as BaseMenu } from './components/BaseMenu.vue'
/**
 * Pins the sheet to the area the keyboard has left visible.
 *
 * @example
 * ```vue
 * <BaseButton @click="open = true">New entry</BaseButton>
 *
 * <BaseSheet v-model="open" title="New entry" close-label="Close">
 *   <p>Anything that belongs to a thumb.</p>
 * </BaseSheet>
 * ```
 *
 * @see {@link BaseDrawer}, {@link BaseModal} — the near-neighbours this is mistaken for
 */
export { default as BaseSheet } from './components/BaseSheet.vue'
/**
 * A surface with a border, and optionally a head and a foot.
 *
 * @example
 * ```vue
 * <BaseCard>
 *   <template #head>This month</template>
 *   Spent less than last month.
 *   <template #foot>Updated today</template>
 * </BaseCard>
 * ```
 */
export { default as BaseCard } from './components/BaseCard.vue'
/**
 * A field you type into to narrow a list, then choose from it.
 *
 * @example
 * ```vue
 * <BaseCombobox
 *   v-model="country"
 *   label="Country"
 *   :options="countries"
 *   placeholder="Start typing"
 *   empty-label="No country matches"
 * />
 *
 * <BaseCombobox
 *   v-model="recipients"
 *   mode="multiple"
 *   label="Recipients"
 *   :options="countries"
 *   :remove-label="(name) => `Remove ${name}`"
 *   placeholder="Add someone"
 *   empty-label="Nobody matches"
 * />
 *
 * <BaseCombobox
 *   label="City"
 *   :options="results"
 *   :loading="loading"
 *   loading-label="Searching…"
 *   filter="none"
 *   placeholder="Type at least two letters"
 *   empty-label="No city matches"
 *   @search="search"
 * />
 * ```
 *
 * @see {@link BaseSelect}, {@link TagsInput}, {@link TransferList} — the near-neighbours this is mistaken for
 */
export { default as BaseCombobox } from './components/BaseCombobox.vue'
export type { ComboboxOption } from './components/BaseCombobox.vue'
/**
 * A single checkbox, with its label beside it.
 *
 * @example
 * ```vue
 * <BaseCheckbox v-model="remember" label="Remember me" />
 * ```
 *
 * @see {@link BaseSwitch} — the near-neighbour this is mistaken for
 */
export { default as BaseCheckbox } from './components/BaseCheckbox.vue'
/**
 * A set of radios, and the reason there is no `BaseRadio`.
 *
 * @example
 * ```vue
 * <BaseRadioGroup v-model="plan" legend="Plan" :options="plans" />
 * ```
 *
 * @see {@link BaseListbox}, {@link BaseSelect} — the near-neighbours this is mistaken for
 */
export { default as BaseRadioGroup } from './components/BaseRadioGroup.vue'
/**
 * A native `<select>`, wearing the kit's field.
 *
 * @example
 * ```vue
 * <BaseSelect v-model="currency" label="Currency" :options="options" placeholder="Choose one" />
 * ```
 *
 * @see {@link BaseCombobox}, {@link BaseListbox}, {@link BaseRadioGroup} — the near-neighbours this is mistaken for
 */
export { default as BaseSelect } from './components/BaseSelect.vue'
/**
 * A value picked from a range, where roughly right is the point.
 *
 * @example
 * ```vue
 * <BaseSlider v-model="goal" label="Daily goal" :min="5" :max="60" :step="5" show-value />
 * ```
 *
 * @see {@link NumberInput}, {@link SliderField} — the near-neighbours this is mistaken for
 */
export { default as BaseSlider } from './components/BaseSlider.vue'

/**
 * A slider and a number field on one value: drag to find it, type to land
 * on it. See `SliderField.vue` for why both carry the same name.
 *
 * @example
 * ```vue
 * <SliderField
 *   v-model="opacity"
 *   label="Opacity"
 *   :min="0"
 *   :max="100"
 *   :step="5"
 *   decrement-label="Less opaque"
 *   increment-label="More opaque"
 *   :format="(value) => `${value}%`"
 *   hint="Drag for roughly right, type for exactly right."
 * />
 * ```
 *
 * @see {@link BaseSlider}, {@link NumberInput} — the near-neighbours this is mistaken for
 */
export { default as SliderField } from './components/SliderField.vue'
/**
 * Work in progress, with no idea how much is left.
 *
 * @example
 * ```vue
 * <BaseSpinner label="Loading entries" />
 * ```
 *
 * @see {@link ProgressBar} — the near-neighbour this is mistaken for
 */
export { default as BaseSpinner } from './components/BaseSpinner.vue'
/**
 * A setting that takes effect the moment it is touched.
 *
 * @example
 * ```vue
 * <BaseSwitch v-model="reminders" label="Daily reminder" hint="Every evening at 21:00" />
 * ```
 *
 * @see {@link BaseCheckbox} — the near-neighbour this is mistaken for
 */
export { default as BaseSwitch } from './components/BaseSwitch.vue'
/**
 * Rows of data, with the parts a hand-written `<table>` leaves out.
 *
 * @example
 * ```vue
 * <BaseTable :columns="columns" :rows="rows" caption="Recent payments" row-key="id">
 *   <template #amount="{ value }">{{ value }} ₺</template>
 * </BaseTable>
 * ```
 *
 * @see {@link DataTable} — the near-neighbour this is mistaken for
 */
export { default as BaseTable } from './components/BaseTable.vue'
export type { Column } from './components/BaseTable.vue'
/**
 * A multi-line field.
 *
 * @example
 * ```vue
 * <BaseTextarea v-model="note" label="Note" :rows="4" />
 * ```
 */
export { default as BaseTextarea } from './components/BaseTextarea.vue'
/**
 * A list with nothing in it yet, said kindly.
 *
 * @example
 * ```vue
 * <EmptyState title="No entries yet" description="Your first one takes ten seconds.">
 *   <template #action>
 *     <BaseButton>Write one</BaseButton>
 *   </template>
 * </EmptyState>
 * ```
 */
export { default as EmptyState } from './components/EmptyState.vue'
/**
 * A label, a hint, an error, and the wiring between them.
 *
 * @example
 * ```vue
 * <FormField label="Username" hint="Letters and numbers only" :error="error">
 *   <template #default="{ id, describedBy, invalid }">
 *     <input
 *       :id="id"
 *       v-model="name"
 *       class="control rounded-card px-3 py-2"
 *       :aria-describedby="describedBy"
 *       :aria-invalid="invalid"
 *     />
 *   </template>
 * </FormField>
 * ```
 */
export { default as FormField } from './components/FormField.vue'
/**
 * Keeps one broken screen from taking the whole app down.
 *
 * @example
 * ```vue
 * <ErrorBoundary @error="report">
 *   <RouterView />
 *
 *   <template #fallback="{ reset }">
 *     <p>That part of the page failed.</p>
 *     <BaseButton @click="reset">Try again</BaseButton>
 *   </template>
 * </ErrorBoundary>
 * ```
 */
export { default as ErrorBoundary } from './components/ErrorBoundary.vue'
/**
 * One measure, centred, with the page's gutters.
 *
 * @example
 * ```vue
 * <PageContainer width="reading" as="article">
 *   <h1>A long read</h1>
 *   <p>Set at about 68 characters a line.</p>
 * </PageContainer>
 * ```
 */
export { default as PageContainer } from './components/PageContainer.vue'
/**
 * The bar at the top of a screen: a title with room either side of it.
 *
 * @example
 * ```vue
 * <PageHeader title="Settings">
 *   <template #right>
 *     <BaseButton size="sm" variant="ghost">Done</BaseButton>
 *   </template>
 * </PageHeader>
 * ```
 */
export { default as PageHeader } from './components/PageHeader.vue'
/**
 * How far through something somebody is.
 *
 * @example
 * ```vue
 * <ProgressBar :value="18" :max="28" label="Course progress" />
 * ```
 *
 * @see {@link BaseSpinner} — the near-neighbour this is mistaken for
 */
export { default as ProgressBar } from './components/ProgressBar.vue'
/**
 * One plan in a pricing table.
 *
 * @example
 * ```vue
 * <PriceCard
 *   name="Pro"
 *   price="₺49"
 *   period="/ month"
 *   :features="['Unlimited entries', 'Export', 'Sync']"
 *   recommended
 *   badge="Popular"
 * >
 *   <template #action>
 *     <BaseButton block>Choose Pro</BaseButton>
 *   </template>
 * </PriceCard>
 * ```
 */
export { default as PriceCard } from './components/PriceCard.vue'
/**
 * A pill heading for a group of things.
 *
 * @example
 * ```vue
 * <SectionHeading :tone="income" label="Income" :count="3" />
 * ```
 */
export { default as SectionHeading } from './components/SectionHeading.vue'
/**
 * A row of mutually exclusive choices.
 *
 * @example
 * ```vue
 * <SegmentedControl v-model="range" :options="ranges" />
 * ```
 *
 * @see {@link ToggleGroup} — the near-neighbour this is mistaken for
 */
export { default as SegmentedControl } from './components/SegmentedControl.vue'
/**
 * A titled run of settings rows.
 *
 * @example
 * ```vue
 * <SettingsGroup title="Notifications">
 *   <SettingsRow label="Daily reminder">
 *     <BaseSwitch v-model="reminders" label="Daily reminder" label-hidden />
 *   </SettingsRow>
 * </SettingsGroup>
 * ```
 */
export { default as SettingsGroup } from './components/SettingsGroup.vue'
/**
 * One line in a settings card.
 *
 * @example
 * ```vue
 * <SettingsGroup title="Account">
 *   <SettingsRow
 *     label="Language"
 *     description="English"
 *     :icon="Languages"
 *     interactive
 *     @click="openLanguages"
 *   />
 * </SettingsGroup>
 * ```
 */
export { default as SettingsRow } from './components/SettingsRow.vue'
/**
 * A length starts with a digit, a dot, or opens a CSS function.
 *
 * @example
 * ```vue
 * <SkeletonList :rows="4" label="Loading entries" />
 * ```
 *
 * @see {@link BaseSkeleton} — the near-neighbour this is mistaken for
 */
export { default as SkeletonList } from './components/SkeletonList.vue'
/**
 * One number, with what it means and which way it is going.
 *
 * @example
 * ```vue
 * <StatCard value="¥48,200" label="This month" trend="down" />
 * ```
 */
export { default as StatCard } from './components/StatCard.vue'
/**
 * Where the toasts land. One of these, at the app root.
 *
 * @example
 * ```vue
 * <!-- Once, near the root of the app. -->
 * <ToastHost close-label="Close" />
 *
 * <BaseButton @click="toast.success('Saved')">Save</BaseButton>
 * ```
 */
export { default as ToastHost } from './components/ToastHost.vue'
/**
 * A small coloured dot, optionally labelled.
 *
 * @example
 * ```vue
 * <ToneDot fill="bg-positive" label="Income" />
 * ```
 */
export { default as ToneDot } from './components/ToneDot.vue'
export type { Tone } from './components/SectionHeading.vue'
/**
 * A flat language switcher for screens with no Settings behind them.
 *
 * @example
 * ```vue
 * <LocaleLinks v-model="locale" :locales="['en', 'tr']" :labels="{ en: 'English', tr: 'Türkçe' }" />
 * ```
 */
export { default as LocaleLinks } from './components/LocaleLinks.vue'
/**
 * Sign in with Google, in Google's own clothes.
 *
 * @example
 * ```vue
 * <GoogleButton label="Continue with Google" @click="signInWithGoogle" />
 * ```
 */
export { default as GoogleButton } from './components/GoogleButton.vue'
/**
 * The floating bottom bar.
 *
 * @example
 * ```vue
 * <TabBar :items="tabs" :active="active" label="Main" />
 * ```
 *
 * @see {@link BaseTabs}, {@link NavLinks} — the near-neighbours this is mistaken for
 */
export { default as TabBar } from './components/TabBar.vue'
export type { TabItem } from './components/TabBar.vue'
/**
 * `ActivityGrid`, a year at a glance — a real table, so the DOM order is
 * the picture's order, and one tab stop rather than three hundred odd.
 *
 * @example
 * ```vue
 * <ActivityGrid
 *   :days="days"
 *   label="Your year"
 *   :level-for="levelFor"
 *   :day-label="dayLabel"
 *   :is-selectable="isSelectable"
 *   @select="toast.info($event)"
 * />
 * ```
 *
 * @see {@link BaseCalendar} — the near-neighbour this is mistaken for
 */
export { default as ActivityGrid } from './components/ActivityGrid.vue'
/**
 * `BarChart` and `DonutChart`: the two shapes the kit's own dashboard
 * vocabulary — `StatCard`, `ProgressBar`, `ActivityGrid` — creates a need
 * for and did not answer. Both are the data as text with a picture beside
 * it, rather than a picture with a sentence describing it.
 *
 * @example
 * ```vue
 * <BarChart
 *   :series="SIZES"
 *   label="Bundle size, ten components"
 *   :value-label="(kb) => `${kb.toFixed(1)} KB`"
 *   :fill="(item) => (item.key === 'rei' ? 'bg-positive' : 'bg-muted')"
 * />
 * ```
 *
 * @see {@link DonutChart} — the near-neighbour this is mistaken for
 */
export { default as BarChart } from './components/BarChart.vue'
/**
 * Parts of a whole.
 *
 * @example
 * ```vue
 * <DonutChart
 *   :slices="PARTS"
 *   label="What the stylesheet is made of"
 *   :value-label="(kb) => `${kb.toFixed(1)} KB`"
 *   :fill="(_, index) => TONES[index % TONES.length]!"
 * />
 * ```
 *
 * @see {@link BarChart} — the near-neighbour this is mistaken for
 */
export { default as DonutChart } from './components/DonutChart.vue'
/**
 * `ScrollArea`, a scrolling box with the two things a hand-written one
 * leaves out: a fade at whichever edge has more content past it, and a
 * focus stop — but only when nothing inside it can take focus.
 *
 * @example
 * ```vue
 * <!-- Nothing inside takes focus, so this becomes a named focus stop on its
 *      own and the far end stays reachable with a keyboard. -->
 * <ScrollArea axis="x" scrollbar="hidden" label="The year so far" class="max-w-sm">
 *   <p class="flex gap-3 whitespace-nowrap">
 *     <span v-for="month in MONTHS" :key="month" class="text-ink-soft text-sm">{{ month }}</span>
 *   </p>
 * </ScrollArea>
 * ```
 */
export { default as ScrollArea } from './components/ScrollArea.vue'
/**
 * `VirtualList`, a long list where only the rows near the viewport exist —
 * and every one of them states its place in the whole, which is the half
 * that is usually dropped.
 *
 * @example
 * ```vue
 * <VirtualList
 *   :items="ROWS"
 *   :row-height="36"
 *   label="Five thousand rows"
 *   class="border-hair max-h-56 rounded-xl border"
 * >
 *   <template #default="{ item }">
 *     <span class="text-ink flex h-full items-center px-3 text-sm">{{ item.name }}</span>
 *   </template>
 * </VirtualList>
 * ```
 */
export { default as VirtualList } from './components/VirtualList.vue'
/**
 * `AnnounceHost` and `useAnnounce`, for saying something to a reader when
 * nothing on screen has changed enough to say it: a filter that narrowed a
 * list, a route that changed, a draft that saved itself.
 *
 * @example
 * ```vue
 * <div class="flex items-center gap-3">
 *   <!-- Rendered once per app. Nothing here is ever visible. -->
 *   <AnnounceHost />
 *
 *   <BaseButton variant="secondary" @click="filter">Filter</BaseButton>
 *   <span class="text-ink-soft text-sm">{{ count }} results</span>
 * </div>
 * ```
 */
export { default as AnnounceHost } from './components/AnnounceHost.vue'
/**
 * `ErrorSummary`, the answer to "did that work?" at the top of a rejected
 * form — and a way from there into each field in one press.
 *
 * @example
 * ```vue
 * <form class="flex flex-col gap-3" novalidate @submit.prevent="submit">
 *   <!-- Takes focus itself the first time the form is rejected, so the
 *        reader is not left on a button that appeared to do nothing. -->
 *   <ErrorSummary
 *     :errors="errors"
 *     title="There are fields to fix"
 *     :label-for="(field) => LABELS[field] ?? field"
 *     :field-id="fieldId"
 *     :fields="['email', 'password']"
 *   />
 *
 *   <!-- The same function on both sides: the summary builds the href from it
 *        and each field takes its id from it, so the link lands on the field. -->
 *   <BaseInput
 *     v-model="email"
 *     label="Email"
 *     type="email"
 *     autocomplete="email"
 *     :error="errors['email']"
 *     :field-id="fieldId('email')"
 *   />
 *
 *   <PasswordInput
 *     v-model="password"
 *     label="Password"
 *     toggle-label="Show password"
 *     autocomplete="new-password"
 *     :error="errors['password']"
 *     :field-id="fieldId('password')"
 *   />
 *
 *   <BaseButton type="submit" class="self-start">Sign up</BaseButton>
 * </form>
 * ```
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
 *
 * @example
 * ```vue
 * <AvatarStack :people="people" :max="3" label="Shared with 5 people" />
 * ```
 */
export { default as AvatarStack } from './components/AvatarStack.vue'
/**
 * A month of days, for choosing one or a stretch of them.
 *
 * @example
 * ```vue
 * <BaseCalendar
 *   v-model="day"
 *   previous-label="Previous month"
 *   next-label="Next month"
 *   :min="todayKey()"
 * />
 * ```
 *
 * @see {@link ActivityGrid}, {@link BaseDatePicker} — the near-neighbours this is mistaken for
 */
export { default as BaseCalendar } from './components/BaseCalendar.vue'
/**
 * A short label with, when it is one of a set someone assembled, a way to
 * take it off: a filter, a recipient, a tag.
 *
 * @example
 * ```vue
 * <div class="flex flex-wrap gap-2">
 *   <BaseChip
 *     v-for="tag in tags"
 *     :key="tag"
 *     :label="tag"
 *     :remove-label="`Remove ${tag}`"
 *     @remove="remove(tag)"
 *   />
 * </div>
 * ```
 *
 * @see {@link BaseBadge} — the near-neighbour this is mistaken for
 */
export { default as BaseChip } from './components/BaseChip.vue'
/**
 * A keyboard key, or a chord of them: `⌘ K`, `Ctrl Shift P`.
 *
 * @example
 * ```vue
 * <p>Press <BaseKbd :keys="['⌘', 'K']" joiner="+" /> to search.</p>
 * ```
 */
export { default as BaseKbd } from './components/BaseKbd.vue'
/**
 * A list you choose from, open on the page.
 *
 * @example
 * ```vue
 * <BaseListbox v-model="chosen" mode="multiple" :options="people" label="People with access" />
 * ```
 *
 * @see {@link BaseRadioGroup}, {@link BaseSelect}, {@link TransferList} — the near-neighbours this is mistaken for
 */
export { default as BaseListbox } from './components/BaseListbox.vue'
export type { ListboxOption } from './components/BaseListbox.vue'
/**
 * A link in a sentence — the one thing a button is not.
 *
 * @example
 * ```vue
 * <p>
 *   Read the <BaseLink to="/docs">documentation</BaseLink>, or the
 *   <BaseLink href="https://vuejs.org" external>Vue guide</BaseLink>.
 * </p>
 * ```
 *
 * @see {@link BaseButton} — the near-neighbour this is mistaken for
 */
export { default as BaseLink } from './components/BaseLink.vue'
/**
 * A score out of five, given or shown.
 *
 * @example
 * ```vue
 * <BaseRating
 *   v-model="score"
 *   label="Your rating"
 *   :value-label="(value, max) => `${value} out of ${max}`"
 * />
 * ```
 */
export { default as BaseRating } from './components/BaseRating.vue'
/**
 * A line between things — with, when it helps, a word on it.
 *
 * @example
 * ```vue
 * <p>Signed in already?</p>
 * <BaseSeparator label="or" />
 * <p>Create an account.</p>
 * ```
 */
export { default as BaseSeparator } from './components/BaseSeparator.vue'
/**
 * One grey box standing in for content that has not arrived.
 *
 * @example
 * ```vue
 * <div class="flex items-center gap-3" aria-busy="true">
 *   <BaseSkeleton shape="circle" height="2.5rem" />
 *   <div class="flex-1">
 *     <BaseSkeleton shape="text" width="40%" height="0.75rem" />
 *     <BaseSkeleton class="mt-2" shape="text" width="70%" height="0.75rem" />
 *   </div>
 * </div>
 * ```
 *
 * @see {@link SkeletonList} — the near-neighbour this is mistaken for
 */
export { default as BaseSkeleton } from './components/BaseSkeleton.vue'
/**
 * A colour, as a hex value.
 *
 * @example
 * ```vue
 * <ColorPicker
 *   v-model="brand"
 *   label="Brand colour"
 *   hex-label="Hex value"
 *   :swatches="swatches"
 *   hint="Used for buttons, links and the active state."
 * />
 * ```
 */
export { default as ColorPicker } from './components/ColorPicker.vue'
export type { ColorSwatch } from './components/ColorPicker.vue'
/**
 * `CodeBlock`, a sample as written — no highlighting and no `v-html`, and
 * focusable when it scrolls, or the end of a long line is unreachable.
 *
 * @example
 * ```vue
 * <CodeBlock
 *   :code="INSTALL"
 *   label="Installing the package"
 *   language="bash"
 *   copy-label="Copy the snippet"
 *   copied-label="Copied"
 * />
 * ```
 */
export { default as CodeBlock } from './components/CodeBlock.vue'
/**
 * Copies a piece of text, and says that it did.
 *
 * @example
 * ```vue
 * <CopyButton
 *   text="pnpm add rei-kit"
 *   copy-label="Copy the command"
 *   copied-label="Copied"
 *   error-label="Could not copy"
 *   with-text
 * />
 * ```
 */
export { default as CopyButton } from './components/CopyButton.vue'
/**
 * Pairs of "what it is" and "what it says": the summary at the top of a
 * detail page, the facts under an invoice.
 *
 * @example
 * ```vue
 * <DescriptionList :items="items" layout="inline">
 *   <template #status><BaseBadge tone="success">Paid</BaseBadge></template>
 * </DescriptionList>
 * ```
 */
export { default as DescriptionList } from './components/DescriptionList.vue'
export type { DescriptionItem } from './components/DescriptionList.vue'
/**
 * Files, dropped on or chosen from a real file input.
 *
 * @example
 * ```vue
 * <FileDrop
 *   v-model="files"
 *   label="Drop a receipt here"
 *   hint="PDF or an image, up to 5 MB"
 *   browse-label="Browse"
 *   remove-label="Remove"
 *   too-large-label="That file is over 5 MB"
 *   accept="image/*,.pdf"
 *   :max-size="5 * 1024 * 1024"
 *   multiple
 * />
 * ```
 */
export { default as FileDrop } from './components/FileDrop.vue'
/**
 * A field that holds several short values: recipients, labels, skills.
 *
 * @example
 * ```vue
 * <TagsInput
 *   v-model="tags"
 *   label="Tags"
 *   placeholder="Type and press Enter"
 *   :remove-label="(tag) => `Remove ${tag}`"
 *   :max="5"
 * />
 * ```
 *
 * @see {@link BaseCombobox}, {@link TransferList} — the near-neighbours this is mistaken for
 */
export { default as TagsInput } from './components/TagsInput.vue'
/**
 * A time of day, chosen from two columns.
 *
 * @example
 * ```vue
 * <TimePicker
 *   v-model="at"
 *   label="Reminder"
 *   hours-label="Hour"
 *   minutes-label="Minute"
 *   placeholder="Choose a time"
 *   :step="15"
 *   min="07:00"
 *   max="22:00"
 *   hint="Stored as HH:mm, shown in your own clock."
 * />
 * ```
 *
 * @see {@link BaseDatePicker} — the near-neighbour this is mistaken for
 */
export { default as TimePicker } from './components/TimePicker.vue'
/**
 * What happened, in order, on a rail.
 *
 * @example
 * ```vue
 * <BaseTimeline :events="notes" label="Notes on this habit">
 *   <template #default="{ event }">
 *     <BaseCard as="blockquote" padding="sm" class="text-ink text-sm leading-relaxed">
 *       {{ event.body }}
 *     </BaseCard>
 *   </template>
 * </BaseTimeline>
 * ```
 *
 * @see {@link BaseStepper} — the near-neighbour this is mistaken for
 */
export { default as BaseTimeline } from './components/BaseTimeline.vue'
export type { TimelineEvent } from './components/BaseTimeline.vue'
export type { DateRange } from './components/BaseCalendar.vue'
/**
 * A date, or a stretch of dates, chosen from a calendar in a popover.
 *
 * @example
 * ```vue
 * <BaseDatePicker
 *   v-model="span"
 *   mode="range"
 *   label="Report period"
 *   placeholder="Choose a period"
 *   clear-label="Clear the period"
 *   :presets="presets"
 *   previous-label="Previous month"
 *   next-label="Next month"
 * />
 * ```
 *
 * @see {@link BaseCalendar}, {@link TimePicker} — the near-neighbours this is mistaken for
 */
export { default as BaseDatePicker } from './components/BaseDatePicker.vue'
export type { DatePreset } from './components/BaseDatePicker.vue'
/**
 * "Are you sure?", asked beside the button that asked it.
 *
 * @example
 * ```vue
 * <BasePopconfirm
 *   message="This entry will be deleted."
 *   confirm-label="Delete"
 *   cancel-label="Cancel"
 *   @confirm="remove"
 * >
 *   <template #trigger="{ props }">
 *     <BaseButton variant="danger" size="sm" v-bind="props">Delete</BaseButton>
 *   </template>
 * </BasePopconfirm>
 * ```
 *
 * @see {@link ResponsiveDialog} — the near-neighbour this is mistaken for
 */
export { default as BasePopconfirm } from './components/BasePopconfirm.vue'
/**
 * A panel of anything — a form, a picker, a few settings — anchored to the
 * control that opened it.
 *
 * @example
 * ```vue
 * <BasePopover label="Filters">
 *   <template #trigger="{ props }">
 *     <BaseButton variant="secondary" v-bind="props">Filters</BaseButton>
 *   </template>
 *
 *   <template #default="{ close }">
 *     <BaseSwitch v-model="unpaid" label="Only unpaid" />
 *     <BaseButton class="mt-3" size="sm" block @click="close">Done</BaseButton>
 *   </template>
 * </BasePopover>
 * ```
 *
 * @see {@link BaseMenu}, {@link BaseModal} — the near-neighbours this is mistaken for
 */
export { default as BasePopover } from './components/BasePopover.vue'
export type { PopoverTriggerProps } from './components/BasePopover.vue'
/**
 * A row of buttons that stay pressed — one at a time, or several at once.
 *
 * @example
 * ```vue
 * <ToggleGroup v-model="marks" mode="multiple" :options="marksOptions" label="Text style" />
 * ```
 *
 * @see {@link SegmentedControl} — the near-neighbour this is mistaken for
 */
export { default as ToggleGroup } from './components/ToggleGroup.vue'
/**
 * A number, typed or stepped — a quantity, a price, a count of minutes.
 *
 * @example
 * ```vue
 * <NumberInput
 *   v-model="guests"
 *   label="Guests"
 *   :min="1"
 *   :max="12"
 *   decrement-label="Fewer guests"
 *   increment-label="More guests"
 * />
 * ```
 *
 * @see {@link BaseSlider}, {@link SliderField} — the near-neighbours this is mistaken for
 */
export { default as NumberInput } from './components/NumberInput.vue'
/**
 * A short code typed one character per box — a sign-in code, a PIN.
 *
 * @example
 * ```vue
 * <PinInput
 *   v-model="code"
 *   label="Verification code"
 *   :cell-label="(n, total) => `Digit ${n} of ${total}`"
 *   @complete="verify"
 * />
 * ```
 */
export { default as PinInput } from './components/PinInput.vue'
/**
 * A password field you can look at.
 *
 * @example
 * ```vue
 * <PasswordInput
 *   v-model="password"
 *   label="Password"
 *   toggle-label="Show password"
 *   hint="At least 12 characters."
 *   autocomplete="new-password"
 * />
 * ```
 *
 * @see {@link BaseInput} — the near-neighbour this is mistaken for
 */
export { default as PasswordInput } from './components/PasswordInput.vue'
/**
 * Progress as a ring — for a small space, a card's corner, a goal.
 *
 * @example
 * ```vue
 * <div class="flex items-center gap-4">
 *   <CircularProgress :value="72" label="Upload" show-value size="lg" />
 *   <CircularProgress label="Loading" />
 * </div>
 * ```
 */
export { default as CircularProgress } from './components/CircularProgress.vue'
/**
 * Where someone is in a process of several steps — a sign-up, a checkout,
 * a form split into pages.
 *
 * @example
 * ```vue
 * <BaseStepper
 *   v-model="step"
 *   :steps="steps"
 *   label="Sign-up"
 *   interactive
 *   :state-labels="{ complete: 'done', error: 'needs attention' }"
 * />
 * <BaseButton class="mt-4" @click="step = 'payment'">Next</BaseButton>
 * ```
 *
 * @see {@link BaseTimeline} — the near-neighbour this is mistaken for
 */
export { default as BaseStepper } from './components/BaseStepper.vue'
export type { StepperStep } from './components/BaseStepper.vue'

// ── i18n ───────────────────────────────────────────────────────────────────
export { createI18nRuntime } from './i18n/runtime'
export type { I18nRuntimeOptions, LocalePreference } from './i18n/runtime'
