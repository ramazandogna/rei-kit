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
| 2.23.0  | `PasswordInput`, and the arrow keys mirrored in the ten controls that had them wrong |
| 2.22.0  | `SkipLink`, `AnnounceHost`, `createRouteAnnouncer`, `ErrorSummary` — and `dir` on the document at last |
| 2.21.0  | `ScrollArea` and `VirtualList`, both already written by hand inside the kit       |
| 2.20.0  | `ActivityGrid` — a year of days, as a real table                                  |
| 2.19.0  | `BaseDrawer`, `BaseContextMenu`, `BaseHoverCard`, `CodeBlock`                     |
| 2.18.0  | `CommandMenu` matches every word, so two-word searches find things                |
| 2.17.0  | `BaseTimeline` — a record of what happened, on a rail                             |

`CHANGELOG.md` has the reasoning; `PATCHNOTES.md` has what you gain and what
you have to do.

## Next

**Being usable, ahead of having more.** The kit has 105 components and one
user. "What most people need" is not answerable from here — every gap found
so far came from the three apps in this family or from a new measuring
instrument, and both are inside signals. Building more without outside
signal is guessing, and every guess costs maintenance, a documentation row,
a test and a slice of the stylesheet budget for ever.

So the order is:

1. **Make it answerable.** Somebody who has installed it must be able to get
   from "I need a table" to working code without opening the repository.
   That is not polish, it is the only thing that turns the question above
   into data.
2. **Then components, driven by what people actually ask for.** The gap test
   still runs; it just stops being the only source.
3. **Then readability** — and mostly consistency and navigability rather
   than more prose. Some files are getting long and the comments with them.
4. **Then size, only where measurement points.** It points at one place, and
   only one: `styles.css`, 20 KB of the flat 23, plain scoped CSS that
   Tailwind cannot shake out. Splitting it per component would fix the small
   app's dead weight and cost the two-line install. That is a 3.0
   conversation, not a 2.x one.

**What "answerable" is missing, measured 2026-09-22.** Hovering a component
said nothing for 85 of the 105, because a doc comment inside `<script setup>`
never reaches the `.d.ts` — only a comment above the export does. Fixed, and
held by a test. Three things remain:

- **Which of two neighbours to reach for** is written well in `AGENTS.md`
  and not at all in an editor. `BaseTable` or `DataTable`, `BaseSheet` or
  `BaseModal` or `BaseDrawer`, `BaseSelect` or `BaseCombobox` — about
  twenty-five pairs.
- **A working example in the editor.** `showcase/examples/<Name>.vue` exists
  for all 105 and is type-checked, so an `@example` generated from it would
  be documentation proven to compile. Few kits can say that.
- **A path from install to a screen.** The showcase is a gallery: it shows
  what exists, not how to build something. The first ten minutes should end
  with one real screen and the moment where changing the palette changes it.

## Under consideration

Each of these is here rather than in "next" because it is not yet clear the
kit should have it.

- **A carousel.** Often the wrong answer: a horizontal list with scroll-snap
  and `useDragScroll` is usually better, and is already possible. It goes in
  if somebody shows a case those two cannot cover.

## Not planned

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

## How to change what is here

Open an issue saying what you tried to build and what you ended up writing by
hand. A control written by hand in a file that already imports the kit's
version of it is a bug in the kit, every time — `BaseTimeline` was found that
way, in an app in this repo's own family. `CONTRIBUTING.md` has the rest.
