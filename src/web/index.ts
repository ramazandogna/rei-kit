/**
 * rei-kit/web — the parts a wide site is made of.
 *
 * Separate from the main entry for the same reason `rei-kit/app` is: these
 * assume a page with a header, a mouse and room to spare. A phone app importing
 * the kit should not download them.
 *
 * Everything a wide site is normally built from is here whether or not a
 * consumer has reached for it yet. That is the rule in `AGENTS.md` — no waiting
 * for a second consumer and no counting of call sites — and 0.17.0 broke it by
 * shipping three of eight planned components on the grounds that the other five
 * had no users. A kit is a separate project: somebody installing it should not
 * have to hand-write a pagination control because the apps that happen to exist
 * today do not paginate.
 */
export { default as BaseAccordion } from './BaseAccordion.vue'
export type { AccordionItem } from './BaseAccordion.vue'

export { default as BaseBreadcrumb } from './BaseBreadcrumb.vue'
export type { Crumb } from './BaseBreadcrumb.vue'

/**
 * One accordion row on its own.
 *
 * For the common case where the list belongs to the app — staggered as it
 * scrolls in, interleaved with something else, or built from a source the
 * accordion cannot know about.
 */
export { default as BaseDisclosure } from './BaseDisclosure.vue'

/**
 * `BaseModal`, beside `BaseSheet` rather than named `Modal` on its own.
 *
 * The two are the pair this kit keeps insisting they are — a sheet from the
 * bottom edge, a modal from nowhere — and naming them alike is the cheapest way
 * to make somebody reaching for one notice the other exists.
 */
export { default as BaseModal } from './BaseModal.vue'

export { default as BasePagination } from './BasePagination.vue'

export { default as BaseTabs } from './BaseTabs.vue'
export type { TabPanel } from './BaseTabs.vue'

export { default as BaseTooltip } from './BaseTooltip.vue'

export { default as NavLinks } from './NavLinks.vue'
export type { NavLinkItem } from './NavLinks.vue'
