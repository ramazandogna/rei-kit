# Patch notes

What each release means for an app that installs this. `CHANGELOG.md` is the
other half: it records _why_ a change was made and reads like an argument.
This file answers two questions only — **what you gain**, and **what you have
to do to take it**.

Versions follow [semver](https://semver.org). While the major is `0`, a minor
may carry a breaking change; every one of them is marked **Action required**
below, and there has not been one yet.

> **A note on `^0.x`.** A caret range at `0.x` does not cross a minor:
> `^0.2.1` resolves to `<0.3.0`, so publishing 0.3.0 upgrades nobody. Two of
> this kit's three consumers sat two minors behind for exactly this reason.
> Until 1.0.0, taking a minor is a deliberate act — `pnpm add rei-kit@^0.4.4`.

---

## 0.4.4

**You gain** a fourth `BaseButton` variant, `secondary`: bordered, on the
surface colour.

Use it for a real action that is not the one being urged — "Save draft" beside
"Publish". `ghost` had been standing in for that job and cannot do it: with no
border and no fill it reads as a caption rather than as the other half of a
choice. Keep `ghost` for a control that should recede until it is wanted.

**To take it:** nothing. Existing variants are untouched.

---

## 0.4.3

**You gain** the ability to forward your own optional values into the kit's
optional props.

If your app compiles with `exactOptionalPropertyTypes`, `:note="note"` where
`note` is `string | undefined` used to fail to type-check — under that flag
`note?: string` means the prop may be _absent_, not that it may be `undefined`.
Thirty-five props across sixteen components now read `?: T | undefined`.

**To take it:** nothing. This only widens what a prop accepts.

---

## 0.4.2

**You gain** a `bullet` slot on `PriceCard`, so the list marker can say
something the tone cannot — on the tier someone already has, the features are
things they hold rather than things they would get.

**To take it:** nothing. Without the slot the marker is what it was.

---

## 0.4.1

**You gain** `--measure-page` and `--measure-reading` as tokens, overridable in
your `@theme` like any colour role.

`PageContainer` had `75rem` baked in, so an app that had deliberately measured
its page at something else could not use the component written to replace its
hand-rolled container.

**To take it:** nothing, unless you want a different measure:

```css
@theme {
  --measure-page: 1120px;
}
```

---

## 0.4.0

The kit was extracted from a phone app and had never grown the parts a desktop
app needs.

**You gain** six components, a composable and a way to see them:

|                 |                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| `PageContainer` | One measure, centred, with the page's gutters. `wide` for a page, `reading` for prose at ~68 characters        |
| `BaseCard`      | A bordered surface with optional head and foot slots. `interactive` opts into the lift and press               |
| `BaseAlert`     | info / success / warning / danger, by role. `assertive` decides whether a screen reader interrupts             |
| `BaseBadge`     | A small standing label. Never a control                                                                        |
| `ProgressBar`   | Clamped rather than trusted — computed progress arrives as 101, as -3, and as NaN                              |
| `ErrorBoundary` | Catch, report, reset on navigation. The fallback is a slot, so the icon and the wording stay yours             |
| `useMediaQuery` | Starts `false` and resolves on mount, so a prerendered page is not built for a screen the server does not have |

Also: `pnpm showcase` runs a page that wires the kit exactly the way the README
tells you to, so a broken install shows up there before it ships.

**Fixed:** `VERSION` was the literal string `'0.0.0'` and nothing ever rewrote
it. If you displayed it anywhere, it was lying.

**To take it:** nothing. Every addition is additive, and no existing export
changed name, props or behaviour.

If you have a hand-rolled error boundary, this is the one to delete — keep your
icon and your sentence in the `fallback` slot and let the kit do the catching.

---

## 0.3.1

**You gain** readable Supabase errors, and a `denied` kind for a request that
was understood and refused.

The mapper had gated on `error instanceof PostgrestError`, and supabase-js does
not return an instance — so it declined every error it existed for and
`permission denied for table enrollments` reached the screen as "Something went
wrong."

**Action, if applicable:** an exhaustive `switch` over `AppErrorKind` with no
`default` needs a `denied` branch. Nothing else is affected. Treat `denied` as
"sign in again", not as a fault.

---

## 0.3.0

**You gain** `PriceCard` — a pricing tier with every string handed in: name,
price, cadence, features, the call to action, and whether it is the featured
one. Nothing about money, currency or plan names lives in the kit.

**To take it:** nothing.

---

## 0.2.4

**Fixed:** `SkeletonList` treated `rowHeight` as a class name while every call
site passed a CSS length, so loading states rendered at zero height and looked
like nothing had rendered at all. It now accepts either.

---

## 0.2.3

**Fixed:** `applyTheme` no longer requires `window.matchMedia` to exist. jsdom
supplies a document and no `matchMedia`, so **your component tests** could
throw `window.matchMedia is not a function` on mounting anything that called
`useTheme`. Some embedded webviews behave the same way.

---

## 0.2.2

**You gain** the ability to import the kit on a server, which is what
prerendering with `vite-ssg` needs.

A single `import { BaseButton } from 'rei-kit'` used to throw `document is not
defined` before anything rendered: `use-today` armed its midnight timer at
module scope. `useVisualViewport`, `applyTheme` and the i18n runtime had the
same class of problem.

**Two things stay your job,** because only your app knows the answer:

- **The theme.** `applyTheme` does nothing without a document, so prerendered
  HTML carries no `.dark`. Set it before hydration with a small synchronous
  script in `index.html`, or the first paint flashes light.
- **Today's date.** `useToday()` on a server is the _server's_ today — a
  different day from the visitor's either side of midnight. Render anything
  derived from it on the client.

**To take it:** nothing.

---

## 0.2.1

**Fixed, and worth upgrading for:** `vue-router` was inlined into the bundle,
so your app got a second copy — and a second copy of a library that works
through provide/inject is not a spare copy. Its injection key differs, so
`TabBar` injected a router your app had never provided and threw during
`setup`.

**Action:** any app on 0.2.0 that renders `TabBar` or `LocaleLinks` should
upgrade.

---

## 0.2.0

**You gain** `TabBar` — a floating bottom navigation bar, generic over the tab
key — and `GoogleButton`.

**Do not use 0.2.0.** See 0.2.1: `vue-router` is inlined here.

---

## 0.1.0

First release: 15 components, 6 composables, 8 utilities, a generic i18n
runtime and an optional Supabase entry, extracted from Hibi.

**To take it:** three CSS lines and a `@source`. See the README — leaving any
of them out fails quietly, and the components come out unstyled.
