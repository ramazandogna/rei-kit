# rei-kit

Vue 3 and Tailwind 4 design system and shared runtime.

零 — the layer everything else starts from.

## Why it exists

**The kit distributes decisions, not a look.** Three apps run on it and no two
resemble each other: a phone journal, a phone ledger, and a wide Japanese
course site. None of them forked it, because there is not a single hex value
inside a component. Colours are named for the role they play, and an app
rebrands by redefining eleven values.

That is the whole trick, and everything else follows from it.

### What gets to be in here

The kit is not built from what its current apps happen to need. It is built to
be the thing the next app starts from. So the rule depends on what kind of
thing is being added — and conflating the two cost this package three releases
that shipped parts nobody could use.

**Primitives are complete by construction.** A button, a field, a toast, a
modal. There is no uncertainty about whether the next app will want one, so
they do not wait for a second consumer: waiting means every new app begins by
copying, which is the thing this package exists to prevent. A primitive is
finished when two checkable things are true:

- **It covers every role the design system declares.** `tokens.css` names five
  colour roles while `BaseButton` exposed two, so an app that wanted a
  success-coloured action hand-wrote the button. A component that cannot use a
  role its own token file declares is not being careful; it is incomplete.
- **The app can take the behaviour without the appearance.** `variant="unstyled"`
  exists because 58 raw `<button>` elements sat in 24 files that already
  imported `BaseButton`. A picker cell, a chip, a calendar day: the surface is
  the app's and should be, but the element, the focus ring, the disabled
  handling and the `aria-pressed` bookkeeping are not — and they were being
  rewritten every time, usually without the focus ring.

**Composed components wait for two apps.** A `PriceCard`, a `TourShell`, a
`DangerZone`. These carry a shape, and a shape designed from one example is
designed wrong. Here the measure is `diff`, not taste: **a file that is 90%
identical in two apps is a kit candidate.**

**Both kinds:** no new required peer — anything needing a library goes behind
its own entry point or stays in the app — and no product decision. No colour,
no copy, no icon. Those arrive as props and slots.

**And one test worth more than the rule:** a raw `<button>` in a file that
already imports `BaseButton` is a bug in the kit, not in the app. That grep
found every gap closed between 0.5.0 and 0.7.0, and it found them after those
releases had claimed to be finished.

## Status

**v0.4.4 — three consumers.**

|             |                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Components  | 22                                                                                                                                                     |
| Composables | 11                                                                                                                                                     |
| Utilities   | 20                                                                                                                                                     |
| Also        | a generic i18n runtime, an optional Supabase entry                                                                                                     |
| Consumers   | [Hibi](https://github.com/ramazandogna/hibi) · [Kakei](https://github.com/ramazandogna/kakei) · [Kakehashi](https://github.com/ramazandogna/kakehashi) |

Every export is listed by name in `src/__tests__/public-api.spec.ts`, which is
the package's promise written down.

## Install

```sh
pnpm add rei-kit
```

Everything the kit expects from the app is a peer dependency, so the app's copy
is the only copy:

| peer                    | needed for                        |
| ----------------------- | --------------------------------- |
| `vue`                   | everything                        |
| `tailwindcss`           | the tokens and utilities          |
| `lucide-vue-next`       | component icons                   |
| `vue-router`            | `TabBar`, `LocaleLinks`           |
| `vue-i18n`              | the i18n runtime only             |
| `@supabase/supabase-js` | the `rei-kit/supabase` entry only |

This is not a formality. A second copy of a library that works through
provide/inject is not a spare copy — it is a different injection key, so the
app's own provider becomes invisible and the component throws on mount.

## Use

```vue
<script setup lang="ts">
import { BaseButton, BaseSheet, useTheme } from 'rei-kit'

const theme = useTheme()
</script>
```

Supabase lives behind its own entry, so an app that does not use it never
downloads it:

```ts
import { createSupabaseClient } from 'rei-kit/supabase'
```

### Wiring the styles

Four lines, and all four are load-bearing:

```css
/* your app's main.css */
@import 'tailwindcss';
@import 'rei-kit/tokens.css'; /* colour roles, the dark variant, measures, utilities */
@import 'rei-kit/styles.css'; /* compiled component styles */

/* Tailwind generates a utility only where it has seen the class, and it does
   not walk node_modules on its own. Without this the kit's components render
   with every class present in the markup and absent from the stylesheet. */
@source '../../node_modules/rei-kit/dist';
```

The path is relative to the CSS file, so adjust the `../` depth to where your
`main.css` sits.

**Leaving any of the four out fails quietly:** the build succeeds, the
components mount, and they come out unstyled. Nothing type-checks this, so it
is worth a test — Hibi's `kit-styling.spec.ts` reads its own stylesheet and
asserts all four, at unit-test speed. Copy it.

That test exists because the failure is real: Hibi shipped with the tab bar
invisible once, and separately spent three versions restating `tokens.css`
locally instead of importing it, which nothing noticed.

### Colours

`tokens.css` defines all eleven roles, a `.dark` block for each surface, and
the `dark` variant. A new app rebrands by overriding values, never by renaming:

```css
@theme {
  --color-primary: #6b4de6; /* main action */
  --color-accent: #3b2f8f;
  --color-positive: #2fa36b;
  --color-negative: #d1453b;
  --color-warning: #d89a3e;
  --color-muted: #efeaff; /* calm surface, empty cell */
  --color-canvas: #faf9ff; /* behind the shell */
  --color-surface: #ffffff; /* card */
  --color-ink: #17132b; /* text */
  --color-ink-soft: #6a6484; /* secondary text */
  --color-hair: #e8e4f2; /* rule */
}
```

An app that already has its own palette does not have to rename it. Alias the
roles onto the names it already uses, and keep them as `var()` references so
the app's own dark-mode overrides carry into the kit's components:

```css
@theme {
  --color-primary: var(--color-sea);
  --color-muted: var(--color-mist);
}
```

Put your own `.dark` block _after_ the import. Both blocks match at the same
specificity, so the later one wins — which is what makes the override work.

### Measures

Widths are roles too. `PageContainer` shipped with `75rem` baked in, and the
first app that wanted it had deliberately measured its page at 1120px, so the
component written to remove that app's hand-rolled container could not replace
it — the same mistake as a hex inside a component, one axis over.

```css
@theme {
  --measure-page: 1120px; /* a page */
  --measure-reading: 68ch; /* a column of prose */
}
```

### The phone shell

`tokens.css` also carries the geometry of a phone shell — `shell-frame`,
`page-slide`, `page-auth` and the slide transitions between screens. All of it
is opt-in: nothing applies unless you put the class on an element, so a wide
app can ignore it. Two of the three consumers use it.

### Prerendering

The kit imports and renders on a server, so an app can prerender with
`vite-ssg` or any other SSR build. Two things stay the app's job, because only
the app knows the answer:

- **The theme.** `applyTheme` does nothing without a document, so prerendered
  HTML carries no `.dark`. Set it before hydration with a small synchronous
  script in `index.html`, or the first paint flashes light.
- **Today's date.** `useToday()` on a server is the _server's_ today, a
  different day from the visitor's either side of midnight. Render anything
  derived from it on the client.

## Seeing what is in it

```sh
pnpm showcase
```

A page that wires the kit exactly the way this README says to, so a broken
install shows up there before it ships. A component nobody can see is a
component nobody uses.

## Commands

| Command          | What it does                                          |
| ---------------- | ----------------------------------------------------- |
| `pnpm dev`       | Rebuild on change, for use with a linked app          |
| `pnpm build`     | Type-check, then build                                |
| `pnpm check`     | Everything CI runs: format, lint, types, tests, build |
| `pnpm showcase`  | The showcase, in dev mode                             |
| `pnpm test:unit` | Vitest, watch mode                                    |
| `pnpm lint`      | oxlint + ESLint, with `--fix`                         |

## Not breaking the apps that use it

Four layers, cheapest first.

**Pinned ranges.** A consumer depends on `^0.4.0`, which at 0.x means
`>=0.4.0 <0.5.0` — publishing 0.5.0 upgrades nobody. Apps move on their own
schedule, and a release can never reach an app that has not asked for it. The
cost is the mirror image: an app that never asks never moves. Two of these
three sat two minors behind, so `PATCHNOTES.md` exists to make taking one a
short read.

**The public API test.** `src/__tests__/public-api.spec.ts` lists every export
by name. The kit compiles perfectly well without an export nothing here calls,
so removing one is invisible to every other test; this one fails loudly and
asks whether the version should be a major.

**The SSR test.** `src/__tests__/ssr.spec.ts` renders in the **node**
environment, not jsdom — jsdom supplies the very `document` a server lacks, and
passed all four of the SSR bugs 0.2.2 fixed.

**The consumer check.** `.github/workflows/consumer.yml` packs the tarball npm
would serve and installs it into **all three** apps, running each one's full
gate — format, lint, types, tests, production build. Kakehashi's build is
`vite-ssg build`, so that job is also the real prerender.

That last one is the important one: the kit's own tests never import it the way
an app does.

## Releasing

Pushing a `v*` tag runs the full check and publishes to npm. Nothing publishes
from a branch, so `main` can move without shipping.

```sh
pnpm version minor
git push --follow-tags
```

Then write the release into `PATCHNOTES.md` — what a consumer gains, and what
they have to do to take it.

## License

MIT
