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

**v0.0.0 — scaffold only.** The build, types, lint and test pipeline are set up
and green; no components have moved yet. The migration is tracked in the plan
that accompanies this repository.

## Install

```sh
pnpm add rei-kit
```

`vue`, `tailwindcss` and `lucide-vue-next` are peer dependencies — the app
supplies them, so there is never a second copy of the Vue runtime.
`vue-i18n` is optional and only needed for the i18n runtime.

## Use

```ts
import { VERSION } from 'rei-kit'
```

```css
/* your app's main.css */
@import 'tailwindcss';
@import 'rei-kit/tokens.css';
@import 'rei-kit/utilities.css';

/* the whole rebrand */
@theme {
  --color-primary: #6b4de6;
  --color-positive: #2fa36b;
  --color-negative: #d1453b;
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

## Releasing

Pushing a `v*` tag runs the full check and publishes to npm. Nothing publishes
from a branch, so `main` can move without shipping.

```sh
pnpm version minor
git push --follow-tags
```

## License

MIT
