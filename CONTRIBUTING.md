# Contributing

Thanks for looking. This is a small project with one maintainer, so the most
useful thing you can do before writing code is open an issue and say what you
are trying to build — a lot of what looks missing is already in the kit under
a name you would not have guessed.

## Getting set up

```sh
pnpm install
pnpm showcase   # the gallery at localhost:5173, which is also the docs
pnpm test:unit  # vitest in watch mode
```

Node ^22.18 or >=24.12, and pnpm (the version is pinned in `packageManager`,
so `corepack enable` is enough).

## The one command that matters

```sh
pnpm check
```

Format, lint, three type-checks, the tests, the build and the size budgets.
CI runs exactly this, so if it passes locally it passes there. Run it before
you push; it takes well under a minute.

The three type-checks are not redundant. `type-check` is the package,
`type-check:showcase` is the gallery, and `type-check:strict` runs the kit
and every usage sample under `strictTemplates` — where an unknown prop,
attribute or event is an error, as it is in an app that turns that on. A prop
you renamed will pass the first two and fail the third.

## Adding a component

Read `AGENTS.md` first. It is written for assistants but it is the real
design document: what belongs in the kit, which near-neighbour to reach for,
and the mistakes that compile. The rules that catch people out:

- **The kit has no language of its own.** Every visible string is a required
  prop. A component with an English default ships English into an app that
  has none, silently. If a control needs a name the kit would have to invent
  — a remove button, a loading line — the control appears only when the app
  supplies the name.
- **No colour values in a component.** Not a hex, not `text-white`. Use the
  role tokens (`bg-primary`, `text-on-primary`, …); a test reads every
  component and fails on a literal. Depth is `shadow-(--shadow-card)` at
  runtime, never `shadow-card`.
- **Every control drawn by hand carries `focus-ring`** or states its own
  `:focus-visible` ring. A missing ring compiles, renders, and passes
  everything else — so a test scans for it.
- **Dates are `YYYY-MM-DD`, times are `HH:mm`,** and display goes through
  `Intl`. Never `toISOString()` for a date key: it is UTC, so a late-evening
  entry lands on tomorrow east of Greenwich.

A new component also needs:

1. An export in the right entry (`src/index.ts`, `src/web/index.ts`, …) and a
   line in `public-api.spec.ts`.
2. A row in the entry table in `AGENTS.md`, and usually a line in "which one
   to reach for" — that section is the one thing a prop table cannot say.
3. A usage sample at `showcase/examples/<Name>.vue`, which is type-checked and
   validated against the component's real props.
4. A behaviour test. Every component is mounted by one; a test asserts that.
5. A demo in the showcase.

Steps 1–4 are enforced. `pnpm check` will tell you which one you skipped.

## Tests

The suite is behaviour, not snapshots. A useful test here names the thing
that would otherwise break silently, and says why in a comment — most of the
existing ones are a bug that shipped once. If you cannot make a test fail by
reverting your fix, it is not testing your fix; that check is worth doing
before you push.

## Commits and versions

Since 1.0.0 a minor adds and a patch fixes. **Neither removes an export,
renames a prop, or changes what a component renders for the same input.** A
breaking change waits for the next major and arrives with its reason in
`CHANGELOG.md`.

`CHANGELOG.md` says *why* a change was made and reads like an argument.
`PATCHNOTES.md` answers two questions only: what you gain, and what you have
to do to take it. Both get an entry for anything an app can notice.

Releases are the maintainer's: `main` is pushed, the consumer check has to go
green against all three apps, and only then is a tag cut.

## Reporting something instead

An issue that says what you tried to build, what you reached for, and what
you ended up hand-writing is worth more than a patch. A control written by
hand in a file that already imports the kit's version of it is a bug in the
kit, every time — that is the rule this project grows by, so those reports
are the useful ones.
