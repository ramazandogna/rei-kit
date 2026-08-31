# rei-kit

Vue 3 and Tailwind 4 design system and shared runtime. Extracted from
[Hibi](https://github.com/ramazandogna/hibi).

零 — the layer everything else starts from.

## Why it exists

Hibi's shared layer turned out to be genuinely portable: no file under
`shared/` imported from `features/`, so the components, the date and theme
helpers, and the i18n runtime could leave without being rewritten. This is that
layer, packaged so the next app installs it instead of copying it.

## Status

**v0.0.0 — extraction complete, no consumer yet.** Thirteen components,
eight utilities, six composables, a generic i18n runtime and an optional
Supabase entry. Hibi moves onto it next.

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
provide/inject is not a spare copy -- it is a different injection key, so the
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

Three lines, and all three are load-bearing:

```css
/* your app's main.css */
@import 'tailwindcss';
@import 'rei-kit/tokens.css'; /* colour roles, the dark variant, utilities */
@import 'rei-kit/styles.css'; /* compiled component styles */

/* Tailwind generates a utility only where it has seen the class, and it does
   not walk node_modules on its own. Without this the kit's components render
   with every class present in the markup and absent from the stylesheet. */
@source '../../node_modules/rei-kit/dist';
```

The path is relative to the CSS file, so adjust the `../` depth to where your
`main.css` sits.

Leaving any of the three out fails quietly: the build succeeds, the components
mount, and they come out unstyled. Nothing type-checks this, so it is worth a
test -- see _Not breaking the apps that use it_.

### Colours

`tokens.css` defines all eleven roles, a `.dark` block for each surface, and the
`dark` variant. A new app rebrands by overriding values, never by renaming:

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

Tokens are named for what they do, not for the app they came from, so a new
product changes values rather than renaming anything.

## Commands

| Command          | What it does                                          |
| ---------------- | ----------------------------------------------------- |
| `pnpm dev`       | Rebuild on change, for use with a linked app          |
| `pnpm build`     | Type-check, then build                                |
| `pnpm check`     | Everything CI runs: format, lint, types, tests, build |
| `pnpm test:unit` | Vitest, watch mode                                    |
| `pnpm lint`      | oxlint + ESLint, with `--fix`                         |

## Not breaking the apps that use it

Three layers, cheapest first.

**Pinned ranges.** A consumer depends on `^0.1.0`, which at 0.x means
`>=0.1.0 <0.2.0` — publishing 0.2.0 upgrades nobody. Apps move on their own
schedule, and a release can never reach an app that has not asked for it.

**The public API test.** `src/__tests__/public-api.spec.ts` lists every export
by name. The kit compiles perfectly well without an export nothing here calls,
so removing one is invisible to every other test; this one fails loudly and
asks whether the version should be a major.

**The consumer check.** `.github/workflows/consumer.yml` packs the tarball npm
would serve, installs it into Hibi, and runs Hibi's full gate — format, lint,
types, 37 tests, production build. A renamed prop shows up as a red pull
request here rather than as a broken app after release.

That last one is the important one: the kit's own tests never import it the way
an app does.

## Releasing

Pushing a `v*` tag runs the full check and publishes to npm. Nothing publishes
from a branch, so `main` can move without shipping.

```sh
pnpm version minor
git push --follow-tags
```

## License

MIT
