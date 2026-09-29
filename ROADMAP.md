# Roadmap

What this kit is for, what is next, and what it will not do. No dates: a part
ships when a consuming app can adopt it in the same session, which is the rule
that produced most of the releases so far.

## What it is for

One kit, three apps that look nothing alike. The bet is that a component
library is worth choosing for two things — how little it costs to load and how
far it bends to your design — rather than for the size of its catalogue.

So the numbers are measured, not claimed, and CI fails when they move:

- Size budgets per entry point, built with Vite the way an app builds.
- A benchmark in `bench/` that bundles the same components against five other
  kits, at three components and at ten, because one case is how a size
  comparison lies in either direction. It writes its numbers to a file the
  README and the showcase both read, so neither can say something the
  benchmark did not produce.
- A component count asserted against the generated catalogue, in every place
  it is written down.

If something here is ever untrue, that is a bug worth reporting.

## Done recently

| Version | What                                                                              |
| ------- | --------------------------------------------------------------------------------- |
| 2.25.0  | No role written on a wash of itself; 22 palette values raised to AA                |
| 2.24.0  | `pnpm test:browser`, and a doc comment on all 105 exports                          |
| 2.23.0  | `PasswordInput`, and the arrow keys mirrored in the ten controls that had them wrong |
| 2.22.0  | `SkipLink`, `AnnounceHost`, `createRouteAnnouncer`, `ErrorSummary` — and `dir` on the document at last |
| 2.21.0  | `ScrollArea` and `VirtualList`, both already written by hand inside the kit       |
| 2.20.0  | `ActivityGrid` — a year of days, as a real table                                  |
| 2.19.0  | `BaseDrawer`, `BaseContextMenu`, `BaseHoverCard`, `CodeBlock`                     |
| 2.18.0  | `CommandMenu` matches every word, so two-word searches find things                |
| 2.17.0  | `BaseTimeline` — a record of what happened, on a rail                             |

`CHANGELOG.md` has the reasoning; `PATCHNOTES.md` has what you gain and what
you have to do.


## Where it stands

Audited against the repository on 2026-09-29, not from memory. Five marks:
✅ done · 🟡 partial · ❌ missing · 🔧 needs work · 🔍 undecided.

| Area | | |
| --- | --- | --- |
| Theming | ✅ | Three axes — palette, material, mode — with ten palettes measured against AA in both modes. Redefine a token and every component follows. |
| Tokens | 🟡 | Colour and depth are complete. There are exactly three radii and no spacing token, so "make the corners sharper here" has no lever below the whole app. |
| `class` on a component | 🔧 | Fine for 66 of 69, via Vue's fallthrough. `BaseInput`, `BaseTextarea` and `PasswordInput` set `inheritAttrs: false` and bind `$attrs` to the inner `<input>`, so a caller's class lands on the field rather than its wrapper, in a list that already has `w-full`. |
| Composition | 🟡 | `variant="unstyled"` on five components, `defineSlots` on twelve. Enough for the three apps here; thin for an app whose design does not resemble any of them. |
| Playground | ❌ | The showcase renders every component in every material and palette, and no prop can be changed. `props.generated.json` already holds every prop, type and default, so the panel has its data source and needs no second tool. |
| Coverage | ✅ | 105 components. Form, feedback, navigation, overlay and data display are past the usual list. `Label`, `InputGroup` and `AspectRatio` are the honest omissions. |
| Accessibility | ✅ | Axe over every example, contrast and focus rings in a real browser, arrow keys mirrored for RTL. |
| Contribution | ✅ | `CONTRIBUTING.md`, `SECURITY.md`, a PR template, and issue templates including one for a gap. |

## Priorities

**Being usable, ahead of having more.** The kit has 105 components and one
user. "What most people need" is not answerable from here — every gap found
so far came from the three apps in this family or from a new measuring
instrument, and both are inside signals. Building more without outside
signal is guessing, and every guess costs maintenance, a documentation row,
a test and a slice of the stylesheet budget for ever.

### P0 — what blocks somebody evaluating the kit

- **The `class` fallthrough on the three fields.** A live bug: the class a
  caller writes goes somewhere they did not mean, and whether it wins is
  decided by stylesheet order rather than by them. This is the kit fighting
  the developer, which is the one thing it must not do.
- **An interactive playground**, built into the existing showcase from
  `props.generated.json`. Not Storybook and not Ladle: both mean a second
  build and a second component registry, and the catalogue that exists here
  is generated and already cannot go stale. A developer must be able to
  change `variant`, `size` and `disabled` and see the result — that is the
  difference between reading about a kit and trying one.

### P1 — customization, where measurement says it is thin

Keep the token names. `--color-*`, `--radius-*` and `--shadow-*` are what
every component reads and what three apps have redefined; renaming them to
`--ui-*` would break every consumer to change a prefix. The work is the
missing part, not the naming:

- A radius scale, so a component can be reshaped without reshaping the app.
- Spacing tokens, for the same reason.
- Per-component override: decide whether it is a CSS hook, like the existing
  `--surface-shadow`, or a prop. The hook pattern is already here and works;
  prefer extending it to inventing a second mechanism.

### P2 — the small parts that are genuinely absent

`Label`, `InputGroup`, `AspectRatio`. Small, unglamorous, and each answers a
shape an app writes by hand today.

### P3 — not now

Splitting `styles.css` per component. Measurement points at one place and
only one: 20 KB of the flat 23, plain scoped CSS that Tailwind cannot shake
out. Splitting it would end the dead weight in a small app and cost the
two-line install. That is a 3.0 conversation.

## Under consideration

Each of these is here rather than in a priority because it is not yet clear
the kit should have it.

- **A carousel.** Often the wrong answer: a horizontal list with scroll-snap
  and `useDragScroll` is usually better, and is already possible. It goes in
  if somebody shows a case those two cannot cover.

## Not planned

- **Layout primitives — `Stack`, `Grid`, `Flex`, and the rest.** Tailwind is
  the layout primitive. A `<Stack>` wrapping `flex flex-col gap-4` earns
  nothing and costs a catalogue row, a test and a documentation line for
  ever.
- **A `--ui-*` token migration.** The token system exists, is documented and
  has three apps depending on it. Renaming is a breaking change with no
  feature in it.
- **A `create-rei-app` or a framework module.** This stays a kit you install
  next to Tailwind. Every layer on top is a layer that has to keep up with
  the tools underneath it. That includes **`vite-ssg`**, which is an app's
  build choice and not this package's business. The kit's side of prerender
  is a promise — no module touches `window` or `document` on import — and
  that promise is measured: `ssr.spec.ts` in the suite, and Kakehashi's real
  `vite-ssg build` in `consumer.yml` on every release, which jsdom cannot
  stand in for because it supplies the very `document` a server lacks.
- **A base library underneath.** No Radix, no Reka, no Headless UI. The
  patterns here are implemented against the ARIA authoring practices
  directly, which is why each component can say what it does and why.
- **A language of its own.** Every visible string stays a required prop. A
  default would ship English into an app that has none, silently.
- **Design decisions inside components.** No colour values, no copy, no
  icons. A test fails on a hex in a component, and that is what lets three
  apps that look nothing alike share one part.

## Two lessons worth keeping

**Shipping a version is half the work; adopting it is the other half, and
that is the half that finds the gaps.** Four early releases came from trying
to move an app onto the kit, not from reading the components. Closing a
phase because the kit published is how the first one went wrong.

**Tools are at saturation.** 1,443 tests, a browser audit, two RTL scanners
and stored pictures — every one of them found a real fault, and the risk now
runs the other way. A library's worth is not how many checks it has but how
many people it makes faster. The weight belongs on being used.

## How to change what is here

Open an issue saying what you tried to build and what you ended up writing by
hand. A control written by hand in a file that already imports the kit's
version of it is a bug in the kit, every time — `BaseTimeline` was found that
way, in an app in this repo's own family. `CONTRIBUTING.md` has the rest.
