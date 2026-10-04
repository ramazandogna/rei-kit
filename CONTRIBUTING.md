# Contributing to rei-kit

Everything here is for somebody changing the package. If you are using it,
the [README](./README.md) and
[the documentation site](https://ramazandogna.github.io/rei-kit/) are the
whole story.

## Commands

| Command               | What it does                                          |
| --------------------- | ----------------------------------------------------- |
| `pnpm dev`            | Rebuild on change, for use with a linked app          |
| `pnpm build`          | Type-check, then build                                |
| `pnpm check`          | Everything CI runs: format, lint, types, tests, build |
| `pnpm showcase`       | The showcase, in dev mode                             |
| `pnpm showcase:build` | The showcase, built (`SHOWCASE_BASE` for a subpath)   |
| `pnpm test:unit`      | Vitest, watch mode                                    |
| `pnpm lint`           | oxlint + ESLint, with `--fix`                         |

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
cd bench && npm run bench && cd ..   # the site's comparison table reads this
pnpm version minor
git push --follow-tags
```

The benchmark step is not optional and not a courtesy: `showcase-catalogue.spec.ts`
fails when `bench/results.json` names a version other than the one being
published, because the evidence section on the site reads that file. A
comparison table nobody re-ran is a claim about a build nobody ships.

Then write the release into `PATCHNOTES.md` — what a consumer gains, and what
they have to do to take it.

## Taking part

Issues and pull requests are welcome at
[github.com/ramazandogna/rei-kit](https://github.com/ramazandogna/rei-kit).
A change that adds a component needs its sample, its row in `AGENTS.md`, a
behaviour test and a doc comment above its export — `pnpm check` tells you
which of those is missing before a reviewer has to.
