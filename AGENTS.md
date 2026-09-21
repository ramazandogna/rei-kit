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

A Vue 3 + Tailwind 4 component kit. 105 components across six entry points,
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

| Entry              | What it is for                                              | Components                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rei-kit`          | What any app has                                            | `ActivityGrid` `AnnounceHost` `AvatarStack` `BarChart` `BaseAlert` `BaseAvatar` `BaseBadge` `BaseButton` `BaseCalendar` `BaseCard` `BaseCheckbox` `BaseChip` `BaseCombobox` `BaseDatePicker` `BaseInput` `BaseKbd` `BaseLink` `BaseListbox` `BasePopconfirm` `BaseMenu` `BasePopover` `BaseRadioGroup` `BaseRating` `BaseSelect` `BaseSeparator` `BaseSheet` `BaseSkeleton` `BaseSlider` `BaseSpinner` `BaseStepper` `BaseSwitch` `BaseTable` `BaseTextarea` `BaseTimeline` `CircularProgress` `CodeBlock` `ColorPicker` `CopyButton` `DescriptionList` `DonutChart` `EmptyState` `ErrorBoundary` `ErrorSummary` `FileDrop` `FormField` `GoogleButton` `LocaleLinks` `NumberInput` `PageContainer` `PageHeader` `PasswordInput` `PinInput` `PriceCard` `ProgressBar` `ScrollArea` `SectionHeading` `SegmentedControl` `SettingsGroup` `SettingsRow` `SkeletonList` `SliderField` `StatCard` `TabBar` `TagsInput` `TimePicker` `ToastHost` `ToggleGroup` `ToneDot` `VirtualList` |
| `rei-kit/web`      | A wide site with a header and a mouse                       | `BaseAccordion` `BaseBreadcrumb` `BaseContextMenu` `BaseDisclosure` `BaseDrawer` `BaseHoverCard` `BaseModal` `BasePagination` `BaseSplitter` `BaseTabs` `BaseToolbar` `BaseTooltip` `BaseTree` `CommandMenu` `DataTable` `MegaMenu` `NavLinks` `ResponsiveDialog` `SkipLink` `TransferList`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `rei-kit/app`      | A phone-shaped app with tabs and a sign-in screen           | `AuthForm` `AuthShell` `FabButton` `LocaleSheet` `OfflineBanner` `TabShell` `TourShell`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `rei-kit/pwa`      | Installing and updating                                     | `InstallPrompt` `InstallSettings` `UpdatePrompt`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `rei-kit/motion`   | Numbers that count, words that change, content that arrives | `NumberTicker` `CountUp` `TextRotate` `TypeWriter` `BaseReveal` `BaseMarquee`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `rei-kit/supabase` | Optional; importing it is the opt-in                        | none — `createSupabaseClient`, `setRememberMe`, `toAuthMessageKey`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

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
- **`BaseContextMenu`.** The right-click menu, and the reason it is a kit
  part rather than four lines in an app: the half that breaks is the half
  with no mouse in it. It opens on **Shift+F10** and the **Menu** key as
  well, anchored to the focused element since there are no coordinates to
  take. Without those, the actions in it do not exist for anyone not
  holding a mouse, and nothing on screen says so.
- **`BaseDrawer`, `BaseSheet` or `BaseModal`.** A sheet belongs to a thumb:
  it arrives from the bottom and is pinned to the 430px shell column. A
  drawer is the wide screen's version — in from the side, as tall as the
  window — and it is the shape for what a site keeps _beside_ the page
  rather than on top of it: filters, a cart, a menu that outgrew its bar. A
  modal interrupts and wants an answer; a drawer is somewhere to work.
  `side` is `start`/`end`, so it follows the writing direction rather than
  hard-coding left and right.
- **`BaseModal` or `BaseSheet`.** A modal arrives from nowhere in the middle of
  what you were reading and is dismissed by leaving it. A sheet arrives from
  the bottom edge, belongs to a thumb, and is pinned to the 430px shell column
  — so on a desktop it is narrow, and that is correct.
- **An open panel stays on screen.** `BaseMenu`, `BasePopover`,
  `BaseCombobox` and `BaseHoverCard` all flip above their trigger when
  there is more room there, and slide back in from the side of the window, re-measuring while
  the page scrolls under them. `BaseDatePicker`, `TimePicker` and
  `ColorPicker` get it through the popover. Only the popover did before
  2.23.1, which is why a menu button near the bottom of a phone, or the
  last field before the submit button, opened a list that ran off the
  screen.

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
  selection keyed by row rather than by index, and a loading state. Both
  scroll through `ScrollArea`, so a wide table is a named focus stop only
  when its cells are text — a table of links already moves under the
  keyboard, and the stop both of them used to have unconditionally was a
  press for nothing on every one.
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
- **`NumberInput`, `BaseSlider` or `SliderField`.** A number someone knows —
  a count, a price — is typed or stepped. A number someone feels out along a
  range is slid. `SliderField` is both on one value, for a wide range with an
  exact answer somewhere in it: drag to find roughly right, type to land on
  it. Both of its controls carry the same name, because they are one answer.
- **`BaseHoverCard` or `BaseTooltip`.** A tooltip is a sentence, and it is
  wired with `aria-describedby`, which flattens whatever is in it to text.
  That is right for a sentence and wrong for anything else: a card with a
  name, an avatar and a link would read as one run-on string and the link
  could not be reached at all. Reach for the hover card when the answer is
  a _thing_ — a profile, a preview of where a link goes. It is supplementary
  by definition, so everything in it must be reachable another way: a touch
  screen has no hover.
- **`BaseTooltip follow`.** A bubble pinned to the middle of a big target —
  a chart, a calendar cell — is nowhere near what is under the cursor;
  `follow` tracks it. It is the one thing here that needs JavaScript, so it
  is opt-in, and it falls back to the anchored bubble for a keyboard and for
  a reader who asked for less motion.
- **`ColorPicker`.** A colour as `#rrggbb`, from the platform's own picker —
  the same decision as `BaseSlider`, which is a native range painted. The
  swatches beside it are the app's, values _and_ names: a row of colours
  from the kit would be a product decision, and unnamed ones would be
  buttons a screen reader reads as nothing. `PALETTES` is a ready source for
  an app that wants the kit's ten. The hex field appears only when
  `hexLabel` is given.
- **`CodeBlock`.** A sample as written: the text goes in as text, because a
  code sample is the one place where what is written is exactly what is
  meant. No highlighting — that is a parser in every bundle or `v-html` and
  a promise about the string nobody can keep — so an app that wants colour
  highlights it itself and puts the result in the slot. When it scrolls it
  is a focus stop and it is named, or the end of a long line cannot be
  reached with a keyboard at all; `wrap` is the other answer and drops the
  stop.
- **`BaseBadge` or `BaseChip`.** A badge is a standing label and never a
  control: a status, a count. A chip is one of a set somebody assembled and
  can take apart — a filter, a recipient — so it removes, selects, or both.
- **`BaseLink` or `BaseButton variant="link"`.** If it goes somewhere, it is
  a link. If it does something — clears a note, signs out — it is a button
  that happens to read as text.
- **`BaseSkeleton` or `SkeletonList`.** The list is rows of the same shape,
  which is most loading states. The primitive is for the ones it does not
  cover: an avatar, a heading, a chart.
- **`PasswordInput` or `BaseInput type="password"`.** The plain field when
  nobody has to get the value right first time — an unlock, a field beside a
  password manager. The password input whenever it is being _set_ or typed on
  a phone: it is the only field whose value is hidden from the person typing
  it, on the device where typing is least reliable, and a generated password
  pasted in cannot be checked at all without it. The toggle is a real
  `<button type="button">` — with no `type` it defaults to submit, so looking
  at your own password submits the form — and it keeps one name with
  `aria-pressed` rather than swapping "Show" for "Hide": a name that changes
  under a focus that has not moved is not reliably re-read, and a pressed
  state is.

- **`BaseCheckbox` or `BaseSwitch`.** A checkbox states an intention something
  else commits; a switch is the commit, with no Save after it. A box that
  stands for a list of others takes `indeterminate` — neither on nor off,
  because some of them are. It is a DOM property with no markup for it,
  which is why a select-all box is the one control every app writes by
  hand; the kit's own `DataTable` did, until `BaseCheckbox` grew it.
  `labelHidden` is for a box in a table cell whose row already says what it
  is — dropping the label instead leaves it named nothing at all.
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
- **`ErrorSummary` or the messages beside the fields.** Both. `FormField`
  puts the reason where the reader's eye is and where it stays until the
  field is fixed; what it cannot do is say that the _submission_ failed.
  On a long form the first rejected field is a screenful away, focus is
  still on the submit button, and to a reader nothing happened when it was
  pressed. The summary is the answer to "did that work?" and a way into
  each field in one press. It is **focused, not announced** — `role="alert"`
  would read the list at someone whose focus is still on a button they
  cannot use. Give each `FormField` a `fieldId` and hand the summary the
  same function, or its links point at nothing.

- **`SkipLink`.** The first thing in the tab order, invisible until it has
  focus. The kit ships `NavLinks` and `MegaMenu` — the same header on every
  page — so it ships the thing that creates the need, and bypassing a
  repeated block is WCAG 2.4.1, Level A. The half that is usually broken is
  the important one: a bare `<a href="#main">` scrolls the page and leaves
  focus on itself, still inside the header, so the next Tab goes to the
  second nav item and the link has done nothing while looking like it
  worked. This moves focus itself, giving the target `tabindex="-1"` on the
  way — focusable by script, never by Tab.

- **`createRouteAnnouncer`.** The other half of `createTitleGuard`. A real
  page load announces the new title; a single-page app has no page load, so
  the title changes, the view is replaced and for a reader **nothing
  happened** — they are still in content that is no longer on screen. This
  announces the new page and, given `focus`, moves focus into it, so the
  next Tab does not start again from the top of the header. Register it
  _after_ the title guard, or it announces the page that was just left.

- **`AnnounceHost` and `announce()`, or a live region of your own.** The kit
  has a live region in a dozen components already, but each belongs to
  something on screen. `announce()` is for what has no component: a filter
  that narrowed a list to three, a client-side route change, a draft that
  saved itself. On screen those are obvious; to a reader they are silence.
  Render one `AnnounceHost` per app. It is **not** for anything visible —
  a message on screen should _be_ the live region (`BaseAlert`,
  `FormField`, a toast), not be duplicated into this one.

- **A height on `ScrollArea` goes on `ScrollArea`.** The class you write
  lands on its wrapper, and the wrapper is a flex column, so `max-h-56` or
  `h-full` reaches the box that actually scrolls. Before 2.23.1 it did not,
  and the failure was quiet in the worst way: `VirtualList` sizes its window
  from that box, so an unconstrained one reported the height of the whole
  list and rendered every row of it.

- **`ScrollArea` or a `div` with `overflow-auto`.** The plain div is fine
  until the app hides the scrollbar, which all three here do on a
  horizontal row — a bar under a 40px strip of chips is louder than the
  strip. What goes with the bar is the only sign on screen that there is
  more along the row, so `ScrollArea` puts it back as a fade at whichever
  edge has content past it, driven by the real scroll position. It also
  becomes a named focus stop, but **only when it overflows and holds
  nothing focusable** — that is the `CodeBlock` fault generalised, and
  conditional because a row of buttons already moves under the keyboard and
  a stop of its own would cost a press on every row.

- **`VirtualList` or a plain `v-for`.** The plain loop until the list is
  long enough that rendering it is the problem; past that, the list where
  only the rows near the viewport exist. The half that is usually dropped
  is the reader's: ten thousand names rendered twenty at a time read as a
  list of twenty, and as a _different_ list after every scroll, unless
  every row states its real place with `aria-setsize` and `aria-posinset`.
  Rows are a fixed `rowHeight`, which is what lets the window be a division
  rather than a measurement of every row — and what makes the empty space
  above and below exactly right, so the scrollbar stays honest about the
  length. `BaseCombobox` does this inside itself past `virtualizeAfter`;
  both share one internal `useVirtualWindow`, so the arithmetic — and the
  padding that keeps the scrollbar honest — cannot drift between them.

- **`BarChart` or `DonutChart`.** Bars compare, the ring composes. Judging
  two angles is harder than judging two lengths, so values that need
  ranking are bars — the ring is for when the point is that the slices
  *add up*: where a budget went, what a bundle is made of. Both are the
  data as text with a picture beside it rather than a picture with a
  sentence about it: the bar chart is a real `<table>` and the ring's
  legend carries every name and number, so nothing has to be described by
  hand and then go stale. `BarChart`'s scale starts at zero and there is no
  prop to change that — `max` raises the ceiling, nothing lowers the floor,
  because an axis starting at 80 is how a true set of numbers is used to
  say something false. Colours come from `fill`, like `ToneDot`'s.

  Neither is a chart library. No axes, no legends of their own, no time
  scales, no stacking. An app that needs those reaches for something built
  for it, and pays for it.

- **`ActivityGrid` or `BaseCalendar`.** The calendar is one month, and it
  is for choosing a day. The activity grid is a long stretch of them — a
  year — for seeing a shape: a streak, a gap, a habit. It is a real
  `<table>`, weekdays down and weeks across, because the column-flowing CSS
  grid everyone writes first puts the DOM in a different order from the
  picture, and every keyboard and reader laid over it afterwards then
  describes a shape that is not on screen. The whole year is one tab stop.
  `levelFor` returns a class, like `ToneDot`'s `fill`: the kit does not know
  whether four of something is a lot.
- **`BaseTimeline` or `BaseStepper`.** A stepper is a process you are _in_: a
  current step, steps ahead that have not happened, steps behind you can go
  back to. A timeline is a record of what already happened — not a control,
  and with no "next". A stepper drawn from history implies the reader can
  move through it; a timeline drawn for a checkout leaves them with no idea
  where they are. `BaseTimeline` is generic over your own objects, like
  `BaseTable` is over its rows, so the body slot hands them back typed.
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

**A role never writes on a wash of itself.** `bg-positive/12` with
`text-positive` is the obvious way to build a coloured badge and it is
unreadable by construction — a faint wash of a colour over a surface is
still nearly that colour, and the pair measured between 1.5 and 4.3 to one
across the ten palettes. The ground and the edge carry the role; `text-ink`
carries the words. `BaseBadge`, `BaseChip`, `BaseAlert`, `BaseListbox` and
`PriceCard` all do this, a test fails on the other version, and an element
that is `aria-hidden` is exempt because a decorative glyph is not text.

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
| `textDirection(localeTag)`                                    | `'ltr'` or `'rtl'`; the i18n runtime sets `dir` from it             |
| `elementDirection(element)`                                   | `'ltr'` or `'rtl'` from the nearest `dir`, else the document        |
| `horizontalStep(key, element)`                                | `ArrowLeft`/`ArrowRight` as `-1`/`1`, mirrored where the writing is |
| `safeRedirect(queryValue)`                                    | same-origin paths only; rejects `//host`                            |
| `toRedirectPath(fullPath)`                                    | drops the URL fragment before it becomes a query parameter          |
| `downloadJson(data, filename)` / `tapFeedback(ms?)`           | `tapFeedback` is a safe no-op on iOS                                |
| `isInstalled()` / `needsIosInstall()` / `isApplePortable()`   | install prompts                                                     |
| `AppError` / `toAppError` / `registerErrorMapper`             | `kind` is `'conflict'\|'not-found'\|'network'\|'denied'\|'unknown'` |
| `ensureSheetRoot()`                                           | `BaseSheet` calls it; exported for mounting the root earlier        |

**`ArrowLeft` is not "previous".** It is "previous" only where the
language runs left to right. A row of tabs in Arabic runs the other way, so
the tab to the left of the current one is the *next* one — WAI-ARIA says so
explicitly, and every roving-tabindex control in the kit walked backwards
through itself until 2.23.0. Every one of them now reads the key through
`horizontalStep`, and so should anything an app writes beside them. Nothing
else catches this: the code type-checks, the styles are already logical, and
the keys are the same keys.

**The direction is not decoration.** Every logical property in the kit —
every inset, every margin, `BaseDrawer`'s `start`/`end` — is inert until
`dir` is set on the document. `createI18nRuntime` sets it, from the active
locale, alongside `lang`. An app with no i18n runtime and more than one
direction sets it itself, with `textDirection`; an app that never sets it
at all gets a layout mirrored the wrong way the day it adds Arabic, with
every check green.

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
`createTitleGuard`, `createRouteAnnouncer`, `createQueryDefaults`, `createWriteReport` and
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

- **`public-api.spec.ts`** names every runtime export of all six entries. The
  kit compiles fine without an export nothing inside it calls, so removing
  one would otherwise pass. It guarded only `rei-kit` until 2.15.0, which
  read as more than it was: a composable could vanish from `rei-kit/web` or
  `rei-kit/pwa` with every check green.
- **`showcase/type-surface.ts` and `type-surface.spec.ts`** do the same for
  types, which a test cannot check directly — types are gone by the time one
  runs, and `src/__tests__/` is excluded from every tsconfig. So the surface
  file re-exports every published type and is type-checked twice: rename or
  remove one and it stops compiling. The spec then reads the entry files and
  fails on a type that never reached the surface, which is the half a
  compiler cannot catch. **A new exported type needs a line in that file.**
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
