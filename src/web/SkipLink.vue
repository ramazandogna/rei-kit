<script setup lang="ts">
/**
 * "Skip to content" — the first thing in the tab order, hidden until it has
 * focus.
 *
 * ## Why this is in the kit at all
 *
 * The kit ships `NavLinks` and `MegaMenu`, which is to say it ships the
 * thing that creates the need: the same header on every page, and a
 * keyboard going through all of it again after every navigation. Bypassing
 * a repeated block is WCAG 2.4.1, Level A, and the answer is four lines
 * nobody writes because nothing on screen is missing without them.
 *
 * ## The part that is usually broken
 *
 * `<a href="#main">` scrolls the page and, in most browsers, leaves focus
 * exactly where it was — on the link, still inside the header. The next
 * Tab goes to the second nav item and the link has done nothing at all,
 * while looking like it worked. So this moves focus itself: it gives the
 * target `tabindex="-1"` on the way, which makes it focusable by script
 * and never by Tab, and focuses it.
 *
 * `-1` is left on the target afterwards rather than cleaned up. Removing
 * it is the tidier-looking choice and the wrong one: a reader that moves
 * back out and in again would find an unfocusable target the second time.
 *
 * ## Hidden, not absent
 *
 * It is clipped to a pixel rather than `display: none` or
 * `visibility: hidden`, because both of those take it out of the tab order
 * as well — a skip link that cannot be focused is a skip link that does not
 * exist. It becomes visible on `:focus-visible`, which is what puts it on
 * screen for the keyboard that needs it and keeps it off screen for
 * everyone else.
 */
const { for: targetId, label } = defineProps<{
  /** The `id` of what to skip to, usually the page's `<main>`. Without the `#`. */
  for: string
  /** What it says, e.g. "İçeriğe geç". Already translated. */
  label: string
}>()

function skip(event: MouseEvent) {
  const target = document.getElementById(targetId)
  if (!target) return

  event.preventDefault()

  /* Focusable by script, never by Tab. Without it the browser scrolls and
     leaves focus in the header, which is the whole failure this exists to
     avoid. */
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')

  // `focus()` scrolls the target into view on its own, which is why there
  // is no `scrollIntoView` beside it.
  target.focus()
}
</script>

<template>
  <a :href="`#${$props.for}`" class="rk-skip" @click="skip">{{ label }}</a>
</template>

<style scoped>
/* Clipped rather than hidden: `display: none` and `visibility: hidden` both
   take it out of the tab order, and then it is a link nobody can reach. */
.rk-skip {
  position: absolute;
  z-index: 100;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip-path: inset(50%);
  white-space: nowrap;
}

.rk-skip:focus-visible {
  inset-block-start: 0.5rem;
  inset-inline-start: 0.5rem;
  overflow: visible;
  width: auto;
  height: auto;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-card);
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  background: var(--color-surface);
  box-shadow: var(--shadow-overlay);
  clip-path: none;
  color: var(--color-ink);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}
</style>
