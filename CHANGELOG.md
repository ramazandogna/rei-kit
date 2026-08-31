# Changelog

Notable changes per release. Versions follow [semver](https://semver.org); while
the major is `0`, a minor may carry a breaking change and will say so here.

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
