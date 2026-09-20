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
- A benchmark in `bench/` that bundles the same three components against five
  other kits.
- A component count asserted against the generated catalogue, in every place
  it is written down.

If something here is ever untrue, that is a bug worth reporting.

## Done recently

| Version | What                                                                       |
| ------- | -------------------------------------------------------------------------- |
| 2.18.0  | `CommandMenu` matches every word, so two-word searches find things         |
| 2.17.0  | `BaseTimeline` — a record of what happened, on a rail                      |
| 2.16.0  | `ColorPicker` — the platform's own picker, painted                         |
| 2.15.0  | `SliderField`, and a tooltip that can follow the pointer                   |
| 2.14.0  | `MegaMenu` — a disclosure, not a `role="menu"`                             |
| 2.13.0  | `BaseCombobox`: several answers, a list from a server, a virtual window    |
| 2.12.0  | Table columns whose heading goes where their figures go                    |

`CHANGELOG.md` has the reasoning; `PATCHNOTES.md` has what you gain and what
you have to do.

## Next

**Trust and onboarding, ahead of more components.** The barrier is not the
size of the catalogue — it is that somebody arriving cannot tell in a minute
whether this fits, and cannot tell at all whether it is maintained.

- The showcase keeps growing sections faster than it grows a way around
  them. Several are still a card holding four components.

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
