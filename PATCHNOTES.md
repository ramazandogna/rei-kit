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

## 0.12.1

**Changed:** a `BaseCard` with no head and no foot no longer wraps its content
in a div — the padding is on the card, so your layout classes land on the
content:

```vue
<BaseCard padding="md" class="flex items-center gap-4">…</BaseCard>
```

Before this, that `flex` reached the border and not the content, so you had to
add back the div the component exists to remove.

**To take it:** nothing, unless you were styling `> div` inside a plain card.

---

## 0.12.0

**You gain** a `BaseCard` you can actually use, and a `ProgressBar` that can be
thin.

```vue
<BaseCard padding="sm">…</BaseCard>
<BaseCard padding="none"><ul class="divide-hair divide-y">…</ul></BaseCard>
<ProgressBar :value="done" :max="total" size="sm" :label="t('course.progress')" />
```

`BaseCard` shipped with `px-5 py-4` baked in and was used by nobody: across the
three apps, thirty-five hand-written card surfaces used `p-3`, `p-4`, `p-5` and
`p-1`, and never that pair. If you have a `border-hair bg-surface rounded-card
border p-4` div, it is now `<BaseCard>`.

**To take it:** nothing, but the default padding changed from `px-5 py-4` to
`p-4`. Nothing was using it, which is the point.

---

## 0.11.3

**You gain** a row that can be selected:

```vue
<BaseButton variant="row" :pressed="selected === node.id" @click="pick(node)">…</BaseButton>
```

If you were writing `:class="on ? 'chip-on' : 'chip-off'"`, that is now
`:pressed="on"` on a `secondary pill xs` button — `chip-off` was `secondary`
and `chip-on` was `secondary` pressed, exactly. You also get the `aria-pressed`
those hand-written pairs never had.

**To take it:** nothing.

---

## 0.11.2

**Changed:** `quiet` fills on hover for text buttons too, not only icons.
0.11.0 drew that line at the wrong place — an editor toolbar's buttons carry
words and fill identically. If you want a text action with no surface at any
point, that is `variant="link"`.

**To take it:** nothing, unless you were relying on a quiet _text_ button
staying flat on hover — use `link` for that.

---

## 0.11.1

**You gain** `variant="destructive"`:

```vue
<BaseButton variant="destructive" icon :aria-label="t('common.delete')"><Trash2 /></BaseButton>
```

Quiet until hovered, then negative. Use `danger` for the filled button that
confirms a deletion, and this for the one that offers it.

**If you were writing `variant="quiet" class="hover:text-negative"`, stop.**
That class and quiet's own `hover:text-ink` set the same property at the same
specificity, so which one applied depended on stylesheet order — it was a coin
toss, fifteen times across the three apps.

**To take it:** nothing.

---

## 0.11.0

**You gain** the row, and an icon button that behaves like the ones you were
writing by hand.

```vue
<!-- a line in a list that is also a control -->
<BaseButton variant="row" @click="open(node)">{{ node.name }}</BaseButton>

<!-- the icon button you already had, without the classes -->
<BaseButton variant="quiet" icon :aria-label="t('common.edit')"><Pencil /></BaseButton>

<!-- and the chip, which was expressible all along -->
<BaseButton variant="secondary" pill size="xs">{{ tag }}</BaseButton>
```

- **`variant="row"`** is full width, start-aligned, and fills on hover. Sized by
  padding rather than height so it can hold two lines, and it does not press —
  a full-width line that scales looks like the list moved.
- **`quiet` + `icon`** now fills on hover. A quiet text action still does not:
  a square hit area has bounds the reader cannot see, a line of text has its own.

Why: the 117 hand-painted `unstyled` buttons across the three apps read as a
specification. `.tree-row`, `.row`, `.header-action` were all the same row;
`.icon-button` and `.stepper` were the same icon button; `.chip-off` was
already `secondary pill xs` and nobody had found it.

**To take it:** nothing.

---

## 0.10.1

**You gain** a `BaseInput` that holds a number:

```vue
<BaseInput v-model="viewsOffset" type="number" :label="t('admin.blog.offset')" min="0" />
```

It was typed to `string`, so a number field meant a string ref and a conversion
on each side. Same widening `BaseSelect` took in 0.5.3.

**To take it:** nothing. The type only widened.

---

## 0.10.0

**You gain** `variant="unstyled"` on `BaseInput`, `BaseTextarea` and
`BaseSelect` — the same escape hatch `BaseButton` already had.

```vue
<!-- a search field inside a row that is itself the bordered box -->
<BaseInput
  v-model="query"
  type="search"
  variant="unstyled"
  label-hidden
  :label="t('search')"
  class="min-w-0 flex-1 bg-transparent outline-none"
/>
```

You keep the label, the generated id, `aria-describedby` and the error; you
supply the surface. The 16px line is held either way, because the iOS zoom is
caused by the font size and not by the border.

**To take it:** nothing. `default` is what you have.

---

## 0.9.1

**Fixed, and worth taking before you adopt `size="sm"` on a phone:** it applied
`text-sm` to text fields, and iOS zooms the viewport when it focuses an input
under 16px — and does not zoom back. If your app has
`input { font-size: 16px }` in its base layer, a utility class from the kit was
overriding it.

`BaseInput` and `BaseTextarea` now stay at 16px at every size; `size` changes
the label and the spacing instead. `BaseSelect` still shrinks, because a select
opens a picker rather than a caret.

**You gain** the input types that were missing: `search`, `tel`, `url`, `date`,
`time`, `datetime-local`. Those were the ones being hand-written.

```vue
<BaseInput v-model="occurredOn" type="date" size="sm" :label="t('transaction.date')" />
```

**To take it:** nothing.

---

## 0.9.0

**Action required — one line.**

`tokens.css` no longer contains the phone shell. Add the shell your app is:

```css
@import 'rei-kit/tokens.css';
@import 'rei-kit/shell/mobile.css'; /* phone-shaped: shell-frame, page-slide, the screen slide */
@import 'rei-kit/shell/web.css'; /* a site: .shell column, a short fade between pages */
```

If you skip it the shell disappears on the first screen — this fails loudly,
not quietly.

**You gain** `shell/web.css`, which did not exist. `.shell` is the page's column
as a class, for the places where `PageContainer` is awkward: a `<header>` whose
bar spans the window while its contents line up with the text, a `<footer>`, a
hero that paints edge to edge. Plus a short page fade.

Why: `tokens.css` was shipping a 430px column, a full-viewport height and an
iOS sheet curve to a wide course site, which downloaded them in order to ignore
them — and had no counterpart of its own to reach for.

---

## 0.8.0

**You gain** a way to say that something happened.

```vue
<!-- once, at the app root -->
<ToastHost :close-label="t('common.close')" />
```

```ts
const toast = useToast()

toast.success(t('habit.saved'))
toast.danger(t('common.failed'))
const id = toast.info(t('export.preparing'), { duration: 0 }) // stays
toast.dismiss(id)
```

The word "toast" appeared zero times across all three apps — there was nothing
to reach for, so every save, delete and export finished in silence.

Worth knowing before you wire it:

- **Not for form errors.** A rejected field says so beside itself, where the
  eye already is and where it stays until fixed. Use `FormField`'s `error` and
  `BaseAlert` for those; use this for what has already happened.
- **It announces politely.** A toast does not interrupt a screen reader
  mid-sentence.
- **Three at a time**, oldest pushed out; the clock pauses on hover and focus.
- `ToastHost` renders nothing on a server, so a prerendered page is unaffected.

`BaseSheet`'s close button now has a focus ring it never had. Nothing else
about it changed.

**To take it:** add `ToastHost` once at your app root. Everything else is opt-in.

---

## 0.7.1

**Fixed:** `BaseButton` transitioned `transform` only, so its hover colour
snapped instead of fading — in every app, on every variant. `transition-colors`
appears 106 times across the three consuming apps; this was the one interactive
surface not doing it.

**To take it:** nothing. Hovers get smoother; `unstyled` still imposes no
transition of its own.

---

## 0.7.0

**You gain** a button you can build your own controls out of.

```vue
<!-- a picker cell: the kit's semantics, your paint -->
<BaseButton
  variant="unstyled"
  :pressed="value === scale"
  class="flex flex-1 flex-col items-center gap-2 py-1"
  @click="pick(scale)"
>…</BaseButton>

<!-- a success action -->
<BaseButton variant="positive">{{ t('install.action') }}</BaseButton>
```

- **`positive`, `warning`, `accent`** complete the colour roles. `tokens.css`
  declares five and the button exposed two.
- **`pressed`** makes it a switch: `aria-pressed` is written, and ghost, quiet
  and secondary take a filled look when on. Omit it and nothing changes.
- **`variant="unstyled"`** gives you the element, the `as` switch, the disabled
  handling and the focus ring, and no appearance at all.

Why: there were 58 raw `<button>` elements in 24 files that already used
`BaseButton` — reached for the kit, gave up halfway down the same file. The kit
offered all of its appearance or none of itself, and those places needed
everything except the appearance.

**To take it:** nothing. All three are additive and every default is what you
already had.

---

## 0.6.1

**You gain** `variant="quiet"` — soft ink that darkens on hover, with no
surface at any point.

```vue
<BaseButton variant="quiet" icon :aria-label="t('common.close')"><X /></BaseButton>
```

Use `ghost` for a control that should recede until it is wanted and then look
like a button; use `quiet` for one that should stay out of the way even while
being used. The pair `text-ink-soft hover:text-ink` was hand-written 47 times
across the three apps, which is how this was found.

**To take it:** nothing.

---

## 0.6.0

**You gain** the two button shapes the kit could not make, and the size that
goes with them.

```vue
<BaseButton variant="link" size="xs">{{ t('entry.clearNote') }}</BaseButton>

<!-- the pair every prompt and nudge is built from -->
<BaseButton pill size="xs">{{ t('pwa.install') }}</BaseButton>
<BaseButton pill size="xs" variant="ghost">{{ t('common.later') }}</BaseButton>
```

`variant="link"` has no surface, and therefore no height and no padding —
giving it either would make it a ghost button. Use `ghost` for a control that
should recede until it is wanted, and `link` for one that is meant to read as
text.

Why now: 0.5.0 said it was about the hand-written `<button>` elements and then
converted none of them. Classifying them showed that about two thirds are app
code and always were — pickers, day cells, bespoke surfaces — and that of the
rest, the kit could express only the icon buttons. These are the other two
shapes.

**To take it:** nothing.

---

## 0.5.3

**You gain** a `BaseSelect` that holds numbers:

```vue
<BaseSelect v-model="dayOfMonth" :label="t('recurring.day')" :options="DAY_OPTIONS" />
<!-- DAY_OPTIONS: { value: 1, label: '1' }[] -->
```

It was typed to `string`, and the first two selects anyone tried to replace
with it held a day of the month. Adopting it would have meant converting out
in a getter and back in a setter, at every call site — and a component you have
to wrap in order to use is one you write yourself instead.

**To take it:** nothing. The type only widened.

---

## 0.5.2

**Fixed:** `size="sm"` was 36px tall, and every hand-written control it was
meant to replace was 40px or more — adopting it would have shrunk them all and
put each one under the 44px touch target.

Both sizes are now `h-11`. The scale is typographic: `sm` changes the type size
and quiets the label, and leaves the touch target alone.

**To take it:** nothing, unless you already adopted `size="sm"` from 0.5.1 and
wanted the shorter control — you now get a taller one. Nothing else moves.

---

## 0.5.1

**You gain** `size` on the form layer — `FormField`, `BaseInput`, `BaseSelect`,
`BaseTextarea`, `BaseCheckbox`.

```vue
<BaseSelect v-model="order" :label="t('courses.sort')" label-hidden size="sm" :options="ORDER" />
<BaseCheckbox v-model="remember" :label="t('auth.rememberMe')" size="sm" />
```

`sm` is the control that sits inside something else — a filter row, a settings
line, an aside under a form. It is `text-sm`, and its label goes quiet
(`text-xs`, `text-ink-soft`) so it does not outweigh the thing it names.

This exists because 0.5.0's form components could not replace a single
hand-written control in any of the three apps: all five hand-rolled `<select>`s
were the small one, and four of the five checkboxes were the quiet aside. The
kit only had the large one.

**Fixed:** the form controls never stated their own type size, so they
inherited whatever the page set. Two of the three apps force `font-size: 16px`
on form elements to stop iOS zooming on focus and the third does not, so the
same `BaseInput` rendered at two sizes depending on the app. `md` is now
explicitly `text-base` — which is what the apps forcing 16px already had, so
nothing moves in them.

**To take it:** nothing. `md` is the default and is what you have.

---

## 0.5.0

**You gain** a button that can be a link, and a form layer.

`BaseButton` takes `as` — `'button'` (default), `'a'` with `href`, or
`'router-link'` with `to`:

```vue
<BaseButton as="router-link" to="/kurslar">Kurslar</BaseButton>
<BaseButton as="a" href="/fiyatlandirma" variant="secondary">Fiyatlar</BaseButton>
```

**If your app wraps buttons in links, unwrap them.** `<RouterLink><BaseButton>`
renders an `<a>` around a `<button>`: invalid HTML, two stops in the tab order,
two controls announced for one thing on the screen. This is the fix.

Also on `BaseButton`: `size="lg"` (56px, for a wide page's call to action),
`icon` (square, sized to its glyph — **pass `aria-label`**), and `block` (full
width, the ordinary case under a form).

New components:

|                  |                                                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `FormField`      | Label, hint, error and the id wiring between them. Wrap your own control in it via the slot                                                     |
| `BaseSelect`     | A native `<select>` with the chrome replaced. Takes `options`, and a `placeholder` nobody can choose back to                                    |
| `BaseTextarea`   | Multi-line, with `rows`. Growth is left to the browser's resize handle rather than moving everything below it as you type                       |
| `BaseCheckbox`   | Label beside the box, and the whole row is the hit target                                                                                       |
| `BaseRadioGroup` | `fieldset` + `legend`, because the thing being named is the question. There is no `BaseRadio`: one radio is half a choice that cannot be unmade |

**To take it:** nothing. Every addition is additive, and `BaseInput` — now
built on `FormField` — has the same props, behaviour and markup it had.

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
