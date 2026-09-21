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
/**
 * `BaseContextMenu`, the right-click menu — which is also Shift+F10 and the
 * Menu key, or it is a set of actions a keyboard cannot reach at all.
 */
export { default as BaseContextMenu } from './BaseContextMenu.vue'
export { default as BaseDisclosure } from './BaseDisclosure.vue'
/**
 * `BaseHoverCard`, for when the answer is a thing rather than a sentence —
 * which is where `aria-describedby`, and so `BaseTooltip`, stops working.
 */
export { default as BaseHoverCard } from './BaseHoverCard.vue'
/**
 * `BaseDrawer`, the wide screen's answer to `BaseSheet`: a panel from the
 * edge, for what a site keeps beside the page rather than on top of it.
 */
export { default as BaseDrawer } from './BaseDrawer.vue'

/**
 * `BaseModal`, beside `BaseSheet` rather than named `Modal` on its own.
 *
 * The two are the pair this kit keeps insisting they are — a sheet from the
 * bottom edge, a modal from nowhere — and naming them alike is the cheapest way
 * to make somebody reaching for one notice the other exists.
 */
export { default as BaseModal } from './BaseModal.vue'

export { default as BasePagination } from './BasePagination.vue'

/**
 * Everything the app can do, behind ⌘K. In the wide entry because it is a
 * keyboard shortcut first: a phone has no ⌘, and an app that is only ever a
 * phone should not download it.
 */
export { default as CommandMenu } from './CommandMenu.vue'
export type { CommandGroup, CommandItem } from './CommandMenu.vue'

/**
 * `BaseTable` with a sort, a selection and a loading state. Wide because a
 * table of nine columns is not a thing a phone shows; a phone shows a list.
 */
export { default as DataTable } from './DataTable.vue'
export type { DataColumn, TableSort } from './DataTable.vue'

/**
 * Two panes and a handle, a tree, a toolbar and a transfer list: the shapes
 * a desk-sized screen is arranged with, and that a phone never shows.
 */
export { default as BaseSplitter } from './BaseSplitter.vue'

export { default as BaseToolbar } from './BaseToolbar.vue'

export { default as BaseTree } from './BaseTree.vue'
export type { TreeNode } from './BaseTree.vue'

export { default as TransferList } from './TransferList.vue'

/**
 * One question, asked the way the screen expects: a modal on a wide screen,
 * a sheet on a phone. In the wide entry because it needs both, and a phone
 * app that only ever shows the sheet should reach for `BaseSheet` itself.
 */
export { default as ResponsiveDialog } from './ResponsiveDialog.vue'

export { default as BaseTabs } from './BaseTabs.vue'
export type { TabPanel } from './BaseTabs.vue'

export { default as BaseTooltip } from './BaseTooltip.vue'

export { default as MegaMenu } from './MegaMenu.vue'
export type { MegaMenuColumn, MegaMenuItem, MegaMenuLink } from './MegaMenu.vue'

export { default as NavLinks } from './NavLinks.vue'
export type { NavLinkItem } from './NavLinks.vue'
