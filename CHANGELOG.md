# Changelog

Notable changes per release. Versions follow [semver](https://semver.org); while
the major is `0`, a minor may carry a breaking change and will say so here.

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
