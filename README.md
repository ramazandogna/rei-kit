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

## Status

**v0.15.0 — three consumers.**

|              |                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Components   | 31 (`AuthForm`, `BaseButton`, `BaseCard`, `BaseInput`, `BaseSelect`, `BaseTextarea`, `BaseCheckbox`, `BaseRadioGroup`, `BaseAlert`, `BaseBadge`, `BaseSheet`, `ProgressBar`, `PriceCard`, `ToastHost`, `TabBar`, `GoogleButton`, `LocaleLinks`, `LocaleSheet`, `AuthShell`, `TourShell`, `InstallPrompt`, `UpdatePrompt`, `InstallSettings`, `SkeletonList`, `PageContainer`, `ErrorBoundary`, etc.) |
| Composables  | 14 (`useToast`, `useTheme`, `useToday`, `useMediaQuery`, `useInstall`, `watchInstallability`, `createTabTransition`, `useThemeSync`, `useVisualViewport`, etc.)                                                                                                                                                                                                                                      |
| Utilities    | 22 (`applyTheme`, `formatDate`, `fieldErrors`, `toAuthMessageKey`, `Supabase error mapper`, i18n runtime, etc.)                                                                                                                                                                                                                                                                                      |
| Entry Points | `rei-kit`, `rei-kit/app`, `rei-kit/pwa`, `rei-kit/shell/mobile.css`, `rei-kit/shell/web.css`                                                                                                                                                                                                                                                                                                         |

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

Four lines, and every one is load-bearing:

```css
/* your app's main.css */
@import 'tailwindcss';
@import 'rei-kit/tokens.css'; /* colour roles, the dark variant, measures, utilities */
@import 'rei-kit/shell/mobile.css'; /* or shell/web.css — see The shell, below */
@import 'rei-kit/styles.css'; /* compiled component styles */

/* Tailwind generates a utility only where it has seen the class, and it does
   not walk node_modules on its own. Without this the kit's components render
   with every class present in the markup and absent from the stylesheet. */
@source '../../node_modules/rei-kit/dist';
```

The path is relative to the CSS file, so adjust the `../` depth to where your
`main.css` sits.

**Leaving any of these out fails quietly:** the build succeeds, the
components mount, and they come out unstyled. Nothing type-checks this, so it
is worth a test — Hibi's `kit-styling.spec.ts` reads its own stylesheet and
asserts them, at unit-test speed. Copy it.

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

### The shell

Tokens are what every app needs. A shell is a decision about what shape the app
is, so it is a separate import and there are two of them.

|                            |                                                                                                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rei-kit/shell/mobile.css` | `shell-frame` (a 430px column at viewport height), `page-slide` and `page-auth` scroll containers, and the sliding transition between screens                        |
| `rei-kit/shell/web.css`    | `.shell` — the page's column as a class, for a header or footer whose bar spans the window while its contents line up with the text — and a short fade between pages |

Both are opt-in throughout: nothing applies until a class lands on an element,
and both read `--measure-page` rather than declaring a width of their own.

They were one file until 0.9.0, and it was `tokens.css` — so a wide course site
downloaded a 430px column, a full-viewport height and an iOS sheet curve in
order to ignore them, and had no counterpart of its own.

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
