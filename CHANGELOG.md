# Changelog

Notable changes per release. Versions follow [semver](https://semver.org); while
the major is `0`, a minor may carry a breaking change and will say so here.

## 2.18.0 — 2026-09-20

**A command menu that reads the request, not the string.**

### Fixed

- **`CommandMenu` now matches every word of the query separately.** It
  matched the whole query as one string against each field on its own, so
  "date picker" found nothing when the name was `BaseDatePicker` and the
  word "picker" lived in the keywords beside it — the two halves are in
  different fields, and somebody typing has no way of knowing that. Now each
  word has to appear somewhere in the label or the keywords, in any order,
  which is what makes a palette feel like it is reading the request.

  Found by using it: the showcase now runs its own command palette over all
  ninety-two components, and two-word searches were the first thing that
  failed.

## 2.17.0 — 2026-09-20

**What happened, in order.**

### Added

- **`BaseTimeline`** — an ordered list on a rail, for a record of what
  already happened: a status trail, a note feed, an audit log.

  This one was found by the rule rather than by taste. Hibi carries
  `HabitNoteTimeline.vue`, hand-written in a file that already imports the
  kit — which AGENTS.md calls a bug in the kit, every time. Its shape is
  what this part is built from: a rail, a dot the app colours from its own
  domain, a time line already formatted, and a body that is whatever the app
  puts there.

  The rail and the dots are `aria-hidden`. What carries the meaning is the
  `<ol>`: announced as a list with a count, each event numbered, its time
  read before its title. A rail drawn with divs says nothing at all, which
  is what a hand-written one does.

  Generic over your own objects, the way `BaseTable` is over its rows, so
  the body slot hands them back typed and nothing has to be looked up by key
  afterwards. A slot named for one event's key wins over the shared body,
  for the one row that is different. `fill` takes a class rather than a
  category — the same contract as `ToneDot` — so an app keys the marker off
  whatever its own domain calls a kind. The kit sorts nothing: newest first
  suits a feed, oldest first suits a trail, and both are the app's to
  decide.

  It is not `BaseStepper`. A stepper is a process you are *in*, with a
  current step and steps ahead; a stepper drawn from history implies the
  reader can move through it.

## 2.16.0 — 2026-09-20

**A colour, as a hex value.**

### Added

- **`ColorPicker`** — the platform's own `input[type="color"]`, painted. The
  same decision as `BaseSlider`: the native control already has the
  eyedropper, the keyboard and, on a phone, a full-screen picker no web page
  matches, so only the look is replaced.

  The swatches beside it are the app's — values **and** names. A row of
  colours shipped by the kit would be a product decision, which this kit
  does not make, and unnamed ones would be buttons a screen reader reads as
  nothing at all. `PALETTES` is a ready source for an app that wants the
  kit's ten. The hex field appears only when `hexLabel` is given, for the
  same reason `BaseChip` grows a remove button only when told what to call
  it.

  In and out as `#rrggbb`, lowercase, the way dates are `YYYY-MM-DD` and
  times are `HH:mm`. `#abc` and `#AABBCC` are accepted from somebody typing
  and normalised on the way out, so an app never compares two spellings of
  one colour. Typing is allowed to be wrong on the way: `#ab` is not a
  colour, and rewriting the field on every keystroke is what makes the third
  character impossible to type. Something unreadable is put back on blur,
  rather than leaving a field that says one thing while the colour is
  another.

  It holds no colour of its own, not even a fallback — the kit's own test
  forbids a hex in a component, and it is right to: black is as much a
  choice as any other. An unreadable value is handed to the native control
  empty, and what it shows then is the platform's decision.

## 2.15.0 — 2026-09-20

**The pair, and the pointer.**

### Added

- **`SliderField`** — a slider and a number field on one value. The two
  answer different halves of the same question: a slider shows you where you
  are in a range and is hopeless at landing on 37 out of 500; a field lands
  on 37 at once and says nothing about whether 37 is a lot. Anything with a
  wide range and an exact answer in it wants both, and apps kept building the
  pair by hand.

  Both controls carry the same name, because there are two controls and one
  answer — two names would say they were two settings that happen to sit
  together. The slider's own readout is off, since the field beside it is the
  readout. Emptying the field leaves the thumb where it was: halfway through
  typing a number there is no number, but a slider has no empty state, and
  dragging the thumb to zero as the last digit is deleted is the wrong
  answer.

- **`BaseTooltip follow`** — the bubble tracks the pointer across the
  trigger, for a target big enough that a bubble pinned to its middle is
  nowhere near what is under the cursor: a chart, a map, a calendar cell.

  It is opt-in because it is the one thing in this component that needs
  JavaScript — the default is still shown by `:hover` and `:focus-within` in
  the stylesheet, and still works in a prerendered page with scripting off.
  It stops following for a keyboard, which has no cursor, and for a reader
  who asked their system for less motion; both fall back to the anchored
  bubble, so the tooltip is never lost, only still. Updates are held to one
  per frame, since `pointermove` fires far faster than the screen redraws.

## 2.14.0 — 2026-09-20

**A mega menu, and it is not a menu.**

### Added

- **`MegaMenu`** (`rei-kit/web`) — a wide site's navigation where a section
  holds more than a row can: each top-level item discloses a panel of
  columns, and an item with no columns stays a plain link rather than
  becoming a button that does nothing when it is pressed.

  It is a **disclosure**, not `role="menu"`. A menu is an application's
  actions, and announcing links as menu items tells somebody listening that
  Tab will not work and the arrows will — both untrue, and both stated with
  confidence. Here the links are links: Tab walks them, Escape closes the
  panel and gives focus back to the button that opened it. This is the part
  hand-written mega menus get wrong, because `role="menu"` looks like the
  more accessible answer and is the less accessible one.

  Hover opens a panel, but never alone: a press and Enter open it too,
  because a hover-only menu cannot be opened by a keyboard, a touchscreen or
  a screen reader at all. The close is delayed, so the pointer can cross the
  gap between the button and the panel. A slot named for a top-level item
  adds anything else that panel needs.

### Fixed

- A press on a panel the pointer had already opened now keeps it — and pins
  it, so moving away no longer closes it. Found in a browser and not in the
  suite: hovering the button opened the panel and the click that followed
  closed it again, so on a machine with a mouse the panel could not be
  opened by clicking at all. A test now does both halves in that order.

## 2.13.0 — 2026-09-20

**The combobox, for lists that are not a handful.** Three things a real app
adds to it on its first week, and each one is a way to get the same control
subtly wrong.

### Added

- **`mode="multiple"`** — the chosen ones stay as chips in the field and the
  field stays open, because choosing several means choosing again. Choosing
  an option a second time takes it back off; Backspace on an empty field
  removes the last one, and only on an empty one, or a letter and a chip go
  with the same press. The chips carry a remove button only when
  `removeLabel` is given: a button whose name the kit invented would speak a
  language the app does not.
- **`@search`, `loading` and `filter`** — for a list that lives on a server.
  The kit holds the debounce, so every app does not write the same timer, and
  clears it on unmount, so a request is never fired at a component that has
  gone. `filter="none"` stops the client narrowing what the server already
  narrowed — otherwise rows that matched for a reason this side cannot see
  simply vanish. `loading` marks the list `aria-busy` and draws rows in the
  shape of the rows that are coming, so the list keeps its height.
- **A virtual window** past `virtualizeAfter` options (150 by default): only
  the rows near the viewport are in the DOM, with a spacer above and below
  standing in for the rest, so the scrollbar still measures the whole list.
  Every row states `aria-setsize` and `aria-posinset` against the **full**
  list — "1 of 4000", not "1 of 13". That is the part a hand-written virtual
  list gets wrong, and the part nobody sees it get wrong.

None of it changes a combobox that does not ask for it, and all three
together cost 0.8 KB — about what a virtual-list dependency costs before it
renders anything.

### Fixed

- The highlighted option is found by position again rather than by selector.
  An intermediate version reached for `CSS.escape`, which does not exist in
  jsdom or on a server: the keyboard would have thrown where the test suite
  runs and where a page is prerendered.

## 2.12.0 — 2026-09-20

**A column that reads as one column.**

### Fixed

- **A right-aligned column's heading now moves with its figures**, in
  `BaseTable` and `DataTable`. `align: 'end'` put the class on the heading
  and the cells alike, but a table's own `.rk-table th { text-align: left }`
  is one class *and* one element and outranked a bare `.is-end`, so only the
  cells moved: a money column rendered as a heading on the far left with its
  numbers at the far right, reading as two columns. Nothing could catch it —
  the markup was right, the types were right, and the page rendered. A
  stylesheet test now fails on an alignment rule weak enough to lose, and the
  sort button goes to the same side as the heading it belongs to.

### Added

- **`align: 'center'`** on a table column, alongside `start` and `end`. A
  status or an icon column belongs in the middle of its width, and writing
  that by hand was the thing the prop existed to prevent.

## 2.11.0 — 2026-09-20

**Asking, and saying.** Four parts a real app reaches for on its first week.

### Added

- **`ResponsiveDialog`** (`rei-kit/web`) — a modal on a wide screen, a sheet
  from the bottom edge on a phone, from one set of props. Two apps kept
  writing both by hand and choosing between them, which is two markups, two
  sets of labels, and one of the two always left behind. The width is read
  after mount, never guessed during render, and until it is known it is the
  sheet: the narrow answer fits on both.
- **`BasePopconfirm`** — "Are you sure?" asked beside the button that asked
  it, so the thing being deleted stays on screen. It sits between a toast
  with an undo (kindest: act, and let it be taken back) and a dialog (for an
  answer that needs explaining).
- **`TimePicker`** — a time of day from two columns, in and out as `HH:mm`
  on a 24-hour clock, shown through `Intl` in the reader's own — "14:30" in
  Istanbul, "2:30 PM" in Chicago. Two listboxes rather than a text field,
  for the reason the date picker is a button: a typed time is a parsing
  problem in every locale at once. `min`, `max` and `step` rule out what
  cannot be chosen.
- **`DescriptionList`** — pairs of what-it-is and what-it-says, as the `<dl>`
  that exists for exactly this and is almost never used. A grid of divs says
  nothing about which text names which value; here "Status: paid" is heard
  as one thing. Values that are not text come from a slot.

### Fixed

- `aria-disabled="false"` is no longer written on options that can be
  chosen, in `BaseListbox` and `BaseTree`. An option that is available says
  nothing about being disabled.

## 2.10.0 — 2026-09-20

### Added

- **`TagsInput` splits what is pasted.** "vue, html, css" becomes three
  tags, not one: a paste carrying a comma or a line break is split on both,
  which is the shape every list copied from somewhere else arrives in. A
  pasted single word is left in the field with the caret where it was.

### Fixed

- **A list that nobody is in no longer shows a current row.** `BaseListbox`
  drew its "where the keyboard is" highlight whether or not it had focus,
  which reads as a selection — and in `TransferList` that made a just-moved
  item look chosen while the button beside it stayed disabled. The highlight
  now needs focus; the tick and the tint, which mean chosen, do not.

## 2.9.0 — 2026-09-20

**The shapes a wide screen is arranged with**, and two defects found while
building them.

### Added

- **`BaseTree`** (`rei-kit/web`) — branches inside branches. The keyboard is
  the tree pattern, which is the whole reason to reach for one rather than
  nested lists: up and down move through what is on screen, right opens a
  branch and then steps into it, left closes it and then steps out to its
  parent. Each row states `aria-level`, `aria-setsize` and `aria-posinset`,
  so a screen reader can say "level 2, 3 of 7" — the only way somebody
  listening knows where they are in a shape they cannot see. What is open is
  the app's, through `v-model:expanded`, so a tree can be restored from a
  URL.
- **`BaseSplitter`** (`rei-kit/web`) — two panes and a handle. The handle is
  a `separator` with a value: the arrows move it, Home and End send it to
  its limits, and Enter puts it back where it started. A divider that
  answers only to a drag is a layout a keyboard cannot change at all.
- **`BaseToolbar`** (`rei-kit/web`) — a row of controls as one Tab stop,
  with the arrows moving inside it. It picks up whatever is focusable within,
  so the controls stay the app's. Twelve buttons in the tab order cost
  twelve presses to get past; this costs one.
- **`TransferList`** (`rei-kit/web`) — available on one side, chosen on the
  other, with two buttons between. The chosen side keeps the order things
  were moved in, because that order is usually the point.

### Fixed

- **A chip that both selects and removes nested one button inside another.**
  `BaseChip` now renders the toggle and the remove button as siblings. A
  button inside a button is not a control a browser or a screen reader can
  make sense of — the same mistake `BaseDatePicker`'s clear button was fixed
  for in 2.6.0, and now it has a test of its own.
- **`BasePopover` stayed where it opened.** A page that scrolls or a window
  that changes size under an open panel left it attached to nothing; it is
  measured again while open.

### Changed

- `BaseTree`'s selection is typed by its mode, like the toggle group and the
  listbox: `multiple` always hands back an array, and only a single choice
  can be nothing.

## 2.8.0 — 2026-09-20

**The desk-sized parts.** A table of real data, a list to choose from, and
everything the app can do behind one shortcut.

### Added

- **`DataTable`** (`rei-kit/web`) — `BaseTable` with the three things real
  data grows. The sort is a button inside the `th` and the `th` carries
  `aria-sort`, which is what a screen reader reads as "sorted ascending"; an
  arrow glyph on a div is neither. Sorting happens in the component by
  default, comparing numbers as numbers and text with `localeCompare`, so
  "Ömer" lands before "Zeynep" where the reader lives; `manualSort` reports
  the sort instead, which is what a server-paged table needs, because
  sorting the twenty rows on screen is a lie about the other nine thousand.
  Selection is keyed by row, never by index — an index selection means
  something else the moment the table is sorted — and every checkbox is
  named by the app. `loading` draws skeleton rows.
- **`CommandMenu`** (`rei-kit/web`) — the ⌘K palette: a field, results under
  it, arrows to move and Enter to run. The field is a combobox and the
  results are its listbox, so focus never leaves what you are typing in and
  `aria-activedescendant` says which result is current. Matching covers the
  `keywords` beside each label, so "new" finds "Yeni kayıt" in an app whose
  language is not English. In the wide entry because it is a keyboard
  shortcut first.
- **`BaseListbox`** — a long list that stays on screen, taking one answer or
  several. One Tab stop, arrows to move, and typing a letter jumps to the
  next option that starts with it. Between `BaseRadioGroup` (a handful, all
  visible) and `BaseSelect` (the platform's own picker).

### Fixed

- **A `CommandMenu` mounted already open never took focus** and never held
  the page — the same bug `BaseMenu` had, from a watcher that was not
  `immediate`. It looked open and behaved like a div.
- `scrollIntoView` is called defensively: it does not exist everywhere, and
  a missing scroll must not take the keyboard down with it.

### Changed

- Size budgets rise with the numbers that moved them: the whole bundle to
  36.7 KB (budget 40), the core stylesheet to 16.7 (18), the presets to 19.3
  (21).

## 2.7.0 — 2026-09-20

**The basics every kit has, and this one did not.** Ten small parts, each
one decision.

### Added

- **`BaseSeparator`** — a rule, with a word on it where that helps ("or").
  `role="separator"` when it only divides, and nothing at all to assistive
  tech when it carries a label, because then the text is the point.
- **`BaseSkeleton`** — one grey box. A height is a CSS length, never a
  class: `h-4` inside a component the app does not control renders at zero
  the day that utility is missing from the app's stylesheet, which is how
  every skeleton in one app came out invisible. `SkeletonList` is still the
  rows; this is the shapes it does not cover.
- **`BaseKbd`** — a key, or a chord, in the `<kbd>` element browsers and
  screen readers already understand. The keys are the app's words, because
  `⌘` on a Mac and `Ctrl` elsewhere is a decision about the reader's
  machine.
- **`BaseChip`** — a removable or selectable label: a filter, a recipient, a
  tag. `BaseBadge` stays what it was, a standing label that is never a
  control. `removeLabel` is required, because "×" alone is a button a
  screen reader reads as "times".
- **`AvatarStack`** — overlapped faces, and a count once there are more than
  `max`. One thing to a screen reader, named by `label`, because ten
  overlapping circles are neither ten faces nor a number.
- **`BaseLink`** — a real link, routing with `to` or leaving with `href`.
  One that leaves in a new tab carries the mark that says so and
  `rel="noopener"`, without which the page that opens can reach back
  through `window.opener`.
- **`CopyButton`** — copies, and says so: the icon and the accessible name
  change for two seconds and the change is announced politely. A refusal is
  reported rather than swallowed, which is what a silent copy button leaves
  you pasting the wrong thing after.
- **`BaseRating`** — a score out of five. Given, it is one slider the arrows
  move; read-only, it is an image with the score as its name and nothing to
  Tab into, instead of five buttons that do nothing.
- **`FileDrop`** — files, dropped or chosen. The box is a `<label>` around a
  real file input, so Tab reaches it and Enter opens it: a `div` with a
  click handler has no keyboard at all, and dragging is a gesture a keyboard
  cannot make. It holds files; sending them stays the app's.
- **`TagsInput`** — several short values in one field. Enter and a comma
  commit, Backspace on an empty field takes the last one back.

### Changed

- The all-components size budget rises from 32 to 37 KB: the ten add 2.9 KB
  together, about 0.3 KB each.

## 2.6.0 — 2026-09-20

**Dates.** A calendar, and the field that opens one.

### Added

- **`BaseCalendar`** — a month of days, for one day or a stretch of them.
  Dates cross the boundary as the kit's date keys (`YYYY-MM-DD`, local) and
  never as `Date` objects, because `toISOString()` on a late evening east of
  Greenwich is tomorrow — the bug `toDateKey` exists to prevent, and one a
  component handing back `Date`s would hand to every app.

  The keyboard is the date-grid pattern: arrows move a day and a week, Home
  and End reach the ends of the week, Page Up and Down change the month, and
  with Shift, the year. One day is in the Tab order at a time, so a calendar
  costs one press to cross rather than thirty-one. It always draws six weeks,
  so paging it does not change its height.

  Ranges take two clicks in either order, and the days between light up as
  the pointer moves, so the second click lands where it looks like it will.
  `min`, `max` and `isDisabled` rule days out. The month, the weekdays and
  every day's spoken name come from `Intl` in the app's locale; the two
  arrows are the only words an app passes, because "previous" has no date to
  build itself from.

- **`BaseDatePicker`** — the field: it shows the chosen date through `Intl`
  and opens a calendar in a popover. A button rather than a text input,
  because a typed date is a parsing problem in every locale at once —
  "03/04" is two different days either side of the Atlantic.

  `presets` are the ready-made answers a report offers ("Last 7 days", "This
  month"), in the app's words and the app's arithmetic, evaluated when
  pressed so that "today" is today. `clearLabel` adds a button that empties
  it — beside the field, never inside it, because a button nested in a button
  is not a control a browser can make sense of.

### Changed

- The size budgets rise: the calendar's styles take the core stylesheet from
  13.9 to 14.4 KB (budget 16), and the two components take the whole bundle
  to 31.2 KB (budget 32).

## 2.5.0 — 2026-09-19

**Six parts the kit was missing, and an undo on every toast.** The first
half of the gap list, the most-reached-for first.

### Added

- **`BasePopover`** — a small non-modal dialog anchored to its trigger:
  focus moves in on open, Escape returns it to the trigger, a click outside
  or a Tab out closes it. The trigger is the app's own element: the
  `trigger` slot hands over `props` to bind, rather than wrapping a button
  in a button. It flips above the trigger when there is no room below, and
  slides sideways instead of off the screen. The date picker in the next
  release is built on it.
- **`ToggleGroup`** — buttons that stay pressed: at most one in `single`
  mode (and none, unless `required`), any number in `multiple`. One Tab
  stop, crossed with the arrow keys. Icon-only buttons keep their label as
  the accessible name. Not a `SegmentedControl`, which always has exactly
  one answer.
- **`NumberInput`** — a text field that settles on numbers, with minus and
  plus buttons and the spin-button keyboard (arrows, Page Up/Down, Home/End).
  Typing is free until the field is left, then the value is clamped and
  rounded to the step's precision, so 0.1 + 0.2 is 0.3. Accepts a comma for
  a decimal point. The buttons' names are required props.
- **`PinInput`** — a one-time code or a PIN, one box per character. Typing
  moves on, Backspace goes back, the arrows move, and a paste or a phone's
  autofill fills every box. No `maxlength`, because iOS delivers an SMS code
  into the first box in one go. `complete` fires once, when the last box is
  filled.
- **`CircularProgress`** — `ProgressBar` and `BaseSpinner` as a ring: it
  fills with a `value` and turns without one, and breathes instead of
  spinning for readers who asked for less motion. Five tones; the inside is
  a slot.
- **`BaseStepper`** — where someone is in a process, as an ordered list with
  `aria-current="step"`. With `interactive`, finished steps go back to
  themselves; steps ahead never can. The words a screen reader hears for
  done and needs-fixing are the app's, in `stateLabels`.
- **Toast actions.** `toast.success('Deleted', { action: { label: 'Undo',
onClick } })` puts a button on the toast. The toast is dismissed first,
  so the button cannot be pressed twice, and it stays eight seconds instead
  of four: long enough to reach the button, not just to read the message.

Every one ships with a copyable sample in TypeScript and JavaScript, is
clean under `strictTemplates`, renders on a server, and is driven by the
keyboard in its tests.

## 2.4.1 — 2026-09-19

### Fixed

- **`BaseReveal` did nothing for content already on screen.** It hid only
  what it found below the fold, so anything in view when it mounted simply
  appeared — including every item of a list re-mounted to replay it. Content
  in view now arrives too: it is hidden before the first paint and revealed
  a frame after the observer reports it. A server render and a page read
  without JavaScript still show everything, and readers who asked for less
  motion are never hidden from.

## 2.4.0 — 2026-09-19

**Clean under the strictest template checks, and a headline effect you can
brand.**

### Added

- **`BaseButton` and `BaseInput` type their element's own attributes.**
  `@click`, `aria-label` and `role` on a button, `placeholder`,
  `autocomplete` and `inputmode` on an input were always passed through, but
  typed nowhere. Under vue-tsc's `strictTemplates`, an undeclared attribute
  is an error, so an app on that setting got errors from the kit's own
  components. They are declared with `/* @vue-ignore */`, which types them
  without making them runtime props, so they still fall through exactly as
  before.
- **The kit and every usage sample are type-checked under `strictTemplates`
  in CI** (`pnpm type-check:strict`). Thirty-two errors before this release,
  none now.
- **`text-shimmer` takes two variables**: `--shimmer-base` for the text and
  `--shimmer-band` for the light. That turns it into a brand headline:
  `text-shimmer [--shimmer-base:var(--color-primary)]
[--shimmer-band:var(--color-accent)]`. The defaults are unchanged.

### Changed

- **`BaseInput`'s model is generic**, inferred from what is bound: a
  `ref('')` gets strings back and a `ref(0)` numbers, and a form library's
  `string | undefined` is accepted as it is. It used to be
  `string | number | undefined` both ways, which a `ref('')` could not take
  under `strictTemplates`. **`BaseTextarea` and `BaseRadioGroup`** accept
  `string | undefined` and emit `string`.

  These three declare their `v-model` by hand instead of with
  `defineModel`. `defineModel` cannot be typed to both accept `undefined` and
  never emit it: with a default it stops accepting `undefined`, and without
  one it declares that it emits it. The first version of this release used a
  default, and the consumer check caught it breaking Hibi, whose form library
  binds `string | undefined` under `exactOptionalPropertyTypes`. It never
  shipped. Runtime behaviour is unchanged: an unbound field keeps its own
  value, and `.trim` and `.number` still apply.

### Fixed

- **`CountUp` showed fractions on its way to a whole number:** "12,478.245"
  while counting to 12,480. Intl's default allows three decimal places, and
  every frame between two integers is a fraction. It now counts with as many
  decimals as the value has, unless `format` says otherwise.

## 2.3.1 — 2026-09-19

**Documentation you can copy from.** No change to what the package renders
or exports.

### Added

- **A working sample for every component**, in TypeScript and JavaScript.
  The samples are real files in `showcase/examples/`, type-checked with the
  showcase and importing from the entry each component ships in, so what a
  reader copies compiles. The JavaScript is generated from them with Node's
  own type stripping, not kept by hand. `examples.spec.ts` fails on a
  component without a sample, on a prop, model or event it does not have, on
  a required prop left out, and on a JavaScript version that still has a
  type in it. The type-check alone lets an unknown prop through, because Vue
  passes it on as an attribute.
- **Get started** on the showcase, in the order a person does it: a Vue app,
  Tailwind, the kit, two lines of CSS, a component. The requirements come
  from the package's own peer ranges. Commands follow the package manager you
  pick, and samples switch between TypeScript and JavaScript. Colour has two
  paths: pick one of the ten palettes, or bring your own brand. Material also
  has two: decide once, or let your users choose.
- The hero's small version line is now a readable **Runs on** strip, with
  versions read from `peerDependencies`. The showcase also gets a footer with
  where to go next, and a credit pinned to the foot of the menu.
- The README's install section is the same five steps.

### Found on the way

Under vue-tsc's `strictTemplates`, `@click` and `aria-label` on `BaseButton`
and the model types of `BaseInput`, `BaseTextarea` and `BaseRadioGroup`
report errors. The kit's templates type-check under the default settings
this repository uses. Tightening those types is recorded for a later
release.

## 2.3.0 — 2026-09-19

**`rei-kit/motion`** — numbers that count, words that change, content that
arrives.

### Added

- **`NumberTicker`** rolls each digit to its value, like an odometer. Digit
  positions are counted from the right, so the units stay the units when the
  number grows a digit, and a separator stays where it was. Formatting is
  `Intl.NumberFormat`, so currency, grouping and decimals follow the locale.
  `from` rolls up from a start value when the component mounts.
- **`CountUp`** counts through every value with an ease-out, and only starts
  once it is on screen, so a figure below the fold has not finished before
  anyone sees it.
- **`TextRotate`** swaps one word in a sentence on an interval, and
  **`TypeWriter`** types a line, holds it and deletes it for the next. Both
  stop while hovered or focused and on `paused`. Content that moves on its
  own for more than five seconds needs a way to stop it (WCAG 2.2.2).
- **`BaseReveal`** fades, rises or grows into view on scroll. It is visible
  until it has mounted and found itself below the fold, so a prerendered page,
  or one read without JavaScript, never keeps content at zero opacity.
- **`BaseMarquee`** scrolls a row without end, with no measuring: the content
  is rendered twice and the track moves by exactly one copy. The copy is
  `inert` and hidden from assistive tech.
- **`rei-kit/motion.css`**, in both presets: `animate-float`,
  `animate-pulse-soft`, `animate-glow`, `animate-wiggle`, `animate-pop` and
  `text-shimmer`. They are theme animations, so an app pays only for the
  ones it uses, and all of them stop under reduced motion here, once. A test
  fails if a new animation is added without that line.
- **`formatNumber`** — `Intl.NumberFormat` with the same cache and the same
  active locale as `formatDate`.

Every motion part renders its finished state on a server and under
`prefers-reduced-motion`, and a screen reader hears only the final value,
never a digit mid-roll or a word half typed. Server rendering is tested in
node, each part is tested both moving and still, and the six add 1.9 KB gzip
to an app that uses all of them.

### Changed

- The component count stated in the README, AGENTS.md, the npm description
  and the showcase's link preview is checked against the package by a test.
  It said 53 in five places.

## 2.2.0 — 2026-09-19

**Two lines to install.**

```css
@import 'tailwindcss';
@import 'rei-kit/mobile.css'; /* or rei-kit/web.css */
```

### Added

- **`rei-kit/mobile.css` and `rei-kit/web.css`** — presets holding the tokens,
  the matching shell, the four materials, the ten palettes, the compiled
  component styles, and the `@source` that tells Tailwind where the
  components are.

  That last line is the reason. Tailwind builds only the classes it has seen
  and never looks in `node_modules` by itself, so every app had to write an
  `@source` with the right number of `../` for wherever its stylesheet sat.
  Getting it wrong failed nothing: the components mounted and rendered
  unstyled. A preset's `@source` is resolved from the preset's own file, so
  it is right wherever the app's stylesheet is. It scans only the compiled
  JavaScript. The source maps and type declarations name classes in examples
  no component renders, and the old path built rules for them.

  The parts are still exported one by one, unchanged.

- **`pnpm size` builds each preset with Tailwind's own scanning switched
  off**, and fails if a rule from a template class, from a compiled scoped
  style or from a kit utility is missing. Before this, a preset that stopped
  finding the components would have passed every check. The first version of
  the check passed too: Tailwind was finding the classes in this repository's
  `src/` on its own.

## 2.1.0 — 2026-09-19

**Held to the standards it claims.** An audit of the kit against the rules it
had written down, the gaps it found closed, and each rule tied to a check that
fails, so the README can say which standards the kit meets and point at the
proof.

### Added

- **`focus-ring`** — the keyboard focus ring as one utility, for any control
  an app draws by hand. Only on `:focus-visible`, so a mouse click draws
  nothing.
- **A size budget.** `pnpm size` bundles a one-button app, a three-part app
  and an app using everything, measures them the way an app's production
  build would, and fails `check` past a line. A module that drags the whole
  barrel in with a stray side effect is now caught the day it lands.
- **`bench/`** — the same three components bundled with rei-kit, Element
  Plus, Naive UI, PrimeVue, Ant Design Vue and Vuetify, each set up the way its
  own docs set it up first, styles included. Versions pinned; anyone can run
  it. Its numbers are the ones in the README.

### Fixed

- **`SegmentedControl` showed no focus at all.** Its real input is visually
  hidden, and the visible pill was never told it had focus, so moving through
  it with Tab showed nothing. It now takes the input's focus with `peer`.
  `GoogleButton`, `LocaleLinks` and `TabBar` relied on whatever the browser
  drew by default, which the materials can hide; they carry `focus-ring` now.
  A test reads every component for both rules.
- **Sheets and the guide took `#app` out of reach, and only `#app`.** That is
  the id Vite's template happens to use, not one the kit can count on: an app
  mounted on `#root` got a sheet whose background was still reachable with
  Tab. `BaseSheet`, `TourShell` and now `BaseModal` share one helper that
  makes everything outside the layer inert, whatever the app is mounted on,
  never releases what the app made inert itself, and holds the page until the
  last of several stacked layers closes.
- **Closing a sheet dropped focus on the body.** Focus was handed back before
  the page stopped being inert, and an inert element cannot take it. The page
  is released first now.
- **`BaseModal` trapped Tab but not a screen reader's virtual cursor**, which
  walks past keydown handlers. It makes the page inert as well.

## 2.0.0 — 2026-09-19

**One kit, every look.** Materials and palettes: the whole appearance of the
kit, changed with one attribute each, without a component knowing either
word.

A major because 1.0.0 promised that a minor would never change what a
component renders for the same input, and this release does — deliberately,
and listed in full under **Changed** below. Nothing is removed and nothing is
renamed; most apps take it as a version bump and a look at the screenshots.

### Added

- **Materials** — `quiet` (the default), `glass`, `brutal` and `soft`, in
  `rei-kit/materials.css`, chosen with `data-material` on any element or with
  `useMaterial()`. A material redefines how a surface is made: its fill, its
  edge, its depth, its blur and what pressing it does. They map onto the
  movements people ask for by name — glass covers glassmorphism, the spatial
  look and the frosted half of liquid glass; brutal is neo-brutalism; soft is
  claymorphism and an accessible neumorphism — but they are values, not skins.

  Glass does not refract. Real refraction needs a shader, and a kit that
  promised it in CSS would be promising something it cannot keep on fifty
  components at once. It falls back to solid where `backdrop-filter` is
  missing and for readers who set `prefers-reduced-transparency`. Soft keeps a
  real edge on every surface, because pure neumorphism relies on shadow alone
  to find a boundary and fails every contrast rule there is.

- **Palettes** — ten, each with a light and a dark mode, in
  `rei-kit/palettes.css`, chosen with `data-palette` or `usePalette()`. Seven
  are well-known open palettes by their official values: Nord, Dracula,
  Catppuccin, Solarized, Gruvbox, Tokyo Night and Rosé Pine. Three are the
  kit's own: Rei (the default), Sakura and Matcha.

  Every one is generated from a single source file by
  `scripts/build-palettes.mjs`, which chooses the text colour for each filled
  role by measuring rather than by habit and checks every text pairing in both
  modes against WCAG AA. Seven official values fell short on arrival — Nord's
  primary, Solarized's violet, Tokyo Night's secondary text among them — and
  each got the smallest nudge that clears the line. A palette that fails one
  pairing does not ship, and a test holds that.

- **The tokens that made both possible.** Depth (`--shadow-card`, `-raised`,
  `-overlay`, `-control`, `-control-pressed`), motion (`--ease-standard`,
  `--ease-sheet`, `--duration-fast|base|slow|slower`), and the five `on-*`
  colours for text on a filled role.

- **Surface utilities** — `surface`, `surface-raised`, `surface-overlay`,
  `control` and `canvas`. The single place a component learns what it is made
  of. Before these, every card wrote `border border-hair bg-surface shadow-lg`
  out in full, which is exactly why a material could not have reached them.

- **`useMaterial`, `usePalette`, `applyMaterial`, `applyPalette`, `MATERIALS`,
  `PALETTES`** — the same shape as `useTheme`: persisted, applied on change,
  shared by every caller.

- **A showcase that proves it.** A live preview built from the kit's own
  components beside the headline; a palette picker that shows each palette as
  a circle cut into its four colours; the four materials side by side.

### Changed

What looks different with no attribute set at all, and how to keep the 1.x
look if you need to.

- **Filled buttons use the on-colour, not white.** White on the kit's own
  `warning` measured 2.3:1 and failed on `positive` too, so those two now carry
  dark text. Keep white with `--color-on-warning: #fff` — knowing it fails.
- **Dark mode lightens the filled roles.** The light-mode primary stayed on in
  dark mode and measured 2.3:1 against the dark surface: every link and focus
  ring was below the line for a control. `primary`, `accent`, `negative` and
  `warning` now have dark-mode values.
  They are defaults at zero specificity: an app that sets its own roles keeps
  them in both modes, exactly as in 1.x.
- **`negative` is `#c9463b`**, from `#e05b4f`, so a destructive button reads
  as one with white text on it.
- **Cards carry a faint shadow** under the hairline edge, where they had none.
  Keep them flat with `--shadow-card: none`.
- **`StatCard` is a surface**, where it was an outline with no fill.
- **`SectionHeading` is `w-fit`.** In a parent that was not a flex column its
  `self-start` did nothing and the pill stretched across the page.
- **Motion runs on tokens.** Sixty-one hard-coded durations and curves across
  twenty-one files now read `--duration-*` and `--ease-*`; the values are the
  same, and `prefers-reduced-motion` now zeroes them all in one place.
- **Class names inside components changed** where a surface became a utility
  (`bg-surface border border-hair` → `surface`). An app test asserting a
  component's classes may need its expectation updated; nothing an app passes
  in has changed.

### Fixed

- **`PriceCard` carried four hex values** — `#b8862c`, `#4a86a8` and two darker
  shades — that could not follow any palette, and read `--shadow-card` and
  `--shadow-lift`, which only one consumer had ever defined. Everywhere else
  its shadow silently was not. It uses roles and the kit's own depth now.
- **A test asserted those hex values**, which is to say it tested that the
  component broke the kit's own rule. It asserts the roles now, and a new test
  scans every component for a hex value.
- **The Switch knob, the Slider thumb, the Fab and the Pagination current page**
  hard-coded white. They read the on-colour or the surface now.
- **The prop catalogue dropped multi-line union types**, so `BaseButton`'s
  `variant` and `BaseInput`'s `type` were missing from the published
  showcase.
- **The showcase was never type-checked**, and passed a string where
  `SectionHeading` wanted a tone object, so no heading on it had a tone. It is
  in the gate and in CI now.

## 1.0.3 — 2026-09-13

No code changes. This release exists to make the published provenance true
again.

The `v1.0.2` tag was rewritten after it had already been released. npm's
provenance attestation is signed and immutable, so it still records the commit
the tarball was built from — a commit that no longer exists on `main`. The
package contents were never affected, but anyone verifying provenance against
the repository would find the tag pointing somewhere else.

Publishing from the current history puts the two back in agreement. `1.0.2`
stays on the registry and stays installable; it is simply the one version whose
attestation names a commit you cannot browse.

Worth writing down rather than quietly correcting: rewriting a tag that has
already shipped costs more than it looks like it will.

## 1.0.2 — 2026-09-13

### Documentation

- **The showcase is in English.** It was written in Turkish, which made it
  useless as the front door of a package published to a global registry.

- **The overlays section explains itself.** It had three buttons — "open modal",
  "open sheet" — and assumed the reader already knew the difference. One of them
  looked broken: `BaseSheet` is pinned to the 430px app-shell column because a
  sheet belongs to a phone-shaped app, so on a desktop it opens as a narrow
  panel in the middle of a wide screen. Anybody who had not built a phone app
  with this kit read that as a bug.

  Each overlay now says what it is for and when to reach for it, the sheet says
  in as many words that its width is deliberate, and every demo names the
  keyboard behaviour worth testing.

## 1.0.1 — 2026-09-12

### Fixed

- **The Kakehashi link was wrong** in the README and `AGENTS.md`. The repository
  is `kakehashi-nihongo`; the link pointed at a repository that does not exist.
  CI had it right, which is why nothing failed.

### Documentation

The showcase is a documentation site now rather than a long page.

- **A menu that follows you.** Every component listed and filterable by name,
  grouped by entry point, with the current section marked. People arrive knowing
  what they need — "a dropdown", "a date field" — and want to know whether it
  exists; scrolling fifteen thousand pixels to find out is not an answer.

  The highlight cost four attempts and each one is worth recording, because they
  are the ways this is normally wrong:

  1. The showcase's own nav used `.rk-nav-link`, which is what the kit's
     `NavLinks` component calls its links. Searching for "modal" matched the
     demo's own navigation.
  2. Taking the last element the observer reported made the highlight depend on
     callback order. Several sections sit in the band at once.
  3. Taking the topmost visible one picked the section _above_ the one being
     read: a tall card ending just inside the band still counts as visible. What
     a reader means by "where am I" is the last thing that has started.
  4. The observer fires while a smooth scroll travels and then stops, so its
     last word was measured halfway through the journey. A click is better
     information than anything measured mid-flight, so measurement now waits for
     the page to settle.

- **A hero that says what the package is**, with the install line as a button
  that copies itself, and links out to npm and the repository.

- **Every section is addressable.** `#gezinme`, `#api-BaseModal` — a link to a
  component is a link somebody can send.

- On a phone the menu is a drawer rather than a permanent column: 280px of menu
  on a 390px screen is a menu with a page attached to it. It closes when you
  choose something, and while closed its links are `visibility: hidden` rather
  than merely off screen, so a Tab press cannot reach what nobody can see.

## 1.0.0 — 2026-09-12

**The version number now means something.** Until today the major was `0`, and
at `0.x` a caret range does not cross a minor — `^0.14.1` resolves to `<0.15.0`,
so publishing a minor upgraded nobody and every release was a deliberate act on
the consumer's side. That was the right default while the shape was still
moving. It has stopped moving.

### What 1.0.0 promises

- **`^1.0.0` is safe to take.** Minors add; patches fix. Neither removes an
  export, renames a prop, or changes what a component renders for the same
  input. `src/__tests__/public-api.spec.ts` lists every export by name, so
  removing one cannot pass review by accident — it has caught five omissions
  in the last week alone.
- **A breaking change waits for 2.0.0** and arrives with the reason written
  down here, not with a paragraph in a commit message.
- **The showcase is the contract you can see.** Every component, live, with its
  props: [ramazandogna.github.io/rei-kit](https://ramazandogna.github.io/rei-kit/).
  The tables are generated from the source before each build, and a test asserts
  the catalogue matches the package's exports in both directions.

### What made it ready

Three things were outstanding after 0.20.0, and this release closes the last of
them.

- **A behaviour test for every component.** Twelve had none — `EmptyState`,
  `GoogleButton`, `LocaleLinks`, `PageHeader`, `SectionHeading`,
  `SegmentedControl`, `SettingsGroup`, `SettingsRow`, `StatCard`, `TabBar`,
  `ToneDot`, `InstallSettings`. They are the oldest parts of the kit, which is
  exactly why: written before there was a habit of testing them, and never
  failing loudly enough for anybody to notice.

  Mounting is the bar rather than a coverage percentage. A component that has
  never been mounted in a test is a component whose props have never been
  passed, and that is where the quiet breakages live. A test now enforces it, so
  the next component cannot arrive without one.

  Writing them found two of my own assumptions wrong: `SegmentedControl` is a
  real radio group rather than painted buttons, and `SectionHeading` takes its
  colours as whole class names because Tailwind reads source as text. Both are
  better than what I was about to assert.

- **The package page.** The npm listing had no keywords, so the package could
  not be found by searching for what it is; no homepage, so there was no way to
  see it; and a description reading "Extracted from Hibi", which tells a
  stranger nothing. All three are fixed.

### Fixed

- **`BaseSheet` required a DOM node nothing documented.** It teleports out of
  the app's tree so the app behind it can be marked `inert` — a sheet inside the
  element it is disabling would disable itself — and that mount point had to be
  `<div id="sheet-root">` in the consumer's `index.html`. A page without it got
  a sheet that opened, blocked everything and rendered nothing: Vue warns about
  the missing teleport target and carries on, so the build is green, the types
  are fine, and the screen is wrong.

  The node is created on demand now. An app that already declares one keeps it.
  `ensureSheetRoot` is exported for anyone who wants it earlier.

  Found in the kit's own showcase, by a reader clicking the button.

- **A prop table could spill out of its card** in the showcase, where a
  component positioned absolutely needs a box of a fixed height and the table
  was inside it.

## 0.20.0 — 2026-09-12

The three things standing between this and 1.0.0, and they were all the same
thing: a kit you cannot see, cannot read, and cannot finish a form with.

### Added

- **The showcase covers the whole package.** It showed 22 of 53 components, and
  the 31 it left out were the ones hardest to install correctly — the dialog,
  the menu, the combobox, the phone shell. Somebody comparing kits looks at the
  gallery and concludes the package is the part they can see, which is how the
  newest consumer came to hand-write 737 class attributes against a kit that
  already had most of what it needed.

  It is published now, from `main` rather than from a tag: the showcase
  describes what the package is, not what the last release was.

- **Prop tables, generated from the source.** `scripts/extract-props.mjs` reads
  every `defineProps` and the comment above it and writes
  `showcase/props.generated.json`, which the page renders. A table maintained by
  hand is wrong by the second release, and wrong is worse than absent because a
  reader trusts it. A test regenerates the catalogue and asserts it matches the
  package's exports in both directions — nothing ships undocumented, and nothing
  is documented that no longer exists.

  Writing that test found five components with no description at all —
  `EmptyState`, `GoogleButton`, `PageHeader`, `SettingsGroup`, `StatCard`. They
  have one now.

- **`BaseTable`** — rows of data with the parts a hand-written `<table>` leaves
  out. The caption is required, because a table with no caption is announced as
  "table" and nothing else. The scroller is focusable: a region you can only
  reach by dragging is a region a keyboard cannot read at all, which is one line
  of markup and the line everyone forgets.

- **`BaseCombobox`** — a field you type into to narrow a long list. Reach for
  `BaseSelect` up to a few dozen options; a native select uses the platform's
  own picker, which on a phone is a wheel no web control can match.

  The ARIA combobox is prescribed down to which element owns which attribute,
  and hand-written ones get the same three things wrong: focus has to stay in
  the text field while `aria-activedescendant` moves the highlight (moving real
  focus means typing stops working), `aria-expanded` belongs on the input rather
  than the wrapper, and Escape closes before it clears — one press to get the
  list out of the way without losing what was typed.

- **`BaseSlider`** — a native `input[type="range"]`, painted. The native control
  already has the keyboard, the pointer, the touch target and the correct
  announcements; only the look is replaced. `aria-valuetext` is the part worth
  stopping on: without it a screen reader reads "45", and a number with no unit
  is not an answer to anything.

### Fixed

- **`BaseCombobox` called `scrollIntoView` unguarded.** It is missing in jsdom
  and in more than one embedded webview, and a keyboard that throws is worse
  than a list that does not scroll.

- **The README contradicted itself** — a stale table from an earlier release sat
  four lines under the live one, answering the same question two ways.

## 0.19.0 — 2026-09-12

The controls a kit is expected to have. Found by auditing the package the way
somebody installing it cold would read it, rather than by a consumer asking.

### Added

- **`BaseMenu`** — a list of actions behind one control, and the one here that
  the rule caught: the wide consumer had a hand-written dropdown in a file that
  already imported the kit.

  `role="menu"` is a promise. Declaring it tells a screen reader that the arrow
  keys move between items, that Escape closes, and that Tab leaves rather than
  walking through. The menu it replaces declared the role and implemented none
  of it — which is the usual shape of the bug, because the roles are the part
  you can see in the markup and the behaviour is the part you cannot.

  So: focus moves in on open and back to the trigger on close, the arrows move
  and wrap, Home and End jump, Escape closes, Tab leaves, and a press outside
  closes. Items are found in the DOM rather than declared as data, so a caller
  mixes links, buttons and separators freely.

- **`BaseSwitch`** — a setting that takes effect the moment it is touched. Not
  `BaseCheckbox` with a rounder skin: a checkbox states an intention something
  else commits, and a switch _is_ the commit. A screen reader says "on"/"off"
  for one and "checked"/"unchecked" for the other, which are different
  sentences about different things.

- **`BaseAvatar`** — the person in the corner where the account lives. The
  default fallback is a drawn figure rather than an initial, because an initial
  in a circle reads as a profile picture that failed to load and says nothing to
  somebody seeing an avatar in that spot for the first time. Initials are there
  for the places where telling several people apart is the job. A failed image
  falls back instead of leaving a broken frame.

- **`BaseSpinner`** — waiting, with no idea how much is left. `ProgressBar` is
  for when the amount is known; a bar that cannot move is worse than a spinner,
  because a bar is a promise about how long. The label is required rather than
  defaulted to "Loading" in a language the app may not speak.

### Fixed

- **`BaseMenu` mounted already open had no outside-click listener** and never
  moved focus, because both were set up in a watcher that only ran on change. It
  looked open and behaved like a `div`. The watcher is immediate now. Caught
  while writing the test for the outside-click, not by the component being used.

- **The README contradicted itself.** A stale table left over from an earlier
  release sat under the live one saying 22 components, 11 composables and 20
  utilities. Somebody reading the package cold met two different answers to the
  same question within four lines.

## 0.18.2 — 2026-09-12

### Fixed

- **`BaseDisclosure`'s `title` prop was still required.** 0.18.1 added the
  `title` slot and left the prop mandatory, so using the slot was a type error
  and the only way through it was passing both — the prop then rendered nowhere.
  It is optional now; pass exactly one.

## 0.18.1 — 2026-09-12

### Added

- **A `title` slot on `BaseDisclosure` and `BaseAccordion`.** The size of a
  heading is a decision about the page it sits on, not about disclosure. The
  first list to adopt these wanted its question a step larger on a wide screen —
  `text-base sm:text-lg` — and with the title fixed at one size the only way to
  get it was an override aimed at the component's own stylesheet.

  Caught by a full-page screenshot comparison: the phone frames matched exactly
  and the wide ones came up 12px and 24px shorter, which is a heading that
  stopped growing.

## 0.18.0 — 2026-09-12

The rest of the web pack, and a correction.

### Corrected

**0.17.0 shipped three of eight planned components and gave the wrong reason.**
It said a component nobody had reached for was a guess at a shape, and counted
call sites across the three apps that exist today. `AGENTS.md` has said the
opposite since it was written: _no waiting for a second consumer and no
counting of call sites._

The rule is right and the release was wrong. A kit is a separate project.
Somebody installing it tomorrow should not have to hand-write a pagination
control because the apps that happen to exist today do not paginate, and the
question was never how many of them reached for it — it is whether the thing is
a piece of user interface. All four withheld components are.

`Tooltip` was withheld for a better reason: a tooltip needing JavaScript does
not appear in a prerendered page. That was a real objection to a design, not to
the component, and the answer is the design below.

### Added

- **`BaseTooltip`** — shown by `:hover` and `:focus-within` in the stylesheet.
  No listener, no state, no positioning library. It gives up collision
  detection — a tooltip near the right edge is clipped rather than flipped — and
  keeps the thing that matters more: it works in a prerendered page, before the
  bundle lands, and with scripting off.

  `:focus-within` is the half people leave out. A tooltip that only answers a
  mouse does not exist for anyone using a keyboard, and it is usually the only
  explanation of what the control does. The bubble is wired with
  `aria-describedby` through the slot, so a screen reader reads it as a
  description rather than as loose text nearby.

- **`BaseTabs`** — sections of one page, one visible at a time. Not `TabBar` and
  not `NavLinks`: those navigate and the back button undoes them.

  The keyboard is the whole reason it is a component. Tab enters the tablist
  once and leaves once — it does not walk through every tab — and the arrows
  move between them, wrapping at both ends, with Home and End for the ends.
  That is roving tabindex, and hand-written tabs get it wrong in the same way
  every time: every tab is tabbable, so reaching the content takes six presses.

- **`BasePagination`** — with the window that keeps its width as you move
  through it, because a row of numbers that reflows under the pointer is a row
  you have to re-aim at. A short list is shown whole: an ellipsis standing in
  for one page is longer than the page it replaces. It emits a number rather
  than navigating, because it cannot know whether the app pages by route, by
  query or in memory. The arrows take their names as props — `‹` is a glyph and
  a screen reader reading it announces nothing to act on.

- **`BaseBreadcrumb`** — an ordered list inside a `nav`, because the order is
  the meaning. The last crumb is not a link: a link to the page you are on is a
  control that does nothing. The separators are `aria-hidden`, since the list
  and the reader's position in it already say what the slashes say.

- **`BaseDisclosure`** — one accordion row on its own, for the common case where
  the list belongs to the app: staggered as it scrolls in, interleaved with
  something else, or built from a source the accordion cannot know about.

  Not hypothetical. The first list this kit met decorated every row with a
  reveal directive, which has to sit on the element `BaseAccordion` owns — so
  adopting the accordion meant dropping the design, and 0.17.0's only new
  accordion went unused for exactly that reason. Shipping the list without the
  row was the actual mistake.

## 0.17.2 — 2026-09-12

### Fixed

- **`NavLinks` still could not be hidden by a utility class.** 0.17.1 moved the
  root's layout into `:where()` and that was not enough, for a reason worth
  writing down: Vue's scoped CSS compiles `.rk-nav` to `.rk-nav[data-v-hash]`,
  and the scoping attribute puts back the specificity `:where()` had removed. A
  rule on a scoped component's root outranks a plain utility class whatever you
  wrap it in.

  So the flex row moved to an inner element the caller does not own, and the
  root is left bare for them to style. `TabBar` has been built this way all
  along, which is the argument for it.

  Verified the way the bug was found: by screenshot, not by test.

## 0.17.1 — 2026-09-12

### Fixed

- **`NavLinks` could not be hidden by a utility class.** Its root set
  `display: flex` in the component's own scoped stylesheet, which ties with
  Tailwind's `hidden` on specificity and ships after it — so `class="hidden
sm:flex"` lost, and the bar appeared on a phone on top of the call to action.

  The root's layout is now declared inside `:where()`, which has zero
  specificity, so any class the caller puts on the root wins outright. The
  layout is a default, not a rule.

  Found by comparing screenshots before and after adoption. It is invisible to
  types, to tests, and to a rendered-DOM comparison — the markup was right, and
  only the cascade was wrong.

## 0.17.0 — 2026-09-12

`rei-kit/web` — a fifth entry point, for the parts a wide site is made of.

### Added

- **`BaseModal`** (`rei-kit/web`) — a dialog that arrives from nowhere. Named
  beside `BaseSheet` rather than `Modal` on its own, because the two are the
  pair this kit keeps insisting they are: a sheet slides from the bottom edge
  and belongs to a thumb, a modal appears in the middle of what you were reading
  and is dismissed by leaving it.

  The wide consumer had written a dialog twice, and every part of a dialog that
  matters is a part nothing shows you is missing. Focus moves in and comes back;
  Tab wraps rather than walking out; Escape closes; the page underneath stops
  scrolling, and starts again even if the dialog is torn out while open. The
  backdrop closes it on `mousedown` on the backdrop itself, so a drag that
  starts inside the panel and ends outside it is not a dismissal.

- **`BaseAccordion`** (`rei-kit/web`) — a list that opens one section at a time.

  Not `<details>`, and the comment in the source explains why at length: a
  browser removes `<details>` content from layout when closed, so there is
  nothing to animate between, and faking it with CSS tells a screen reader the
  section is open while a sighted reader sees it shut. So the answer is always
  in the markup — which is also what a crawler and a reader without JavaScript
  get — and the panel travels from `0fr` to `1fr`, the one way to animate to a
  height nobody has measured.

- **`NavLinks`** (`rei-kit/web`) — the primary navigation of a wide site, with
  the sliding rule under the current section. The same item contract as
  `TabBar` minus the icon, so moving an app between a bottom bar and a top one
  is a change of component and not of data.

### Not shipped, and why

The plan for this release listed eight components. Three shipped. The other
five were checked against the consumer before being written, which is what the
rule asks for, and they did not survive it:

- **`Pagination`** has no user anywhere. Not one consumer has written it.
- **`Tabs`** and **`Breadcrumb`** appear only in prose — a comment mentioning
  the word, and nothing rendering one.
- **`Tooltip`** is the interesting one. The wide consumer's tooltip is CSS-only
  on purpose: a tooltip that needs JavaScript to appear does not appear in a
  prerendered page, and that app prerenders its grammar archive. Shipping a
  JavaScript tooltip would have been shipping the wrong answer in a nicer
  package.
- **`TopNav`** was not extractable as a component. The consumer's header is a
  brand mark, a theme control, two auth-dependent calls to action, an account
  menu and a mobile disclosure; a component taking all of that is a flex row
  with eight slots. What was genuinely shared is the link row, which is
  `NavLinks`.

A kit that ships a component nobody reached for is a kit guessing at a shape,
and `BaseRadioGroup` is already one standing reminder of that.

## 0.16.1 — 2026-09-12

### Fixed

- **`FabButton` had no focus ring.** In the app it was extracted from it was a
  `BaseButton variant="unstyled"`, so it inherited one for free; rewritten as a
  bare `<button>` it lost it silently. Nothing about the component looked wrong
  and a keyboard user had no way to see where they were, on the one button the
  whole app is arranged around.

  Caught by comparing the rendered DOM before and after the extraction, which is
  the only thing that would have caught it — it is invisible to types, to tests
  that do not look, and to anyone using a mouse.

## 0.16.0 — 2026-09-12

The shell pack. `App.vue` and `AppLayout.vue`, which two phone apps had written
to 300 lines each and kept in step by hand.

### Added

- **`TabShell`** (`rei-kit/app`) — the phone frame the whole app sits inside.
  On a phone it is invisible; on a desktop it is the bordered card in the middle
  of a textured field, which is what makes a phone-shaped app look deliberate on
  a wide screen rather than stretched.

  Both copies were 120 lines and differed in the product name, two colour
  variables and one hover colour. None of those is a reason to own a frame, so
  the lattice colour is `--rk-lattice` and the name is a slot.

  What stays in the app is the layout switch and the `RouterView` — the one part
  that genuinely differs, and the part that must stay outside the frame so a page
  that throws does not take the tab bar with it.

- **`OfflineBanner`** (`rei-kit/app`) — the floating note that the connection
  has gone. Floating rather than in flow because connectivity flickers in lifts
  and tunnels, and a banner that reflows the page on every flicker is worse than
  the outage. `role="status"`, not `alert`: it is a condition to know about, not
  a reason to interrupt a reader mid-sentence.

- **`FabButton`** (`rei-kit/app`) — the one action the app is built around,
  reachable from every screen. Extended rather than a bare circle, because a
  lone `+` says nothing about what it adds. It shares the tab bar's column
  rather than being anchored to the layout; anchored to the layout it sat four
  hundred pixels from the shell on a desktop screen, which is the bug that
  produced the shared version.

- **`createAuthGuard`** and **`createTitleGuard`** (`rei-kit/app`) — the route
  guard three apps had written separately. It answers two questions and nothing
  else: may this visitor see this route, and where do they go if not. The login
  route, the query key and whether a session must be restored first are options,
  because each is a decision about the app rather than about guarding.

- **`createQueryDefaults`** (`rei-kit/app`) — the cache settings two apps had
  picked independently and identically. Returned as a plain object rather than a
  built `QueryClient`, so the kit does not depend on TanStack Query and the app
  keeps the client as its own singleton — which is what lets the auth store
  reach `clear()` on sign-out.

- **`createWriteReport`** (`rei-kit/app`) — saying that a write happened, in one
  place, so every mutation reports the same way. The messages are functions
  rather than strings: a string would be read once, when the report was built,
  and would keep whichever language was active then for the life of the app.

- **`toRedirectPath`** (main entry) — the return path without the fragment.

  This one is a bug fix wearing a feature's clothes. Supabase's implicit OAuth
  flow hands the browser back with the access and refresh tokens in the URL
  fragment, which is client-side only. Copied into a query parameter it stops
  being one: `/login?redirect=/%23access_token=…` is sent on the very next
  request and lands in the host's access log, in `Referer` headers and in
  browser history.

  One of the two phone apps had worked this out and written the helper; the
  other was passing `fullPath` straight through, which is that leak with nothing
  in the way of it. `createAuthGuard` routes every redirect through it, so the
  fix is not something the next app has to think of again.

- **`name` on `createTabTransition`** — the `<Transition>` name for the current
  direction, ready to bind. Empty when there is nothing to slide, which is how a
  `<Transition>` is actually told to do nothing: an unnamed one still runs a
  default `v-*` animation. Both apps derived this in the same three lines.

## 0.15.0 — 2026-09-12

The auth pack. A sign-in screen written four times across three apps.

### Added

- **`AuthForm`** (`rei-kit/app`) — the sign-in and sign-up forms, which are one
  component. Two of the three consumers had a `LoginView` and a `SignupView`
  differing by a single input and an autocomplete hint; the third had already
  merged them and was the model for this.

  Two components that differ by one field drift apart, and these had: the
  failure message was `text-negative` in one app and `text-alert` in another,
  one changed the submit wording while busy and one did not, one had a
  placeholder on the e-mail field and one did not. None of that was a decision
  anybody made — it is what four copies do over a few months.

  It does not sign anybody in. It emits `submit` with the values and takes
  `busy` and `error` back, because the store, the redirect and the wording of a
  failure are the app's. Validation is a function the caller passes, for the
  same reason: the password minimum is a product decision — eight characters in
  two of these apps and ten in the third — and the kit has no opinion on it.

  Every string is a required prop. A label the kit invented would ship English
  into an app that has none, and it would do it silently: the form would look
  finished and read wrong.

- **`fieldErrors`** (`rei-kit/app`) — flattens a validator's error tree to one
  message per field, or null when the values are good. Typed structurally
  rather than against `z.ZodType`, so the kit never imports Zod and an app that
  validates with something else does not download a validator to use a form.
  Zod satisfies the shape as it is.

  Null rather than an empty object on success, so `if (errors)` is the guard.
  The exception is a schema that fails entirely at the root — a `refine` with no
  `path` — which returns an empty object that is still not null, because
  reporting "valid" there would let a broken submission through.

- **`toAuthMessageKey`** and **`AUTH_ERROR_CODES`** (`rei-kit/supabase`) — maps
  a Supabase auth failure to a message key rather than a sentence, so the caller
  translates it at render time. An error stored before a language switch still
  reads correctly after it, which is the whole reason it returns a string that
  looks unfinished.

  Two of the three copies were byte-for-byte identical. The third recognised one
  extra code, which is now the `extraCodes` option rather than a fork: a key is
  only an improvement on the generic message if something translates it, so
  widening the list stays the app's decision. An app that has not written
  `authError.validation_failed` is better served by the sentence it has than by
  a key rendered raw on screen.

  `AUTH_ERROR_CODES` is exported so an app can assert its locale files cover
  every key this can return.

- **`disabled` on `GoogleButton`.** One consumer was passing `:disabled="busy"`
  and getting half of what it asked for: the attribute fell through to the
  element, so the button stopped responding but went on looking clickable. It is
  a real prop now, and it greys out.

### Not shipped, and why

`authSchema` was planned for this release and is not here. The two schemas that
are identical today are identical because both apps chose an eight-character
minimum; the third chose ten. That is a product decision, and the kit's own rule
is that anything carrying one stays in the app that owns it. With `fieldErrors`
shipped, what remains in each app is fourteen lines that state its own password
policy — which is a thing worth being able to read in the app.

## 0.14.1 — 2026-09-10

### Fixed

- **`TourShell`'s slide transition was dead CSS.** It shipped in the
  component's `<style scoped>`, and a scoped rule cannot reach slot content —
  the slides belong to the calling component's scope, so `.tour-forward-*`
  never matched anything.

  It ships unscoped in `rei-kit/shell/mobile.css` now, where the caller's
  slides can see it, next to the `slide-forward-*` pair it is a sibling of. The
  dialog's own fade stays scoped, because that element _is_ the component's.

  An app that already styles its own slide transition is unaffected: a scoped
  rule outranks an unscoped one.

## 0.14.0 — 2026-09-10

The rest of what the two phone apps had written twice.

### Added

- **`TourShell`** (`rei-kit/app`) — the frame an onboarding guide runs inside.
  Both apps had 296 lines of this, 94% identical, and what differed was every
  part that should: the slides, the wash colours, the illustrations.

  What did not differ is the part that is easy to get wrong. `inert` on the app
  behind it, or Tab walks into a screen the reader cannot see — and it has to
  be undone on unmount, or the whole app stays inert forever. Focusing the
  dialog, which is the only reason the arrow keys work at all. A direction that
  follows the _index_ rather than the button pressed, so jumping from slide
  seven to slide two still animates backwards. And a segmented track rather
  than dots, because ten slides is a sequence with a length and the reader
  deserves to see how much is left.

  The slide is a slot and every string is a prop: the kit renders the frame and
  knows nothing about what is being explained.

- **`LocaleSheet`** (`rei-kit/app`) — choosing the interface language from a
  settings row. A sheet rather than a segmented control, because past four
  options a row of pills stops being readable and the list only grows.

  The labels are the caller's and should be **endonyms** — a language is always
  listed in its own language, so someone who cannot read the current interface
  can still find theirs. The kit cannot know them.

- **`InstallSettings`** (`rei-kit/pwa`) — the way back to installing after the
  card has been dismissed. The card snoozes for a week; without this row,
  somebody who tapped "Not now" and changed their mind has nowhere to go. It
  renders nothing where installing is neither possible nor already done, since
  a settings group that says "you cannot install this" is worse than silence.

## 0.13.0 — 2026-09-10

Two new entry points, for the parts that are not primitives.

The kit was extracted from one phone app and then a second one was built beside
it. What the two ended up sharing was not only buttons: `AuthLayout.vue` was
**thirty-seven lines with no difference at all** between them, `tab-transition.ts`
thirty-four the same, `use-theme-sync.ts` thirty-five, the install card 111
lines differing in a storage key and a colour. None of that is code nobody
could have written — it is code nobody should have written twice and then kept
in step.

### Added

- **`rei-kit/app`** — what a phone app is made of.

  |                              |                                                                                                                                                                                                     |
  | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `AuthShell`                  | Brand, a narrow column, a foot. The language links live in that foot because sign-in is the first screen a new user sees and Settings is behind it                                                  |
  | `createTabTransition(order)` | Which way the screens slide, read off the tab order rather than told. Generic over the tab key, so the app keeps its own union. `force()` covers the navigations that are not a tab change at heart |
  | `useThemeSync(stored)`       | Adopts the account's theme once, as soon as it arrives, and never again — a later refetch must not undo a choice the user just made locally                                                         |

  A separate entry because these assume an app with tabs, an account and a
  sign-in screen. A wide site should not have to know they exist.

- **`rei-kit/pwa`** — installing the app, and updating it.

  |                                 |                                                                                                                                                |
  | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
  | `watchInstallability()`         | Starts listening, from the app's entry file. `beforeinstallprompt` fires once and early, so a listener attached on mount has usually missed it |
  | `useInstall()`                  | The three-way platform state: Chromium hands over an event, iOS Safari has no API and needs the Share menu, everything else can only be told   |
  | `useSnooze(key, days)`          | A nudge that stops asking after it is dismissed. Both apps had this inside their install card, and a notification nudge wants the same thing   |
  | `InstallPrompt`, `UpdatePrompt` | The two cards, with every string as a prop                                                                                                     |

  `watchInstallability` is a function rather than module-scope side effects, so
  the package can be imported on a server — the phone apps ran it at module
  scope, which is the bug 0.2.2 spent a release on.

  **The service worker stays the app's.** `virtual:pwa-register/vue` is a
  build-time module and a library cannot import one, so `UpdatePrompt` takes
  `open` and emits `update`. That split is honest anyway: whether an update is
  waiting is the app's business, what the card looks like is the kit's.

## 0.12.1 — 2026-09-10

### Changed

- **`BaseCard` has no wrapper when it has no head and no foot.** The padding
  lands on the card itself and the card _is_ the element.

  This matters more than a saved node. Most cards in the apps lay their
  contents out — `flex items-center gap-4`, `flex flex-col gap-3` — and with a
  wrapper in the way those classes reach the border and not the content, so the
  app has to add back a div of its own. A component that makes you write the
  div it exists to remove is one you skip, which is what all three apps did.

  Found immediately after 0.12.0 by trying to adopt it.

## 0.12.0 — 2026-09-10

The button audit, applied to the rest of the kit. Counting usage across the
three apps found three components that shipped in 0.4.0 and were then used by
**nobody** — and in two of them the reason was the same defect the button kept
having.

### Added

- **`BaseCard` takes a `padding`** — `none`, `sm`, `md`, `lg`.

  It shipped with `px-5 py-4` baked in, and across three apps and **thirty-five
  hand-written card surfaces** it was reached for zero times. Those surfaces
  used `p-3` six times, `p-4` six times, `p-5` five times and `p-1` four times,
  and not once the pair the component insisted on. A card that fixes its
  padding cannot be used, which is `PageContainer`'s width in 0.4.1 and
  `size="sm"`'s height in 0.5.2, a third time.

  `none` is for the card that holds a list: the rows own the padding and the
  dividers have to reach the border. The head and the foot follow the body, so
  a card cannot be tight around its contents and loose around its title.

- **`ProgressBar` takes a `size`** — `sm`, `md`, `lg`. Same story, one axis
  over: it shipped at `h-1.5` and both bars anybody wanted were `h-1`.

### Noted

- **`PageContainer` still has no users**, and that one is not a defect.
  `shell/web.css` ships `.shell`, which is the same measure as a class, and the
  class is what the wide app reaches for — a `<header>` whose bar spans the
  window while its contents line up with the text cannot be a component
  wrapper. Both read `--measure-page`, so they cannot disagree. The component
  stays for the case where the container _is_ the element.

## 0.11.3 — 2026-09-10

### Added

- **A row can be the selected one.** `variant="row"` with `pressed` fills
  rather than recolours: a list says _this one_ with a fill, and painting the
  row in the primary colour instead makes one line of a list shout. Two of the
  consumers had written `.tree-row-on { @apply bg-muted }` for exactly this.

  With it, a chip's `.chip-on` / `.chip-off` pair also disappears —
  `chip-off` was `border-hair bg-surface text-ink hover:bg-muted`, which is
  `secondary`, and `chip-on` was `border-primary bg-primary text-white`, which
  is `secondary` pressed. The whole `:class="on ? 'chip-on' : 'chip-off'"`
  becomes `:pressed="on"`, and the button gains the `aria-pressed` it never had.

## 0.11.2 — 2026-09-10

### Changed

- **`quiet` fills on hover whether it holds a glyph or a word.** 0.11.0 filled
  only icon buttons, on the theory that a square hit area has bounds the reader
  cannot see while a line of text has its own. Reading the third app's editor
  said otherwise: its toolbar buttons carry text and fill exactly the same way.

  The shape is _a control in a strip_, not _a control with a glyph in it_. A
  text action that should have no surface at all is `link`, which is what it is
  for.

  `ghost` and `quiet` now differ only in the ink they start at — full strength
  against soft — which is the difference between a control waiting to be used
  and one that is merely available.

## 0.11.1 — 2026-09-10

### Added

- **`variant="destructive"`** — quiet until you reach for it, and then plainly
  destructive: a delete at the end of a row, a "remove this note", an archive.

  Not `danger`, which is filled and shouts before it is needed — a red button
  at the end of every row makes the list look like a warning. And not `quiet`
  with a `hover:text-negative` class beside it, which is how all three apps
  were doing it, **fifteen times**: that class and the variant's own
  `hover:text-ink` set the same property at the same specificity, so which one
  wins depends on the order they happen to land in the stylesheet. Every one of
  those was a coin toss.

  As an icon it tints its own fill rather than borrowing the neutral one: a red
  glyph on a grey wash reads as two different states at once.

## 0.11.0 — 2026-09-10

The admission rule is rewritten, and this release is what it produces.

**A part belongs in the kit if it is a piece of user interface at all.** No
waiting for a second consumer, no counting of call sites. An app that needs
something the kit does not have is a gap in the kit, and the kit is what
changes. The old rule — _two apps must need it_ — is gone from the README,
`AGENTS.md` and the consumers' notes, because it produced a kit that arrived
after the apps that needed it and a set of parts nobody reached for.

Reading the 117 hand-painted `variant="unstyled"` buttons across the three apps
as a specification rather than as app code, three answers fell out.

### Added

- **`variant="row"`** — a line in a list that is also a control: a settings
  row, a node in a tree, a heading that opens something. Full width, aligned to
  the start, and a hover that fills the whole line rather than a box inside it.

  All three apps had written this by hand — `.tree-row`, `.row`,
  `.header-action` — because a button that centres its content cannot be a row,
  and the alignment was the only thing that had to change.

  It is sized by padding rather than by a height, because a settings line holds
  one line of text and a tree node can hold two, and a fixed height turns the
  second into an overflow. And it does not press: scaling a full-width line
  looks like the list itself flinched, which is why none of the hand-written
  ones did.

### Changed

- **A quiet _icon_ button fills on hover; a quiet _text_ action still does
  not.** Not a special case: a square hit area has bounds the reader cannot see
  until something shows them, and a line of text has its own. Every icon button
  in all three apps was hand-written with exactly this fill — `.icon-button`,
  `.stepper`, and four more — and every text action without it. `quiet` was
  unusable for the commonest control in the kit's own consumers.

### Noted

- **The chip was already expressible and nobody had noticed.** `.chip-off` —
  `border-hair bg-surface text-ink hover:bg-muted` on a
  `rounded-full px-3 py-1.5 text-xs` box — is `variant="secondary"` with `pill`
  and `size="xs"`, exactly. Seven of them were hand-written. A part that exists
  and is not found is not much better than one that does not exist, which is
  what the showcase is for.

## 0.10.1 — 2026-09-10

### Changed

- **`BaseInput`'s model accepts a number.** It was `string | undefined`, so
  `type="number"` forced the caller to keep a string ref and convert on both
  sides of it — and a component you have to wrap in order to use is one you
  write yourself instead, which is what the first numeric field that reached
  for it went back to doing. The same widening `BaseSelect` took in 0.5.3, for
  the same reason.

  A type parameter widened: nothing that compiles today stops compiling.

## 0.10.0 — 2026-09-10

### Added

- **`variant="unstyled"` on `BaseInput`, `BaseTextarea` and `BaseSelect`** —
  the wiring without the surface, the same way `BaseButton` has it.

  The label, the generated id, `aria-describedby` and the error are what a
  field _is_. The border, the height and the radius are what it looks like. A
  search box inside a bordered row, a url field in an editor popover, a number
  in a compact panel: those places were hand-writing the whole field to escape
  the appearance, and losing the wiring along with it.

  This is the second of the two completeness tests the kit writes down for a
  primitive — _can the app take the behaviour without the appearance?_ — and
  the form controls were failing it while the button had already been fixed.

## 0.9.1 — 2026-09-10

### Fixed

- **`size="sm"` would have caused iOS to zoom every text field it touched.**
  It applied `text-sm` — 14px — and mobile Safari zooms the viewport when it
  focuses a text input under 16px, and does not zoom back. Both phone
  consumers had written `input, select, textarea { font-size: 16px }` into
  their base layer to prevent exactly this, and a utility class from the kit
  overrides a base-layer rule, so adopting `sm` would have reintroduced the bug
  in every app at once.

  `BaseInput` and `BaseTextarea` now keep 16px at every size. `size` reaches
  the label and the spacing through `FormField` and leaves the typing target
  alone. `BaseSelect` still shrinks: a select opens a native picker rather than
  a caret and does not trigger the zoom.

  Found by trying to replace a date field, not by reading the component.

### Added

- **`BaseInput` accepts every type a text field can be** — `search`, `tel`,
  `url`, `date`, `time` and `datetime-local` join the four it had. The missing
  ones were the ones being hand-written: `date` and `search` three times each
  and `url` twice, in files that already imported this component.

## 0.9.0 — 2026-09-10

**Breaking, and it is one line.** See _Migrating_ below.

### Changed

- **`tokens.css` no longer carries the phone shell.** It had been shipping
  `shell-frame` (a 430px column at viewport height), `page-slide`, `page-auth`
  and the iOS sheet curve to every consumer — including a wide course site
  that used none of them and downloaded all of them in order to ignore them.

  Tokens are what every app needs. A shell is a decision about what shape the
  app is, and putting the two in one file meant an app could not take the
  first without the second. It also made the kit read as a phone-app kit,
  which is why the wide consumer had no counterpart to reach for.

### Added

- **`rei-kit/shell/mobile.css`** — everything that left `tokens.css`, unchanged.
- **`rei-kit/shell/web.css`** — the counterpart. `.shell`, the page's column as
  a class, for the elements where `PageContainer` is awkward: a `<header>`
  whose bar spans the window while its contents line up with the text, a
  `<footer>`, a hero that paints edge to edge. And a short fade between pages —
  leaving takes half as long as arriving, because the old page is not worth
  watching.

  Extracted from the kit's first wide consumer rather than invented. Both
  shells read `--measure-page` and neither declares a colour.

- **`stylesheets.spec.ts`**, which asserts what each sheet may contain. Nothing
  caught the original mistake because a stylesheet has no types and an unused
  class breaks nothing.

### Migrating

Add one line next to the tokens:

```css
@import 'rei-kit/tokens.css';
@import 'rei-kit/shell/mobile.css'; /* a phone-shaped app */
@import 'rei-kit/shell/web.css'; /* a site */
```

Leaving it out is not silent: the shell disappears on the first screen. It was
tempting to keep `tokens.css` importing both for compatibility, and that was
refused — the split would then exist only in the documentation, and the wide
app would go on downloading a phone.

## 0.8.0 — 2026-09-10

### Added

- **`useToast` and `ToastHost`.** The word "toast" appeared **zero times**
  across all three consuming apps — not because they had decided against it,
  but because there was nothing to reach for. Every save, delete and export
  finished in silence, and the only way to know something had worked was that
  nothing had visibly broken.

  `useToast()` gives `info`, `success`, `warning`, `danger`, `dismiss`,
  `dismissAll`, `pause` and `resume`. `ToastHost` goes once at the app root and
  takes `closeLabel`, because the dismiss button is an X and an X has no name.

  The decisions worth knowing:

  - **No text in the kit.** Callers pass the message. A component that called a
    translator would force one on the app.
  - **`aria-live="polite"`, not assertive.** A toast reports something that has
    already happened; interrupting a screen reader mid-sentence to say "saved"
    is ruder than waiting. A failure the reader must act on belongs in a
    `BaseAlert` beside the thing that failed, and this is deliberately not for
    form errors — a field that was rejected says so beside itself, where the
    eye already is and where it stays until fixed.
  - **Three at a time.** A fourth pushes the oldest out rather than growing the
    stack off the screen: an action that produces ten toasts is a loop, and a
    loop must not be able to cover the app it is running in.
  - **The clock stops while it is being read.** Hover or focus pauses, and
    resuming continues from where it stopped rather than starting again.
  - **A failure stays longer** than a confirmation, because it is read more
    slowly and more often twice.
  - **No timer on a server.** Arming one would keep a prerender process alive
    past the last page, which is how a build hangs instead of finishing.

### Changed

- **`BaseSheet`'s close button is a `BaseButton`** (`variant="unstyled"`, so it
  keeps the exact appearance it had). What it gains is a focus ring: it was a
  raw `<button>` with no `focus-visible` rule, so closing a sheet from the
  keyboard was invisible. The kit was breaking its own rule in its own source.

## 0.7.1 — 2026-09-10

### Fixed

- **The button never animated the colour it changes on hover.** It transitioned
  `transform` only, so every variant — all of which shift colour on hover —
  snapped, while the hand-written controls sitting beside them faded.
  `transition-colors` appears **106 times** across the three consuming apps;
  this component was the one interactive surface not following the convention,
  and it was only noticed when a hand-written icon button was replaced by it
  and the hover got worse.

  `unstyled` still imposes no transition: an app painting its own surface
  animates it too.

## 0.7.0 — 2026-09-10

**The button stops being a look and becomes a primitive.**

The measurement that forced this: across the three apps there were **58 raw
`<button>` elements sitting in 24 files that already imported and used
`BaseButton`**. Not in files that ignore the kit — in files that reach for it
and then give up halfway down. Twenty-three were icon buttons the kit could
already make and nobody had converted; eighteen were toggles it had no way to
express; one was filled with a colour role the kit's own `tokens.css` declares
and the button could not use.

The rule this release corrects is one the kit had written down: _a thing enters
the kit when two apps need it._ That is right for a composed component — a
`PriceCard`, a `TourShell` — whose API you would design wrong from a single
example. It is wrong for a primitive. There is no uncertainty about whether the
fourth app will want a button that can be switched on, and waiting for a second
consumer means every new app begins by copying, which is the thing the kit
exists to prevent. **A primitive set is complete by construction, not by
demand.**

### Added

- **`positive`, `warning` and `accent` variants.** `tokens.css` declares five
  colour roles and this component exposed two of them. A component that cannot
  use a role its own design system declares is not avoiding a guess; it is
  incomplete.

- **`pressed`** — that this button is a switch, and whether it is on. Omit it
  and nothing changes: the button is an action. Pass it and `aria-pressed` is
  written, and the variants with an "off" look take a filled one when on.

  Eighteen of these were hand-written across the apps — picker cells, filter
  chips, mode selectors — and almost none said `aria-pressed`. A screen reader
  met a row of identical buttons with no way to know which was chosen.

- **`variant="unstyled"`** — everything this component is, except the paint.
  No surface, no size, no radius, no layout; the element, the `as` switch, the
  `pressed` bookkeeping, the disabled handling and the focus ring all stay.

  This is the answer to the 58. A picker cell, a chip, a calendar day: the
  surface is the app's and should be. What was being rewritten alongside it
  every time — usually without a focus ring — was not.

## 0.6.1 — 2026-09-09

### Added

- **`variant="quiet"`** — the control that is present without asking for
  attention: a dismiss beside an install prompt, a chevron beside a month, a
  delete at the end of a row.

  `ghost` had been the only candidate and is not this. Ghost keeps
  full-strength ink and answers a hover with a fill, which is a control waiting
  to be used. Quiet starts soft and answers a hover by getting darker; no
  surface appears at all.

  The exact pair `text-ink-soft hover:text-ink` was hand-written **47 times**
  across the three apps. That is what a missing variant looks like from the
  outside, and it was found by trying to convert the first prompt rather than
  by reading the component.

Deliberately **not** added: a `positive` fill. Hibi's install button is green,
but it is the only one, in one app — the rule is two, and a kit that grows on
one call site grows on a guess.

## 0.6.0 — 2026-09-09

0.5.0 claimed to be about the 136 hand-written `<button>` elements across the
three apps. It shipped `icon`, `lg` and `block`, and then **not one of those
136 was converted** — the release note quietly changed the subject to selects
and checkboxes. Classifying them afterwards showed why, and showed that the
number itself was doing no work:

|                                                                  |     |
| ---------------------------------------------------------------- | --- |
| Carry a selected state — scale pickers, day cells, tab-like rows | 40  |
| Square icon buttons                                              | ~29 |
| Text actions with no surface                                     | ~10 |
| Pill actions inside a prompt                                     | 8   |
| Full-width interactive rows                                      | 5   |
| Bespoke surfaces                                                 | ~43 |

Roughly two thirds are app code and always were. Of the third that is not, the
kit could express only the icon buttons — the other two shapes it had no way
to make at all, which is the actual reason those files were hand-written.

### Added

- **`variant="link"`** — a real action that reads as text. "Clear this note",
  "remove", "change category". It has no surface, so it also has no height and
  no padding: giving it either makes it a ghost button, which is a different
  thing and was already here. `ghost` had been the only candidate and it has a
  hover fill and a radius, so it reads as a button that happens to be empty.

- **`pill`** — fully rounded rather than card-cornered. Every install prompt,
  update prompt and nudge in the two phone apps used the same pair: a filled
  pill to act and a quiet one to dismiss. Eight buttons, four files, two apps,
  and none of them could use this component because it knew one radius.

- **`size="xs"`** — the action inside a prompt or a nudge rather than on a
  page. It is what those eight were.

Additive throughout.

## 0.5.3 — 2026-09-09

### Changed

- **`BaseSelect` is generic over its value** (`T extends string | number`).

  It was typed to `string`, and the first two selects anyone tried to replace
  with it held a day of the month — a number. Adopting it would have meant a
  computed getter converting out and a setter converting back, at every call
  site, forever. A component you have to wrap in order to use is a component
  you write yourself instead, which is exactly what those apps had done.

  Widening a type parameter, so nothing that compiles today stops compiling.

## 0.5.2 — 2026-09-09

### Fixed

- **`size="sm"` was shorter than every control it was meant to replace.** It
  shipped as `h-9` (36px), and of the five hand-written selects across the
  three apps none was under 40px and two were exactly 44. Adopting it would
  have shrunk all five and put every one of them under the 44px touch target.

  The scale is typographic rather than dimensional now: `sm` and `md` are both
  `h-11`, and what changes is the type size and how loudly the label asks to be
  read. A select that filters a list is pressed with the same thumb as one that
  answers a form.

  Caught by trying to adopt 0.5.1 rather than by reading it, which is the
  argument for adopting in the same session as releasing.

## 0.5.1 — 2026-09-09

### Added

- **A size scale on the form layer** — `size: 'sm' | 'md'` on `FormField`,
  `BaseInput`, `BaseSelect`, `BaseTextarea` and `BaseCheckbox`.

  0.5.0 shipped the form components at one size, and then not one hand-written
  control in the three consuming apps could be replaced by them. Every
  hand-rolled `<select>` in all three — five of them — was small and set in
  `text-sm`; the kit only had the large one. Of the five hand-written
  checkboxes, four were the quiet aside under a form ("remember me", "show the
  ones I have learned") at `gap-2` in `text-ink-soft`, and one was a setting at
  `gap-3` in ink.

  This is 0.4.1's `PageContainer` mistake one axis over: a component that bakes
  in one measure cannot be reached for by an app that chose a different one on
  purpose, and the app keeps its hand-written copy. A size is a role like a
  colour and a width are.

### Fixed

- **The form controls now state their own type size.** They never had one, so
  they inherited it: Hibi and Kakei force `font-size: 16px` on form elements to
  stop iOS zooming on focus, Kakehashi does not, and the same `BaseInput`
  therefore rendered at two different sizes depending on which app it was in. A
  design system component whose type scale depends on the host page is not one.
  `md` is `text-base`, which is what the two apps forcing 16px were already
  getting, so nothing moves in them.

## 0.5.0 — 2026-09-09

The kit had one button that could only ever be a `<button>`, and one form
control. Across the three consuming apps that came to **136 hand-written
`<button>` elements**, five `<select>`s, six `<textarea>`s and seven
checkboxes — every one of them a place where the focus ring, the disabled
state and the error wiring had to be remembered rather than inherited. A kit
whose most-used component cannot cover its most common case is arguing against
itself.

### Added

- **`BaseButton` can be an anchor or a `RouterLink`** — `as`, with `href` or
  `to`. A button and a link are the same shape and a different element, and
  the apps were resolving that by nesting them: `<RouterLink><BaseButton>` is
  an `<a>` around a `<button>`, which is invalid HTML, two stops in the tab
  order and two controls announced for one thing on the screen. `router-link`
  is resolved by name rather than imported, so `vue-router` stays the optional
  peer it is.

  A disabled link has its `href` removed outright rather than kept beside an
  `aria-disabled`. An anchor without one is not focusable and not activatable,
  which is the whole of what disabled means for a link.

- **`BaseButton` grows `size="lg"`, `icon` and `block`.** A 44px button is
  right under a thumb and undersized under a headline, so a wide page's call to
  action had been hand-written. `icon` is square — an icon button cannot take
  horizontal padding and stay square, so it has its own scale. Pass
  `aria-label` with it; nothing in the component can check that you did, which
  is why the prop's documentation says so twice.

- **`FormField`** — the label, the hint, the error and the wiring between them.
  This was _inside_ `BaseInput`, which is why the kit had one form control
  instead of five. The hard part of a field is not the `<input>`: it is
  generating an id, pointing the label at it, deciding whether the description
  is the hint or the error, and telling assistive tech which one to read. That
  part is identical for a select, a textarea and an input, and every app that
  needed one of the other two wrote all of it again.

- **`BaseSelect`, `BaseTextarea`, `BaseCheckbox`, `BaseRadioGroup`.**
  `BaseSelect` stays a native `<select>` — a custom listbox has to reimplement
  typeahead, the keyboard and the way a phone lifts options into its own
  picker, and it gets one of them wrong; what is worth replacing is the chrome.

  `BaseCheckbox` is deliberately _not_ built on `FormField`: that component
  stacks a label above its control, and a checkbox is read as one sentence with
  a mark in front of it. The whole row is the label, so the words are part of
  the hit target.

  It is `BaseRadioGroup` rather than `BaseRadio` because one radio is not a
  control — it is half of a choice that cannot be unmade, and every real use is
  a group. It renders `fieldset` and `legend`: a label points at one element,
  and the thing being named is the question, not any single answer.

### Changed

- `BaseInput` is built on `FormField`. Its props, its behaviour and its markup
  are unchanged; the wiring simply lives somewhere it can be shared.

Additive throughout: no existing export changed name, props or behaviour.

## 0.4.4 — 2026-09-06

### Added

- **`BaseButton` gains a `secondary` variant** — bordered, on the surface
  colour. There were three variants and none of them was "a real action that
  is not the one being urged", so `ghost` had been standing in for it. Ghost
  has no border and no fill, which is right for a control that should recede
  until it is wanted and wrong for one half of a choice: "Save draft" beside
  "Publish" read as a caption rather than a button, in every consumer that
  tried it.

## 0.4.3 — 2026-09-06

### Fixed

- **Optional props refused an explicit `undefined`.** The kit compiles with
  `exactOptionalPropertyTypes`, and under that flag `note?: string` means the
  prop may be _absent_ — not that it may be `undefined`. So a consumer with the
  same flag on could not forward its own optional value: passing
  `:note="note"` where `note` is `string | undefined` failed to type-check
  against a component built to receive exactly that.

  Every optional prop now reads `?: T | undefined`. Thirty-five of them across
  sixteen components. Widening what a prop accepts, so nothing that compiles
  today stops compiling — but a strict consumer can now bind a value it might
  not have, which is the ordinary case and was the blocked one.

## 0.4.2 — 2026-09-06

### Added

- **`PriceCard` takes a `bullet` slot.** A pricing table often uses the list
  marker to say something the tone cannot — on the tier you already have, the
  features are things you hold rather than things you would get — and the first
  consumer had drawn exactly that distinction in green. Adopting the component
  would have meant giving it up, which is the same reason `PageContainer`'s
  width became a token in 0.4.1: a part is not reusable if reaching for it
  costs a design decision somebody made on purpose.

## 0.4.1 — 2026-09-06

### Fixed

- **`PageContainer` insisted on its own width.** It shipped with `75rem` baked
  in, and the first app that wanted it had deliberately measured its page at
  1120px — so the component written to remove that app's hand-rolled container
  could not replace it. Same mistake as a hex inside a component, one axis
  over. The measures are now tokens (`--measure-page`, `--measure-reading`),
  overridden in the consuming app's `@theme` like every colour role.

## 0.4.0 — 2026-09-06

The kit was extracted from a phone app and had never grown the parts a desktop
app needs. The gap was measurable: its newest consumer used **12** of its
symbols and hand-wrote **737** class attributes, while the two apps it came
from used ~32 each. Two causes, and this release addresses both.

### Added

- **`PageContainer`** — one measure, centred, with the page's gutters. `wide`
  for a page, `reading` for a column of prose at ~68 characters. Every consumer
  was writing `max-w-[…] mx-auto px-6` into each layout instead, which is
  eleven chances for one page to be forty pixels narrower than the rest.
- **`BaseCard`** — a bordered surface with optional head and foot slots.
  `interactive` opts into the lift and press, because a card holding a form
  should not move under the pointer.
- **`BaseAlert`** — info / success / warning / danger, by role and never by colour.
  `assertive` decides whether a screen reader interrupts: invisible on screen,
  rude in a screen reader, so it is a prop rather than a guess.
- **`BaseBadge`** — a small standing label. Deliberately never a control; the
  moment one needs a click it is a chip, which is a different component.
- **`ProgressBar`** — clamped rather than trusted. Progress is always a
  computed number and computed numbers arrive as 101, as -3, and as NaN when
  the denominator is zero, which is the ordinary state of a course nobody has
  started.
- **`ErrorBoundary`** — all three consuming apps had written this. What they
  had in common was the mechanism (catch, report, reset on navigation); what
  differed was the icon and the sentence, which should differ. So the fallback
  is a slot and the kit stays out of the wording.
- **`useMediaQuery`** — starts `false` and resolves on mount, so a prerendered
  page is not built for a screen the server does not have.

- **A showcase.** `pnpm showcase` runs it, `pnpm showcase:build` builds it.
  This is the other half of the diagnosis: there was no way to see what the kit
  contained short of reading `public-api.spec.ts`, and a component nobody can
  see is a component nobody uses. It wires the kit exactly the way the README
  tells a consumer to, so a broken install shows up there before it ships.

### Fixed

- **`VERSION` was the string `'0.0.0'`, always.** It was a literal in the
  source and nothing ever rewrote it, so every consumer that imported it was
  told the kit was at 0.0.0 whatever it actually was. It is now replaced at
  build time from `package.json`. A public symbol that reports something false
  is worse than a missing one — nobody re-checks a value that looks like it
  works.

Additive throughout: no existing export changed name, props or behaviour.

## 0.3.1 — 2026-09-05

### Fixed

- **Supabase errors reached the screen as "Something went wrong."** The mapper
  registered by `rei-kit/supabase` gated on `error instanceof PostgrestError`,
  and supabase-js does not return an instance: the error in `{ data, error }`
  is a plain object, and a project holding two copies of
  `@supabase/postgrest-js` gets two classes and an `instanceof` that is false
  against a genuine error either way. So the mapper declined every error it
  existed for and each one fell into the generic branch. A message reading
  `permission denied for table enrollments`, naming the table and the missing
  grant, was replaced with a sentence that says nothing — the app showed one
  thing, the console showed a 403, and the two could not be connected. The
  mapper now recognises a PostgREST failure by its shape as well as its class.

### Added

- **`denied` joins `AppErrorKind`,** for 42501 (insufficient privilege) and
  PGRST301/302 (missing or expired token). These are not faults: the request
  was understood, well formed and refused, and a screen that reports a failure
  sends the reader to support over something they can fix by signing in again.

  Additive at runtime. A consumer with an exhaustive `switch` over
  `AppErrorKind` and no `default` will need a branch; every other consumer is
  unaffected.

## 0.3.0 — 2026-09-05

### Added

- **`PriceCard`** — a pricing tier with every string handed in: name, price,
  cadence, features, the call to action and whether it is the featured one.
  Nothing about money, currency or plan names lives in the kit.

## 0.2.4 — 2026-09-04

### Fixed

- **`SkeletonList` treated `rowHeight` as a class name** while every call site
  passed a CSS length, so a loading state rendered at zero height and appeared
  not to render at all. It now accepts either.

## 0.2.3 — 2026-09-04

### Fixed

- **`applyTheme` no longer requires `matchMedia` to exist.** It guarded on
  `document` and then reached for `window.matchMedia`, and having one does not
  imply having the other: jsdom supplies a document and no `matchMedia`, so a
  consuming app's component test that mounted anything calling `useTheme` threw
  `window.matchMedia is not a function`. Some embedded webviews behave the same
  way. Where there is nothing to ask, an unresolvable `system` now resolves to
  light instead of raising; an explicit `light` or `dark` never needed to ask at
  all and now says so. The `prefers-color-scheme` listener is registered under
  the same check.

No public symbol changed, so this is a patch.

## 0.2.2 — 2026-09-03

### Fixed

- **The kit can be imported on a server.** `use-today` armed its midnight timer
  and added a `visibilitychange` listener at module scope, and `index.ts`
  re-exports it, so a single `import { BaseButton } from 'rei-kit'` threw
  `document is not defined` before any component rendered. The wiring now
  happens on the first `useToday()`, which also means an app that never asks for
  today never arms a timer.
- `useVisualViewport` read `window.visualViewport` during `setup`, so `BaseSheet`
  — its only caller — could not be server-rendered. Without a window it now
  returns the same `null` it already returned where the API is missing.
- `applyTheme` is a no-op without a document, and the `prefers-color-scheme`
  listener is only attached in a browser. A prerender leaves `.dark` off; the app
  settles the theme before hydration.
- The i18n runtime no longer writes `document.documentElement.lang` or detects a
  system locale where there is no browser to detect one. **The test is
  `document`, not `navigator`:** Node has had a global `navigator` since v21, so
  the obvious check would have passed on a server and baked the build machine's
  language into every prerendered page.

No public symbol was added, removed or renamed, and no prop changed. Every
consuming app can take this without reading anything.

### Added

- `src/__tests__/ssr.spec.ts`, which renders the components in the **node**
  environment. jsdom cannot prove this: it supplies the very `document` a server
  lacks, so the suite passed all four of the bugs above.

## 0.2.1 — 2026-09-01

### Fixed

- **`vue-router` is external again.** It was inlined into the bundle, so an app
  got a second copy. A second copy of a library that works through
  provide/inject is not a spare copy -- its injection key differs, so `TabBar`
  injected a router the app had never provided and threw during `setup`. Any app
  on 0.2.0 that renders `TabBar` or `LocaleLinks` should upgrade.

### Changed

- Externals are derived from `peerDependencies` instead of a hand-kept list, and
  `build-only` now verifies the built bundle imports every peer it uses. Since
  `prepublishOnly` runs that build, a bundle that inlines a peer can no longer be
  published.
- Workflows moved off the deprecated Node 20 actions.

## 0.2.0 — 2026-08-31

### Added

- `TabBar` -- a floating bottom navigation bar, generic over the tab key.
- `GoogleButton`.
- A consumer workflow that packs the real tarball, installs it into a consuming
  app and runs that app's checks, so a change here fails before it ships.

### Changed

- Publishing moved to npm Trusted Publishing (OIDC, with provenance). No token
  is stored anywhere.

## 0.1.0 — 2026-08-30

First release of the library as it exists now: 15 components, 6 composables, 8
pure utilities, a generic i18n runtime, an optional `rei-kit/supabase` entry and
the token stylesheet.

The package name carries earlier `0.0.x` history from an abandoned React and
Storybook experiment. Nothing from it survives; the library was restarted as a
Vue 3 library and shares no code with those versions.
