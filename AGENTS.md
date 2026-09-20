# rei-kit for assistants

Everything an agent needs to build a screen with this package. Hand this file
over at the start of a project; it is written to be read once and used without
opening the source.

**The exhaustive parts are generated, not written here.** Every component and
every prop, with its type, default and the reason it exists, is in
`showcase/props.generated.json` and live at
[ramazandogna.github.io/rei-kit](https://ramazandogna.github.io/rei-kit/). A
working usage sample for every component is in `showcase/examples/<Name>.vue`
— real files, type-checked, importing from the entry the component ships in;
copy from there rather than guessing a prop. This file carries what cannot be
read off a type: which part to reach for, and the mistakes that compile.

## What this is

A Vue 3 + Tailwind 4 component kit. 89 components across six entry points,
typed, tested, and themed by role rather than by colour — on three
independent axes: palette, material and mode. Three apps run on it
and no two resemble each other: [Hibi](https://github.com/ramazandogna/hibi), a
phone journal; [Kakei](https://github.com/ramazandogna/kakei), a phone ledger;
and [Kakehashi](https://github.com/ramazandogna/kakehashi-nihongo), a
prerendered course site.

## What gets to be in here

**This is a kit. It is built for the ecosystem, not for the apps that happen to
exist today.**

A part belongs here if it is a piece of user interface at all — a button, a
field, a toast, a modal, a shell. There is no waiting for a second consumer and
no counting of call sites: an app that needs something the kit does not have is
a gap in the kit, and the kit is what changes. Waiting means the next app
begins by copying, and a kit whose parts arrive after the apps that needed them
is a library of things nobody reached for.

A part is finished when three things are true:

1. **It covers every role the design system declares.** `tokens.css` names five
   colour roles; a button that exposes two of them is incomplete, whatever the
   apps currently use.
2. **The app can take the behaviour without the appearance.** `variant="unstyled"`
   is the last resort, not the first: if several apps paint the same shape by
   hand, that shape is a variant the kit is missing.
3. **It carries no product decision** — no colour value, no copy, no icon.
   Those arrive as props and slots, which is what lets three apps that look
   nothing alike share one part.

**The test that finds the gaps:** a hand-written control in a file that already
imports the kit's version of it. That is a bug in the kit, every time. Not in
the app, and not a matter of taste.

## Install

```sh
pnpm add rei-kit
```

Peers the app supplies: `vue` ^3.5, `tailwindcss` ^4, `lucide-vue-next` ^1.
Optional: `vue-router` ^5 (anything that navigates), `vue-i18n` ^11 (the i18n
runtime), `@supabase/supabase-js` ^2 (`rei-kit/supabase`).

```css
/* src/assets/main.css */
@import 'tailwindcss';
@import 'rei-kit/mobile.css'; /* or rei-kit/web.css for a wide site — one, never both */

/* the whole rebrand */
@theme {
  --color-primary: #6b4de6;
  --color-positive: #2fa36b;
  --color-negative: #d1453b;
}
```

The preset is tokens, its shell, materials, palettes, compiled component
styles and the `@source` that lets Tailwind find the components, resolved
from the preset itself. **Reach for the preset.** The parts are still
exported one by one (`tokens.css`, `shell/mobile.css`, `materials.css`,
`palettes.css`, `styles.css`); an app wiring them itself must add
`@source '<relative path>/node_modules/rei-kit/dist'`, and every one of those
lines fails silently when missing: the build is green and the components
render unstyled.

## Entry points

Import from the narrowest one. Each exists so an app never downloads what it
does not use.

| Entry              | What it is for                                              | Components                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rei-kit`          | What any app has                                            | `AvatarStack` `BaseAlert` `BaseAvatar` `BaseBadge` `BaseButton` `BaseCalendar` `BaseCard` `BaseCheckbox` `BaseChip` `BaseCombobox` `BaseDatePicker` `BaseInput` `BaseKbd` `BaseLink` `BaseListbox` `BasePopconfirm` `BaseMenu` `BasePopover` `BaseRadioGroup` `BaseRating` `BaseSelect` `BaseSeparator` `BaseSheet` `BaseSkeleton` `BaseSlider` `BaseSpinner` `BaseStepper` `BaseSwitch` `BaseTable` `BaseTextarea` `CircularProgress` `CopyButton` `DescriptionList` `EmptyState` `ErrorBoundary` `FileDrop` `FormField` `GoogleButton` `LocaleLinks` `NumberInput` `PageContainer` `PageHeader` `PinInput` `PriceCard` `ProgressBar` `SectionHeading` `SegmentedControl` `SettingsGroup` `SettingsRow` `SkeletonList` `StatCard` `TabBar` `TagsInput` `TimePicker` `ToastHost` `ToggleGroup` `ToneDot` |
| `rei-kit/web`      | A wide site with a header and a mouse                       | `BaseAccordion` `BaseBreadcrumb` `BaseDisclosure` `BaseModal` `BasePagination` `BaseSplitter` `BaseTabs` `BaseToolbar` `BaseTooltip` `BaseTree` `CommandMenu` `DataTable` `MegaMenu` `NavLinks` `ResponsiveDialog` `TransferList`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `rei-kit/app`      | A phone-shaped app with tabs and a sign-in screen           | `AuthForm` `AuthShell` `FabButton` `LocaleSheet` `OfflineBanner` `TabShell` `TourShell`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `rei-kit/pwa`      | Installing and updating                                     | `InstallPrompt` `InstallSettings` `UpdatePrompt`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `rei-kit/motion`   | Numbers that count, words that change, content that arrives | `NumberTicker` `CountUp` `TextRotate` `TypeWriter` `BaseReveal` `BaseMarquee`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `rei-kit/supabase` | Optional; importing it is the opt-in                        | none — `createSupabaseClient`, `setRememberMe`, `toAuthMessageKey`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

A test fails if a component ships without a row here, so this table cannot fall
behind the package the way it once did.

## Which one to reach for

The kit has near-neighbours on purpose. Picking the wrong one compiles and
looks almost right.

- **`ResponsiveDialog`.** A modal on a wide screen and a sheet on a phone,
  from one set of props — the choice two apps kept writing by hand, and one
  of the two always left behind.
- **A confirmation: `BasePopconfirm`, `ResponsiveDialog` or a toast.** An
  undo on a toast is kindest: act, and let it be taken back. When the answer
  must come first, ask beside the button with the popconfirm. Reach for the
  dialog only when the answer needs explaining.
- **`BaseDatePicker` or `TimePicker`.** The day and the time of day are two
  fields, because they are two decisions and a locale writes them
  differently. Dates go in and out as `YYYY-MM-DD`, times as `HH:mm`.
- **`BaseModal` or `BaseSheet`.** A modal arrives from nowhere in the middle of
  what you were reading and is dismissed by leaving it. A sheet arrives from
  the bottom edge, belongs to a thumb, and is pinned to the 430px shell column
  — so on a desktop it is narrow, and that is correct.
- **`BaseMenu`, `BasePopover` or `BaseModal`.** A menu is a list of actions:
  arrows move through it. A popover holds anything — a few settings, a
  picker — next to the control that opened it, and the page stays usable. A
  modal takes the whole page until it is answered.
- **`BaseMenu` or `BaseModal`.** A short list of actions is a menu: arrows move,
  Tab _leaves_. A dialog traps Tab. Getting that backwards traps somebody in a
  list of links.
- **`BaseDatePicker` or `BaseCalendar`.** The picker is a field: it shows the
  chosen date and opens a calendar in a popover. Reach for the calendar alone
  when it is the page — a booking screen, a month view — and not a field.
- **`BaseTree` or `BaseAccordion`.** An accordion is one level of panels
  that open. A tree is depth: branches inside branches, where the arrows
  open, close and step in and out.
- **`BaseToolbar`.** Wrap a row of controls in it and the row costs one Tab
  press instead of one per control. It picks up whatever is inside, so the
  controls stay yours.
- **`TransferList` or `BaseListbox` with `multiple`.** The listbox is one
  list with ticks. The transfer list is two: available and chosen, with the
  chosen side keeping the order things were added in.
- **`BaseTable` or `DataTable`.** The table draws rows. The data table adds
  the three things real data grows: a sort a screen reader can hear, a
  selection keyed by row rather than by index, and a loading state.
- **`BaseListbox`, `BaseRadioGroup` or `BaseSelect`.** A radio group is a
  handful of options, all visible and all equal. A select opens the
  platform's own picker. A listbox is a long list that stays on screen and
  can take several answers.
- **`CommandMenu` or `BaseMenu`.** A menu is the few actions that belong to
  one control. The command menu is everything the app can do, found by
  typing — reach for it when a menu would need a second level.
- **`BaseSelect` or `BaseCombobox`.** Up to a few dozen options, the native
  select — it opens the platform's own picker, which on a phone no web control
  matches. Past that, when reading the list is the problem, the combobox. The
  combobox also takes `mode="multiple"` (chips in the field), a list from a
  server (`@search` is debounced for you — pair it with `filter="none"`, or
  the client narrows what the server already narrowed), and a list too long
  to render (past `virtualizeAfter` only the rows near the viewport are in
  the DOM, while every row still states its place in the whole list).
- **`BaseCombobox mode="multiple"`, `TagsInput` or `TransferList`.** The
  combobox chooses several from a list that exists; the tags field invents
  values as you type; the transfer list shows the two sides at once, and is
  the one to reach for when the order of the chosen matters.
- **`SegmentedControl` or `ToggleGroup`.** A segmented control always has
  exactly one answer — it is a set of radios. A toggle group is buttons that
  stay pressed: one or none in `single` mode, any number in `multiple`.
- **`NumberInput` or `BaseSlider`.** A number someone knows — a count, a
  price — is typed or stepped. A number someone feels out along a range is
  slid.
- **`BaseBadge` or `BaseChip`.** A badge is a standing label and never a
  control: a status, a count. A chip is one of a set somebody assembled and
  can take apart — a filter, a recipient — so it removes, selects, or both.
- **`BaseLink` or `BaseButton variant="link"`.** If it goes somewhere, it is
  a link. If it does something — clears a note, signs out — it is a button
  that happens to read as text.
- **`BaseSkeleton` or `SkeletonList`.** The list is rows of the same shape,
  which is most loading states. The primitive is for the ones it does not
  cover: an avatar, a heading, a chart.
- **`BaseCheckbox` or `BaseSwitch`.** A checkbox states an intention something
  else commits; a switch is the commit, with no Save after it.
- **`BaseAccordion` or `BaseDisclosure`.** The accordion owns the list. When
  the list is the app's — rows staggered as they scroll in, interleaved with
  anything else — use one disclosure per row.
- **`NumberTicker` or `CountUp`.** A ticker rolls each digit like an
  odometer, and suits a whole number that changes while you watch: a balance,
  a count. `CountUp` passes through every value on the way and waits until it
  is on screen. It suits a statistic on a landing page, and decimals.
- **`ProgressBar` or `BaseSpinner`.** A bar is a promise about how long. When
  there is no amount to show, a spinner, not a bar that cannot move.
  `CircularProgress` is either, as a ring, for a small space: with a `value`
  it fills, without one it turns.
- **`MegaMenu`, `NavLinks` or `BaseMenu`.** `NavLinks` is a row of links.
  The mega menu is the same row where a section holds more than a row can:
  each top item discloses a panel of columns, and an item with no columns
  stays a plain link. Neither is `BaseMenu` — a menu is `role="menu"`, which
  is for an application's actions and promises a keyboard contract that
  links do not have.
- **`BaseTabs`, `TabBar` or `NavLinks`.** `BaseTabs` switches panels inside one
  page and leaves no history. `TabBar` and `NavLinks` navigate, and share one
  item shape so moving between a bottom bar and a top one is a component swap.

## Tokens

Redefine values; never rename. Every component reads these.

| Token                               | Role                                          |
| ----------------------------------- | --------------------------------------------- |
| `primary`                           | main action, active state                     |
| `accent`                            | secondary emphasis                            |
| `positive` / `negative` / `warning` | semantic state                                |
| `on-primary` … `on-warning`         | text on each filled role — never `text-white` |
| `canvas`                            | page ground                                   |
| `surface`                           | card ground                                   |
| `muted`                             | tinted fill, inactive segment                 |
| `ink` / `ink-soft`                  | text, secondary text                          |
| `hair`                              | borders and dividers                          |

Radii: `--radius-cell` 3px, `--radius-card` 16px, `--radius-shell` 30px.
Measures: `--measure-page` 75rem, `--measure-reading` 68ch.
Depth: `--shadow-card`, `--shadow-raised`, `--shadow-overlay`,
`--shadow-control`, `--shadow-control-pressed`.
Motion: `--ease-standard`, `--ease-sheet`, `--duration-fast|base|slow|slower`.
Dark mode is class-based: `.dark` on `<html>` — `useTheme` does it.

**Write `text-on-primary`, never `text-white`, on a filled role.** White on the
kit's own warning colour measured 2.3:1; a palette with a light primary sets its
`on-primary` dark and every component follows.

## Surfaces, materials and palettes

Paint a surface with a surface utility, not with its parts. These are what a
material redefines:

| Utility           | For                                                  |
| ----------------- | ---------------------------------------------------- |
| `surface`         | a card on the page                                   |
| `surface-raised`  | something lifted off it: a toast, a popover          |
| `surface-overlay` | over the whole page: a dialog, a menu, a sheet       |
| `control`         | something you type into or press that is not primary |
| `canvas`          | the page itself — carries glass's backdrop           |

`border border-hair bg-surface shadow-lg` looks the same in the quiet material
and ignores every other one. That is the whole reason these exist.

**Reach depth at runtime: `shadow-(--shadow-card)`, never `shadow-card`.**
Tailwind builds a theme shadow's utility by inlining its value, so a
`shadow-*` class is frozen at the quiet material's depth. The depth tokens are
kept out of `@theme` for this reason — there is no `shadow-card` class to reach
for — and a test fails if a component uses one.

To lift one surface without a second shadow utility racing the first, set its
hook: `[--surface-shadow:var(--shadow-raised)]`. `--surface-border-color`
works the same way for a tinted edge.

Choose a material or palette with an attribute on `<html>` or any element —
`data-material="glass"`, `data-palette="nord"` — or at runtime with
`useMaterial()` / `usePalette()`, which persist like `useTheme()`. No
attribute is `quiet` and `rei`. The ten palettes are in `PALETTES`, each with
a four-colour `swatch` for a picker.

## Utilities

Pure, no Vue, no clock of their own.

| Export                                                        | Signature                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `toDateKey(date)` / `fromDateKey(key)`                        | `Date` ⇄ `'YYYY-MM-DD'`, always local                               |
| `todayKey()` / `addDays(key, n)` / `lastNDays(count, today?)` | oldest first                                                        |
| `startOfWeek(key, weekStartsOn)`                              | `WeekStart` is `0` Sunday, `1` Monday                               |
| `eachDayOfYear(year)` / `leadingBlanks(key, weekStartsOn)`    | calendar grids                                                      |
| `formatDate(date, Intl options)` / `setFormatLocale(tag)`     | follows the active locale; the i18n runtime sets it for you         |
| `relativeDayLabel(key, today, { today, yesterday })`          | else the weekday                                                    |
| `safeRedirect(queryValue)`                                    | same-origin paths only; rejects `//host`                            |
| `toRedirectPath(fullPath)`                                    | drops the URL fragment before it becomes a query parameter          |
| `downloadJson(data, filename)` / `tapFeedback(ms?)`           | `tapFeedback` is a safe no-op on iOS                                |
| `isInstalled()` / `needsIosInstall()` / `isApplePortable()`   | install prompts                                                     |
| `AppError` / `toAppError` / `registerErrorMapper`             | `kind` is `'conflict'\|'not-found'\|'network'\|'denied'\|'unknown'` |
| `ensureSheetRoot()`                                           | `BaseSheet` calls it; exported for mounting the root earlier        |

**Never use `toISOString()` for a date key.** It is UTC, so a late-evening
entry lands on tomorrow for anyone east of Greenwich. That is what
`toDateKey` exists to prevent.

**Never put `to.fullPath` straight into a `?redirect=`.** Supabase's implicit
OAuth flow returns the access and refresh tokens in the URL fragment. A
fragment never reaches a server; copied into a query parameter it does, on the
very next request, into access logs and `Referer`. `createAuthGuard` routes
every redirect through `toRedirectPath` for this reason.

## Composables

| Export                                   | Returns                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------- |
| `useTheme()` / `setThemeStorageKey(key)` | writable ref `'system'\|'light'\|'dark'`; assigning stores and applies it |
| `useMaterial()` / `usePalette()`         | writable refs, persisted; assigning applies the attribute                 |
| `useToday()`                             | readonly ref of today's key, refreshed at midnight and on tab focus       |
| `useOnline()` / `useMediaQuery(query)`   | readonly boolean refs                                                     |
| `useToast()`                             | `success` `info` `warning` `danger`; render one `ToastHost` per app       |
| `useDebouncedCallback(fn, ms)`           | `{ run, cancel }`                                                         |
| `useDragScroll(elRef)`                   | `{ didDrag }` — pointer-driven horizontal scrolling                       |
| `useVisualViewport()`                    | `{ height, offsetTop } \| null`, for keyboard-aware sheets                |

`useToday()` exists because `todayKey()` called in `setup` freezes: an app left
open overnight keeps writing to yesterday.

`rei-kit/app` adds `createTabTransition`, `useThemeSync`, `createAuthGuard`,
`createTitleGuard`, `createQueryDefaults`, `createWriteReport` and
`fieldErrors`. `rei-kit/pwa` adds `useInstall` and `useSnooze`.

## i18n

```ts
export const { i18n, t, activeLocale, useLocalePreference, loadActiveLocale } = createI18nRuntime({
  locales: ['en', 'tr'] as const,
  fallback: 'en',
  intlTags: { en: 'en-GB', tr: 'tr-TR' },
  messages: en, // the fallback, bundled
  loaders: { tr: () => import('./locales/tr') },
  storageKey: 'myapp-locale',
})
```

Then `await loadActiveLocale()` before `app.mount()`, or a non-fallback user
sees one frame of the wrong language.

Type every other catalogue as `typeof en` — that is what makes a missing key a
build error instead of a raw key on screen. Two characters to avoid in message
values: `@` starts a linked message and `|` separates plurals, so an email
placeholder must be written `"you{'@'}example.com"`. Compilation is lazy, so
this only fails at runtime — worth a test that calls `t()` on every key.

**The kit has no language of its own.** Every visible string is a required
prop. A component with an English default would ship English into an app that
has none, and it would do it silently.

## Supabase (optional)

```ts
import { createSupabaseClient, setRememberMe } from 'rei-kit/supabase'

export const supabase = createSupabaseClient<Database>(url, anonKey)
```

Importing this entry also registers the Postgres error mapping, so `toAppError`
returns `'conflict'` for 23505, `'not-found'` for PGRST116 and `'denied'` for
42501 and an expired token. `setRememberMe(false)` moves the session to
`sessionStorage` so it dies with the tab. `toAuthMessageKey(error)` returns a
message key rather than a sentence, so an error stored before a language
switch still reads correctly after it.

## Shell layout

`rei-kit/shell/mobile.css` ships opt-in classes for a phone-shaped app:
`.shell-frame` (430px column, full height), `.page-slide` and `.page-auth`
(scroll container with the right bottom clearance), and the
`.slide-forward-*` / `.slide-backward-*` transition pairs that
`createTabTransition().name` resolves to. `rei-kit/shell/web.css` is the wide
equivalent. `tokens.css` adds `no-scrollbar`, `pb-safe` and `focus-ring`.

`rei-kit/motion.css` (in both presets) adds `animate-float`,
`animate-pulse-soft`, `animate-glow`, `animate-wiggle`, `animate-pop` and
`text-shimmer`, whose colours come from `--shimmer-base` and
`--shimmer-band`. All of them stop under `prefers-reduced-motion`, so there is
no need to write `motion-safe:` in front of them.

**Every control drawn by hand carries `focus-ring`** (or states its own
`:focus-visible` ring), and an `sr-only` input hands its focus to what is
visible with `peer` / `peer-focus-visible:`. A test reads every component for
both, because a missing ring compiles, renders and passes every other check.

`BaseSheet` teleports to `#sheet-root` so the app behind it can be made
`inert`. It creates that node if the page has none; an app that declares one
keeps it.

## Changing this package without breaking an app

Since 1.0.0, a minor adds and a patch fixes. Neither removes an export,
renames a prop, or changes what a component renders for the same input. A
breaking change waits for the next major and arrives with its reason in
`CHANGELOG.md`.

Four checks hold that line, and each catches something the others cannot:

- **`public-api.spec.ts`** names every export. The kit compiles fine without an
  export nothing inside it calls, so removing one would otherwise pass.
- **`showcase-catalogue.spec.ts`** regenerates the prop catalogue and asserts it
  matches the exports in both directions, that every component has a
  description, that every component is mounted by a behaviour test, and that
  every component has a row in this file.
- **`consumer.yml`** packs the real tarball, installs it into all three apps and
  runs each one's whole gate — the only check that imports the package the way
  an app does. Kakehashi's build is `vite-ssg build`, so this is also the real
  prerender; `ssr.spec.ts` cannot stand in for it, because jsdom supplies the
  very `document` a server lacks.
- **Visual comparison** of the three apps before and after, because a lost focus
  ring or a heading that stopped growing passes every one of the above.

A new component also needs its sample, `showcase/examples/<Name>.vue`.
`examples.spec.ts` fails without one, and fails on a prop, model or event the
component does not have, or a required prop left out — the type-check cannot
see those, because Vue passes an unknown prop on as an attribute. The
JavaScript version on the page is generated from it by
`scripts/extract-examples.mjs`.

If you change a prop name or drop an export, expect the consumer check to fail.
That is the point.
