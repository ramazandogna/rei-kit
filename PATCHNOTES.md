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

## Coming

What is planned, why, and the measurement behind it. Each line is a file two or
more apps have written separately — the number is how much of it is identical
today, so it is a promise about duplication rather than a wish list.

Dates are not given. A part ships when a consumer can adopt it in the same
session, which is the rule that produced 0.5.2, 0.5.3, 0.6.1, 0.9.1, 0.12.1, 0.14.1,
0.15.0, 0.16.0, 0.17.0 and 0.18.0 — every one of those was a gap found by adopting rather than by reading.

### Considering

- **`authSchema`.** Planned for 0.15.0 and held back. The two identical copies
  are identical because both apps picked an eight-character minimum and the
  third picked ten — a product decision, which the rule keeps in the app. With
  `fieldErrors` shipped, what is left in each app is fourteen lines stating its
  own password policy. It ships if a fourth app writes the same fourteen.
- **`formatCurrency` / `formatNumber`.** One consumer has 186 lines of money
  handling — minor units, `bigint` arithmetic, `Intl` — and only its currency
  list is product-specific. The kit ships `formatDate` and nothing else.
- **A sentinel in `styles.css`** that warns in development when one of the four
  CSS lines is missing. The failure is currently silent: the build stays green
  and the components render unstyled.
- **`BaseRadioGroup` and `size="lg"`** have no users. They stay — a primitive
  set is complete by construction — but if a second release passes without
  either being reached for, the shape is probably wrong rather than unneeded.

### Not planned

Anything that carries a product decision. `FuriganaText`, `KanjiStrokes`,
`WordQuiz`, `ExamShell`, `DayTimeline` and their relatives stay in the app that
owns the subject. The rule is not how general a component looks — it is whether
the kit would have to learn what the app is about.

### Before 1.0.0

- A behaviour test for every component. 154 tests cover the parts that fail
  quietly; the rest are covered only by the public-API list and the SSR gate.
- The showcase completed and published. Six components are still missing from
  it, and they are the six that are hardest to install correctly.
- Prop tables for people. `AGENTS.md` documents the kit for assistants; there
  is no equivalent for a reader.

---

## 0.18.0

**You gain** everything `rei-kit/web` was meant to have.

```ts
import { BaseTooltip, BaseTabs, BasePagination, BaseBreadcrumb, BaseDisclosure } from 'rei-kit/web'
```

0.17.0 held four of these back because no consumer had written one. That was
the wrong test — `AGENTS.md` says no counting of call sites — and this release
undoes it. You should not have to hand-write a pagination control because the
kit's authors' apps do not paginate.

`BaseTooltip` needs no JavaScript: it is shown by `:hover` and `:focus-within`,
so it survives prerendering and a reader with scripting off. Pass the trigger
through the slot to get the `aria-describedby` wiring:

```vue
<BaseTooltip :label="t('copy.hint')" v-slot="{ describedBy }">
  <button :aria-describedby="describedBy" @click="copy">⧉</button>
</BaseTooltip>
```

`BaseTabs` is in-page tabs with the keyboard behaviour the pattern requires:
Tab in once and out once, arrows to move, Home and End for the ends. `v-model`
carries the active key.

`BasePagination` emits `change` with a number; routing is yours. `previousLabel`
and `nextLabel` are required because the arrows are glyphs.

`BaseDisclosure` is one accordion row. Reach for it instead of `BaseAccordion`
whenever the list is yours — when the rows are staggered, interleaved, or come
from somewhere the accordion cannot see.

**To take it:** `pnpm add rei-kit@^0.18.0`. Nothing is removed, so nothing
breaks.

---

## 0.17.2

**Fixed:** `NavLinks` still ignored `class="hidden"` after 0.17.1. A scoped
component's root rule outranks a utility class no matter how it is written —
Vue's `[data-v-hash]` supplies the specificity — so the layout moved off the
root entirely. Style the root freely now.

**To take it:** nothing. If you worked around 0.17.0 with a wrapper, you can
drop it.

---

## 0.17.1

**Fixed:** `NavLinks` ignored `class="hidden"`. Its root declared
`display: flex` at the same specificity as the utility and later in the
cascade, so the nav showed on a phone. The layout is inside `:where()` now, so
your class always wins.

**To take it:** nothing, unless you shipped 0.17.0 with a responsive class on
`NavLinks` — in which case take this and drop the wrapper you needed.

---

## 0.17.0

**You gain** a fifth entry point for wide sites.

```ts
import { BaseModal, BaseAccordion, NavLinks } from 'rei-kit/web'
```

A phone app never downloads it, the same way a wide site never downloads
`rei-kit/app`.

`BaseModal` is the dialog, and it is not `BaseSheet` with different padding — a
sheet slides from the bottom edge and belongs to a thumb, a modal appears in the
middle of what you were reading. Take it for the parts that are invisible when
they are missing: focus moves in and comes back, Tab wraps instead of walking
out, Escape closes, the page underneath stops scrolling and starts again even if
the dialog is unmounted while open.

```vue
<BaseModal
  v-model="open"
  :title="t('exam.warnTitle')"
  :close-label="t('common.close')"
  tone="alert"
>
  {{ t('exam.warnBody') }}
  <template #actions>
    <BaseButton variant="quiet" @click="open = false">{{ t('common.cancel') }}</BaseButton>
    <BaseButton @click="start">{{ t('exam.begin') }}</BaseButton>
  </template>
</BaseModal>
```

`dismissible: false` removes the close button and stops Escape, for a dialog
that has to be answered.

`BaseAccordion` keeps every answer in the markup — which is what a crawler and
a reader without JavaScript get — and animates the panel from `0fr` to `1fr`.
`headingLevel` is a prop because the level depends on what is above it and
getting it wrong breaks the page outline.

`NavLinks` takes the same items as `TabBar` without the icon.

**Smaller than promised, on purpose.** The plan listed eight components and
three shipped; the rest had no user, or would have been the wrong answer. The
reasoning is in `CHANGELOG.md` and it is the same rule that has been in force
all along — a component nobody reached for is a guess at a shape.

**To take it:** `pnpm add rei-kit@^0.17.0`. Nothing is removed, so nothing
breaks.

---

## 0.16.1

**Fixed:** `FabButton` shipped without a focus ring. It was an unstyled
`BaseButton` in the app it came from and inherited one; as a bare `<button>` it
had none, so a keyboard user could not see where they were.

**To take it:** nothing, unless you shipped 0.16.0 — in which case take this.

---

## 0.16.0

**You gain** the phone frame itself, and the five smaller things that sat
around it.

```ts
import {
  TabShell,
  OfflineBanner,
  FabButton,
  createAuthGuard,
  createTitleGuard,
  createQueryDefaults,
  createWriteReport,
} from 'rei-kit/app'
import { toRedirectPath } from 'rei-kit'
```

`TabShell` replaces the outer half of `App.vue`: the textured field, the
desktop credits, and the shell card itself. The layout switch and the
`RouterView` stay yours — that is the part that differs between apps, and
keeping it outside the frame is what stops a page that throws from taking the
tab bar with it.

```vue
<TabShell>
  <template #aside><AppCredits /></template>
  <template #chrome><UpdatePrompt /></template>

  <component :is="layoutComponent">
    <RouterView v-slot="{ Component, route }">
      <Transition :name="tabTransition.name.value">
        <component :is="Component" :key="route.path" :class="pageClass" />
      </Transition>
    </RouterView>
  </component>
</TabShell>
```

The lattice colour is `--rk-lattice` (and `--rk-lattice-alpha`); set it wherever
you set your theme. It defaults to the ink colour, which is legible against
anything the tokens can produce.

`createTabTransition` gained `name` — the `<Transition>` name for the current
direction, empty when there is nothing to slide. That empty string matters: an
unnamed `<Transition>` still runs a default `v-*` animation.

`createAuthGuard` takes what differs and nothing else:

```ts
router.beforeEach(
  createAuthGuard({
    isAuthenticated: () => useAuthStore().isAuthenticated,
    signIn: { name: 'LoginView' },
    // redirectQuery: 'next'      — if your login screen reads a different key
    // home: '/kurslar'           — if a signed-in visitor has somewhere fixed to be
    // ready: () => auth.init()   — if a session has to be restored first
  }),
)
router.afterEach(createTitleGuard('Kakei'))
```

It does nothing while prerendering, so an SSG build does not write a login page
into a file meant to be content.

**Read this one even if you take nothing else.** Every redirect the guard builds
goes through the new `toRedirectPath`, which drops the URL fragment. Supabase's
implicit OAuth flow returns the access and refresh tokens in that fragment; a
fragment never reaches a server, but copied into `?redirect=` it does — into the
access log, into `Referer`, into history. If your guard passes `to.fullPath`
straight into a query parameter, it is leaking tokens today. Either adopt the
guard or wrap that one call:

```ts
query: {
  redirect: toRedirectPath(to.fullPath)
}
```

`createQueryDefaults()` returns the defaults object, not a client, so the kit
does not depend on TanStack Query and your `queryClient` stays the module-level
singleton your auth store calls `clear()` on.

`createWriteReport` takes functions, not strings, so the wording follows a
language switch instead of freezing at build time.

**To take it:** `pnpm add rei-kit@^0.16.0`. Nothing is removed, so nothing
breaks.

---

## 0.15.0

**You gain** the sign-in screen, which three apps had written four times.

```ts
import { AuthForm, fieldErrors } from 'rei-kit/app'
import { toAuthMessageKey } from 'rei-kit/supabase'
```

`AuthForm` is both modes in one component — `mode="signIn"` or `mode="signUp"`.
It renders the OAuth button, the divider, the fields, remember-me and the
submit button; it does not sign anybody in. You get `submit` with the values
and you hand back `busy` and `error`, because the store, the redirect and the
wording of a failure are yours.

```vue
<AuthForm
  mode="signIn"
  :labels="{
    email: t('auth.email'),
    password: t('auth.password'),
    confirmPassword: t('auth.confirmPassword'),
    submit: t('auth.signIn'),
    submitBusy: t('auth.signingIn'),
    google: t('auth.google'),
    or: t('auth.or'),
    rememberMe: t('auth.rememberMe'),
  }"
  v-model:remember="rememberMe"
  :busy="busy"
  :error="serverError ? t(serverError) : ''"
  :validate="(values) => fieldErrors(loginSchema(), values)"
  @submit="onSubmit"
  @google="onGoogle"
>
  <template #header>…</template>
  <template #foot>…</template>
</AuthForm>
```

Every string is a required prop. There are no English defaults to forget to
override.

Two labels are also switches, because a label you do not pass is a thing you do
not want: omit `google` and there is no OAuth button, omit `or` and there is no
divider, omit `rememberMe` and there is no checkbox. Remember-me renders on
`signIn` only — a new account has nothing to remember.

`fieldErrors(schema, values)` turns any validator with a `safeParse` into the
`validate` prop. It is typed structurally, so the kit does not depend on Zod and
you do not install one to use the form.

`toAuthMessageKey(error)` returns `'authError.invalid_credentials'` rather than
a sentence, so an error stored before a language switch still reads correctly
after. Pass `{ extraCodes: ['validation_failed'] }` for codes your locale files
cover beyond the shared nine; `AUTH_ERROR_CODES` is exported so you can test
that they do.

**To take it:** `pnpm add rei-kit@^0.15.0`. Nothing is removed, so nothing
breaks. If you are replacing a vee-validate login view, `validate` plus
`fieldErrors` does what `useForm` and `toTypedSchema` were doing and you can
drop both packages.

---

## 0.14.1

**Fixed:** `TourShell`'s slide transition shipped as scoped CSS and therefore
never applied — a scoped rule cannot reach slot content. It is in
`rei-kit/shell/mobile.css` now, so make sure you import that shell if you use
`TourShell`.

**To take it:** nothing, unless your guide's slides had no animation, in which
case they now have one.

---

## 0.14.0

**You gain** the last three parts the two phone apps had written twice.

```ts
import { LocaleSheet, TourShell } from 'rei-kit/app'
import { InstallSettings } from 'rei-kit/pwa'
```

- **`TourShell`** — the onboarding frame: teleport, `inert`, focus, arrow keys,
  the slide direction and the progress track. Your slides go in the slot.
- **`LocaleSheet`** — a settings row that opens a language list. Pass endonyms.
- **`InstallSettings`** — the settings row that offers installing again after
  the card was dismissed.

**To take it:** nothing.

---

## 0.13.0

**You gain** two entry points for the parts a phone app is built from.

```ts
import { AuthShell, createTabTransition, useThemeSync } from 'rei-kit/app'
import { InstallPrompt, UpdatePrompt, useInstall, watchInstallability } from 'rei-kit/pwa'
```

```ts
// main.ts — beforeinstallprompt fires once and early
watchInstallability()

// shared/lib/tabs.ts
export const tabs = createTabTransition(['today', 'week', 'year', 'profile'] as const)
router.afterEach((to, from) => tabs.resolve(to.meta.tab, from.meta.tab))
```

```vue
<UpdatePrompt
  :open="needRefresh"
  :title="t('pwa.updateTitle')"
  :body="t('pwa.updateBody')"
  :action="t('pwa.reload')"
  :dismiss-label="t('pwa.later')"
  @update="updateServiceWorker(true)"
  @dismiss="needRefresh = false"
/>
```

Why: two phone apps had written all of it twice. `AuthLayout.vue` was
thirty-seven lines with no difference at all between them; the install card was
111 lines differing in a storage key and a colour.

The service worker stays yours — `virtual:pwa-register/vue` is a build-time
module a library cannot import, so `UpdatePrompt` takes `open` and emits
`update`.

**To take it:** nothing. Both are new entries; the main barrel is unchanged.

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
