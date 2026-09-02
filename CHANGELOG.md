# Changelog

Notable changes per release. Versions follow [semver](https://semver.org); while
the major is `0`, a minor may carry a breaking change and will say so here.

## 0.2.2 — 2026-09-03

### Fixed

- **The kit can be imported on a server.** `use-today` armed its midnight timer
  and added a `visibilitychange` listener at module scope, and `index.ts`
  re-exports it, so a single `import { BaseButton } from 'rei-kit'` threw
  `document is not defined` before any component rendered. The wiring now
  happens on the first `useToday()`, which also means an app that never asks for
  today never arms a timer.
- `useVisualViewport` read `window.visualViewport` during `setup`, so `BaseSheet`
  — its only caller — could not be server-rendered. Without a window it now
  returns the same `null` it already returned where the API is missing.
- `applyTheme` is a no-op without a document, and the `prefers-color-scheme`
  listener is only attached in a browser. A prerender leaves `.dark` off; the app
  settles the theme before hydration.
- The i18n runtime no longer writes `document.documentElement.lang` or detects a
  system locale where there is no browser to detect one. **The test is
  `document`, not `navigator`:** Node has had a global `navigator` since v21, so
  the obvious check would have passed on a server and baked the build machine's
  language into every prerendered page.

No public symbol was added, removed or renamed, and no prop changed. Every
consuming app can take this without reading anything.

### Added

- `src/__tests__/ssr.spec.ts`, which renders the components in the **node**
  environment. jsdom cannot prove this: it supplies the very `document` a server
  lacks, so the suite passed all four of the bugs above.

## 0.2.1 — 2026-09-01

### Fixed

- **`vue-router` is external again.** It was inlined into the bundle, so an app
  got a second copy. A second copy of a library that works through
  provide/inject is not a spare copy -- its injection key differs, so `TabBar`
  injected a router the app had never provided and threw during `setup`. Any app
  on 0.2.0 that renders `TabBar` or `LocaleLinks` should upgrade.

### Changed

- Externals are derived from `peerDependencies` instead of a hand-kept list, and
  `build-only` now verifies the built bundle imports every peer it uses. Since
  `prepublishOnly` runs that build, a bundle that inlines a peer can no longer be
  published.
- Workflows moved off the deprecated Node 20 actions.

## 0.2.0 — 2026-08-31

### Added

- `TabBar` -- a floating bottom navigation bar, generic over the tab key.
- `GoogleButton`.
- A consumer workflow that packs the real tarball, installs it into a consuming
  app and runs that app's checks, so a change here fails before it ships.

### Changed

- Publishing moved to npm Trusted Publishing (OIDC, with provenance). No token
  is stored anywhere.

## 0.1.0 — 2026-08-30

First release of the library as it exists now: 15 components, 6 composables, 8
pure utilities, a generic i18n runtime, an optional `rei-kit/supabase` entry and
the token stylesheet.

The package name carries earlier `0.0.x` history from an abandoned React and
Storybook experiment. Nothing from it survives; the library was restarted as a
Vue 3 library and shares no code with those versions.
