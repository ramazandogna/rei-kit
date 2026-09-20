# Security

## Reporting a vulnerability

Use GitHub's private reporting: **Security → Report a vulnerability** on
[this repository](https://github.com/ramazandogna/rei-kit/security/advisories/new).
It keeps the report private until there is a fix.

If that is not available to you, email **doganrmzn40 [at] gmail.com** with
`rei-kit security` in the subject.

Please do not open a public issue for a vulnerability.

This is a one-maintainer project, so an honest expectation rather than a
promise: you should get a first reply within a few days. If a week passes
with nothing, send a plain nudge — it means the message was missed, not
ignored.

## Supported versions

The latest minor of the current major gets fixes. Nothing older is patched;
upgrading within a major never requires changes, because a minor adds and a
patch fixes — an export is never removed, a prop is never renamed, and a
component never changes what it renders for the same input.

| Version | Supported |
| ------- | --------- |
| 2.x     | Yes       |
| 1.x     | No        |
| 0.x     | No        |

## What this package does and does not do

Worth knowing before you go looking, and worth telling you rather than
letting you find out:

- **It has no network calls of its own.** Nothing in `rei-kit`, `rei-kit/web`,
  `rei-kit/app`, `rei-kit/pwa` or `rei-kit/motion` fetches anything. The
  optional `rei-kit/supabase` entry wraps `@supabase/supabase-js`, which does
  — importing that entry is the opt-in, and it is the only entry that talks to
  a server.
- **It writes to `localStorage` in four places**, each under a key the app
  chooses or can change: the theme, the material and the palette preference,
  and — only if you call `useSnooze` from `rei-kit/pwa` — the date a nudge
  was dismissed. Nothing else is stored and nothing is read that the kit did
  not write. `setRememberMe(false)` from the Supabase entry moves that
  entry's session to `sessionStorage`, so it dies with the tab.
- **One place handles untrusted input on purpose.** `safeRedirect` accepts
  same-origin paths only and rejects `//host`; `toRedirectPath` drops the URL
  fragment before it can become a query parameter. That second one matters:
  Supabase's implicit OAuth flow returns tokens in the fragment, a fragment
  never reaches a server, and copying it into `?redirect=` puts it into
  access logs and `Referer` on the very next request. `createAuthGuard`
  routes every redirect through it.
- **One component renders HTML it is given**: none. No component in this kit
  uses `v-html`. The showcase's code block does, on output from its own
  highlighter, which escapes every token before wrapping it — a test asserts
  that escaping.
- **The published package has no runtime dependencies.** Everything it needs
  is a peer the app already has, so nothing is pulled in behind you.

## Scope

A report is in scope if it affects the published package. The showcase site,
the benchmark harness and the repository's own tooling are not — they ship to
nobody — though a message about them is still welcome as an ordinary issue.
