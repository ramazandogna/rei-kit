<script setup lang="ts">
import { computed } from 'vue'

/**
 * The kit's button, and — when asked — its link.
 *
 * `as` exists because a button and a link are the same shape and a different
 * element, and the app was resolving that by nesting them: a consumer had
 * `<RouterLink><BaseButton>` in every call to action, which is an `<a>` around
 * a `<button>`. That is invalid HTML, two stops in the tab order and two
 * controls to a screen reader, for one thing on the screen. Whether something
 * navigates is the app's decision; carrying it is this component's job.
 *
 * `router-link` is resolved by name rather than imported, so `vue-router` stays
 * the optional peer it is. Only an app that passes `as="router-link"` needs it,
 * and an app that passes it has it.
 */
const {
  as = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  icon = false,
  block = false,
  pill = false,
  to = undefined,
  href = undefined,
} = defineProps<{
  /** What to render. `button` unless this navigates. */
  as?: 'button' | 'a' | 'router-link' | undefined
  /**
   * `link` is a real action that should read as text — "clear this note",
   * "remove", "change category". It has no surface at all, so it also has no
   * height and no padding: giving it either would make it a ghost button,
   * which is a different thing and was already here.
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link' | undefined
  /** `xs` is the action inside a prompt or a nudge, not on a page. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | undefined
  loading?: boolean | undefined
  disabled?: boolean | undefined
  /** Ignored unless `as` is `button`. */
  type?: 'button' | 'submit' | undefined
  /**
   * Square, sized to its icon, with no label beside it.
   *
   * **Pass `aria-label`.** An icon on its own has no accessible name, and a
   * control a screen reader announces as "button" is not usable. Attributes
   * fall through, so `aria-label` lands where it should — nothing here can
   * check that you passed one, which is why it is said this loudly.
   */
  icon?: boolean | undefined
  /** Fills its container. The ordinary case under a form. */
  block?: boolean | undefined
  /** For `as="router-link"`. */
  to?: string | Record<string, unknown> | undefined
  /** For `as="a"`. */
  href?: string | undefined
  /**
   * Fully rounded rather than card-cornered.
   *
   * Every install prompt, update prompt and nudge across the apps used the
   * same pair — a filled pill to act and a quiet one to dismiss — and none of
   * them could use this component, because it only knew one corner radius.
   */
  pill?: boolean | undefined
}>()

const VARIANT_CLASS = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  /*
   * An action that is real but not the one being urged.
   *
   * `ghost` had been standing in for this and cannot: with no border and no
   * fill it reads as text, so "Save draft" sitting next to "Publish" looked
   * like a caption rather than the other half of a choice. Ghost is for a
   * control that should recede until it is wanted — a toolbar, a menu row —
   * and that is a different job.
   */
  secondary: 'border-hair bg-surface text-ink border hover:bg-muted',
  ghost: 'bg-transparent text-ink hover:bg-muted',
  danger: 'bg-negative text-white hover:bg-negative/90',
  /* No fill, no border, no box: underlined so it is still obviously a control
     without one. `ghost` cannot stand in — it has a hover surface and a
     radius, so it reads as a button that happens to be empty. */
  link: 'bg-transparent underline underline-offset-2 hover:opacity-80',
} as const

/* Two scales, because a square control cannot take horizontal padding and
   still be square. `lg` is here for a wide page's call to action: a 44px
   button is right under a thumb and undersized under a headline. */
const SIZE_CLASS = {
  xs: 'h-8 px-3 text-xs',
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-14 px-6 text-lg',
} as const

const ICON_SIZE_CLASS = {
  xs: 'size-8 text-xs',
  sm: 'size-9 text-sm',
  md: 'size-11 text-base',
  lg: 'size-14 text-lg',
} as const

/* A link takes the type size and nothing else. Height and padding are what
   make a surface, and this variant is the one without one. */
const LINK_SIZE_CLASS = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const

const sizing = computed(() => {
  if (variant === 'link') return LINK_SIZE_CLASS[size]
  return icon ? ICON_SIZE_CLASS[size] : SIZE_CLASS[size]
})

/** Anything that is not a `<button>` cannot be `disabled`; it has to be told. */
const inactive = computed(() => disabled || loading)

const linkProps = computed(() => {
  if (as === 'router-link') return { to }
  // The href is dropped rather than kept alongside aria-disabled: an anchor
  // without one is not focusable and not activatable, which is the whole of
  // what "disabled" means for a link.
  if (as === 'a') return inactive.value ? {} : { href }
  return {}
})
</script>

<template>
  <component
    :is="as"
    v-bind="linkProps"
    :type="as === 'button' ? type : undefined"
    :disabled="as === 'button' ? inactive : undefined"
    :aria-disabled="as !== 'button' && inactive ? 'true' : undefined"
    :aria-busy="loading"
    class="focus-visible:outline-primary inline-flex items-center justify-center gap-2 font-medium transition-transform duration-100 select-none focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
    :class="[
      VARIANT_CLASS[variant],
      sizing,
      variant === 'link' ? 'rounded-xs' : pill ? 'rounded-full' : 'rounded-card',
      block ? 'w-full' : '',
    ]"
  >
    <span
      v-if="loading"
      class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>
