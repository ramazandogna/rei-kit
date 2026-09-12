/**
 * rei-kit/web — the parts a wide site is made of.
 *
 * Separate from the main entry for the same reason `rei-kit/app` is: these
 * assume a page with a header, a mouse and room to spare. A phone app importing
 * the kit should not download them.
 *
 * Smaller than it was meant to be, and deliberately. The plan for this release
 * listed eight components; four of them had no user anywhere — `Pagination` was
 * not written once in any consumer, and `Tabs` and `Breadcrumb` appear only in
 * prose. A kit that ships a component nobody reached for is a kit guessing at
 * a shape, and `BaseRadioGroup` is already one standing reminder of that.
 *
 * `Tooltip` is missing for a better reason: the one consumer's tooltip is
 * CSS-only on purpose, because a tooltip that needs JavaScript to appear does
 * not appear in a prerendered page. Shipping a JavaScript one would have been
 * shipping the wrong answer in a nicer package.
 */
export { default as BaseAccordion } from './BaseAccordion.vue'
export type { AccordionItem } from './BaseAccordion.vue'

/**
 * `BaseModal`, beside `BaseSheet` rather than named `Modal` on its own.
 *
 * The two are the pair this kit keeps insisting they are — a sheet from the
 * bottom edge, a modal from nowhere — and naming them alike is the cheapest way
 * to make somebody reaching for one notice the other exists.
 */
export { default as BaseModal } from './BaseModal.vue'

export { default as NavLinks } from './NavLinks.vue'
export type { NavLinkItem } from './NavLinks.vue'
