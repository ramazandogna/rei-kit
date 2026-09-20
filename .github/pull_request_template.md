## What this changes, and why

<!-- The why is the part a diff cannot show. If it fixes something that
     shipped, say what went wrong rather than only what is different now. -->

## Checks

- [ ] `pnpm check` passes locally (format, lint, three type-checks, tests, build, size)
- [ ] If it changes behaviour: a test that fails without the change
- [ ] If it adds a component: an export, a line in `public-api.spec.ts`, a row in
      `AGENTS.md`, a sample in `showcase/examples/`, a behaviour test, a showcase demo
- [ ] If an app can notice it: entries in `CHANGELOG.md` and `PATCHNOTES.md`
- [ ] No English defaults, no colour literals, and every hand-drawn control has a focus ring

<!-- The last one is enforced by tests, but knowing why beats being told:
     the kit has no language of its own, a theme is roles rather than values,
     and a missing focus ring passes every other check. -->

## Anything you are unsure about

<!-- Naming, which entry it belongs in, whether it belongs at all. Better
     asked in the PR than discovered after a release. -->
