# rei-kit for assistants

Everything an agent needs to build a screen with this package. Hand this file
over at the start of a project; it is written to be read once and used without
opening the source.

## What this is

A Vue 3 + Tailwind 4 layer: thirteen components, eight utilities, six
composables, an i18n runtime and an optional Supabase entry. Extracted from
[Hibi](https://github.com/ramazandogna/hibi), which is its first consumer.

## The one rule that explains the API

**Nothing in this package makes a decision for the app.** Components take
strings rather than calling a translator, utilities take the clock rather than
reading it, and the error type knows about no database. So:

- there is no `t()` inside a component — pass `closeLabel`, `label`, `title`
- there is no `new Date()` inside a helper — pass `today`
- colours arrive as Tailwind class strings, never as category names

That last one is not style. Tailwind scans source files as plain text, so a
class assembled at runtime (`` `bg-${kind}` ``) never reaches the stylesheet.
The app writes the classes out; the package receives them.

## Install

```sh
pnpm add rei-kit
```

Peers the app supplies: `vue` ^3.5, `tailwindcss` ^4, `lucide-vue-next` ^1.
Optional: `vue-i18n` ^11 (only for the i18n runtime),
`@supabase/supabase-js` ^2 (only for `rei-kit/supabase`).

```css
/* src/assets/main.css */
@import 'tailwindcss';
@import 'rei-kit/tokens.css'; /* Tailwind source: tokens + utilities */
@import 'rei-kit/styles.css'; /* compiled component styles */

/* the whole rebrand */
@theme {
  --color-primary: #6b4de6;
  --color-positive: #2fa36b;
  --color-negative: #d1453b;
}
```

Import `styles.css` or scoped component styles silently do nothing — sheet
transitions in particular will just not animate.

## Tokens

Redefine values; never rename. Every component reads these.

| Token                               | Role                          |
| ----------------------------------- | ----------------------------- |
| `primary`                           | main action, active state     |
| `accent`                            | secondary emphasis            |
| `positive` / `negative` / `warning` | semantic state                |
| `canvas`                            | page ground                   |
| `surface`                           | card ground                   |
| `muted`                             | tinted fill, inactive segment |
| `ink` / `ink-soft`                  | text, secondary text          |
| `hair`                              | borders and dividers          |

Radii: `--radius-cell` 3px, `--radius-card` 16px, `--radius-shell` 30px.
Dark mode is class-based: put `.dark` on `<html>` — `useTheme` does it.

## Components

`v-model` marks two-way binding. All are named exports from `rei-kit`.

| Component          | Props                                                                                        | Notes                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BaseButton`       | `variant` `'primary'\|'ghost'\|'danger'`, `size` `'sm'\|'md'`, `loading`, `disabled`, `type` | Default slot is the label                                                                                                                                      |
| `BaseInput`        | `label`\*, `error`, `hint`, `labelHidden`, `type`; `v-model` string                          | `labelHidden` keeps the accessible name when the row already titles it                                                                                         |
| `BaseSheet`        | `title`\*, `subtitle`, `closeLabel`; `v-model` boolean                                       | Teleports to `#sheet-root` — add `<div id="sheet-root">` beside `#app` in index.html. Traps focus with `inert`, sizes to `visualViewport` for the iOS keyboard |
| `EmptyState`       | `title`\*, `description`; slots `icon`, `action`                                             |                                                                                                                                                                |
| `PageHeader`       | slots `left`, `title`, `right`                                                               | Fixed three-column grid so titles stay centred                                                                                                                 |
| `SectionHeading`   | `tone`\* `Tone`, `label`\*, `count`                                                          | `count` hidden when 0                                                                                                                                          |
| `SegmentedControl` | `options`\* `{value,label}[]`; `v-model`                                                     | Radio inputs: arrow keys and "one of N" for free                                                                                                               |
| `SettingsGroup`    | `title`\* ; default slot                                                                     | Card with hairline-divided rows                                                                                                                                |
| `SettingsRow`      | `label`\*, `description`, `icon`, `interactive`, `stacked`                                   | `interactive` renders a button with a chevron; `stacked` puts the control on its own line                                                                      |
| `SkeletonList`     | `rows`, `rowHeight`, `label`                                                                 |                                                                                                                                                                |
| `StatCard`         | `value`\*, `label`\*, `trend` `'up'\|'down'\|'flat'\|null`                                   |                                                                                                                                                                |
| `ToneDot`          | `fill`\* class, `label`                                                                      |                                                                                                                                                                |
| `LocaleLinks`      | `locales`\*, `labels`\* endonyms, `label`; `v-model`                                         | List each language in its own language                                                                                                                         |

`Tone` is `{ fill, card, text }` — three class strings, e.g.
`{ fill: 'bg-positive', card: 'bg-positive/5 border-positive/25', text: 'text-positive' }`.
Define one per category in the app and pass it in.

## Utilities

Pure, no Vue, no clock of their own.

| Export                                                      | Signature                                                 |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| `toDateKey(date)` / `fromDateKey(key)`                      | `Date` ⇄ `'YYYY-MM-DD'`, always local                     |
| `todayKey()`                                                | today as a key                                            |
| `addDays(key, n)`                                           |                                                           |
| `lastNDays(count, today?)`                                  | oldest first                                              |
| `startOfWeek(key, weekStartsOn)`                            | `WeekStart` is `0` Sunday, `1` Monday                     |
| `eachDayOfYear(year)` / `leadingBlanks(key, weekStartsOn)`  | calendar grids                                            |
| `formatDate(date, Intl options)`                            | follows the active locale                                 |
| `setFormatLocale(tag)`                                      | the i18n runtime calls this for you                       |
| `relativeDayLabel(key, today, { today, yesterday })`        | else the weekday                                          |
| `downloadJson(data, filename)`                              |                                                           |
| `safeRedirect(queryValue)`                                  | same-origin paths only; rejects `//host`                  |
| `tapFeedback(ms?)`                                          | vibrate, safely no-op on iOS                              |
| `isInstalled()` / `needsIosInstall()` / `isApplePortable()` | install prompts                                           |
| `AppError` / `toAppError` / `registerErrorMapper`           | `kind` is `'conflict'\|'not-found'\|'network'\|'unknown'` |

**Never use `toISOString()` for a date key.** It is UTC, so a late-evening
entry lands on tomorrow for anyone east of Greenwich. That is what
`toDateKey` exists to prevent.

## Composables

| Export                         | Returns                                                                   |
| ------------------------------ | ------------------------------------------------------------------------- |
| `useTheme()`                   | writable ref `'system'\|'light'\|'dark'`; assigning stores and applies it |
| `setThemeStorageKey(key)`      | call once at startup; safe in any order                                   |
| `useToday()`                   | readonly ref of today's key, refreshed at midnight and on tab focus       |
| `useOnline()`                  | readonly boolean ref                                                      |
| `useDebouncedCallback(fn, ms)` | `{ run, cancel }`                                                         |
| `useDragScroll(elRef)`         | `{ didDrag }` — pointer-driven horizontal scrolling                       |
| `useVisualViewport()`          | `{ height, offsetTop } \| null`, for keyboard-aware sheets                |

`useToday()` exists because `todayKey()` called in `setup` freezes: an app left
open overnight keeps writing to yesterday.

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

## Supabase (optional)

```ts
import { createSupabaseClient, setRememberMe } from 'rei-kit/supabase'

export const supabase = createSupabaseClient<Database>(url, anonKey)
```

Importing this entry also registers the Postgres error mapping, so `toAppError`
starts returning `'conflict'` for 23505 and `'not-found'` for PGRST116.
`setRememberMe(false)` moves the session to `sessionStorage` so it dies with
the tab.

## Changing this package without breaking an app

Consumers pin `^0.x`, so a minor release upgrades nobody — apps opt in. Two
tests back that up: `public-api.spec.ts` names every export, because the kit
compiles fine without one nothing here calls; and `consumer.yml` packs the real
tarball, installs it into Hibi and runs Hibi's whole gate, which is the only
check that imports this package the way an app does.

If you change a prop name or drop an export, expect the consumer check to fail.
That is the point.

## Shell layout

`tokens.css` ships opt-in classes for a phone-shaped app: `.shell-frame`
(430px column, full height), `.page-slide` and `.page-auth` (scroll container
with the right bottom clearance), and the `.slide-forward-*` /
`.slide-backward-*` transition pairs. Utilities: `no-scrollbar`, `pb-safe`.
