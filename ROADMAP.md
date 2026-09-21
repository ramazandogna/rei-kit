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

**A real browser, ahead of more components.** Everything here is audited in
jsdom, which has no layout — so two of the things most often claimed about a
component kit are the two still unmeasured: **contrast** and **focus
order**. The axe rules for both are switched off rather than left to pass
quietly, and the palettes are checked by measuring their pairings instead.
Closing that means Playwright and a CI job, which is a dependency and a
minute on every push; it is the next decision rather than the next commit.

- **A carousel** is still the only component under consideration, below.
- The showcase has an evidence section as of 2.23.0 — the size table and the
  checks — because a gallery can show what exists and cannot show what it
  costs or whether the rules are enforced.

## Under consideration

Each of these is here rather than in "next" because it is not yet clear the
kit should have it.

- **A carousel.** Often the wrong answer: a horizontal list with scroll-snap
  and `useDragScroll` is usually better, and is already possible. It goes in
  if somebody shows a case those two cannot cover.

## Not planned

- **A `create-rei-app` or a framework module.** This stays a kit you install
  next to Tailwind. Every layer on top is a layer that has to keep up with
  the tools underneath it.
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
