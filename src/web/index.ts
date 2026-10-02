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
 *
 * @example
 * ```vue
 * <BaseAccordion :items="faq">
 *   <template #default="{ item }">
 *     <p v-if="item.key === 'price'">Free while in beta.</p>
 *     <p v-else>Yes, from the settings page.</p>
 *   </template>
 * </BaseAccordion>
 * ```
 *
 * @see {@link BaseDisclosure}, {@link BaseTree} — the near-neighbours this is mistaken for
 */
export { default as BaseAccordion } from './BaseAccordion.vue'
export type { AccordionItem } from './BaseAccordion.vue'

/**
 * Where this page sits, and the way back up.
 *
 * @example
 * ```vue
 * <BaseBreadcrumb
 *   :items="[{ label: 'Docs', to: '/docs' }, { label: 'Install' }]"
 *   label="Breadcrumb"
 * />
 * ```
 */
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
 *
 * @example
 * ```vue
 * <BaseContextMenu label="Row actions">
 *   <template #default="{ props }">
 *     <!-- A button, because `aria-expanded` belongs to a role that takes
 *          it. A div with `tabindex` is reachable, not announced. -->
 *     <button
 *       type="button"
 *       class="border-hair rounded-card focus-ring w-full border border-dashed p-6 text-sm"
 *       v-bind="props"
 *     >
 *       Right-click this area — or focus it and press Shift+F10.
 *     </button>
 *   </template>
 *
 *   <template #items="{ close }">
 *     <button type="button" role="menuitem" @click="(toast.success('Renamed'), close())">
 *       Rename
 *     </button>
 *     <button type="button" role="menuitem" @click="(toast.info('Duplicated'), close())">
 *       Duplicate
 *     </button>
 *     <hr />
 *     <button type="button" role="menuitem" @click="(toast.danger('Deleted'), close())">
 *       Delete
 *     </button>
 *   </template>
 * </BaseContextMenu>
 * ```
 */
export { default as BaseContextMenu } from './BaseContextMenu.vue'
/**
 * One section that opens and closes.
 *
 * @example
 * ```vue
 * <BaseDisclosure v-model="open" title="Show details">
 *   Everything that did not fit in the summary.
 * </BaseDisclosure>
 * ```
 *
 * @see {@link BaseAccordion} — the near-neighbour this is mistaken for
 */
export { default as BaseDisclosure } from './BaseDisclosure.vue'
/**
 * `BaseHoverCard`, for when the answer is a thing rather than a sentence —
 * which is where `aria-describedby`, and so `BaseTooltip`, stops working.
 *
 * @example
 * ```vue
 * <BaseHoverCard label="About Ramazan">
 *   <template #default="{ props }">
 *     <BaseButton variant="link" v-bind="props">@ramazandogna</BaseButton>
 *   </template>
 *
 *   <template #card>
 *     <div class="flex gap-3">
 *       <BaseAvatar label="Ramazan Dogan" />
 *       <div>
 *         <p class="text-ink text-sm font-medium">Ramazan Dogan</p>
 *         <p class="text-ink-soft mt-1 text-xs leading-relaxed">
 *           Builds rei-kit and three apps on it.
 *         </p>
 *       </div>
 *     </div>
 *   </template>
 * </BaseHoverCard>
 * ```
 *
 * @see {@link BaseTooltip} — the near-neighbour this is mistaken for
 */
export { default as BaseHoverCard } from './BaseHoverCard.vue'
/**
 * `BaseDrawer`, the wide screen's answer to `BaseSheet`: a panel from the
 * edge, for what a site keeps beside the page rather than on top of it.
 *
 * @example
 * ```vue
 * <BaseButton variant="secondary" @click="open = true">Filters</BaseButton>
 *
 * <BaseDrawer v-model="open" title="Filters" close-label="Close" side="end" size="24rem">
 *   <div class="flex flex-col gap-3">
 *     <BaseCheckbox v-model="unpaid" label="Only unpaid" />
 *     <BaseCheckbox v-model="thisMonth" label="This month" />
 *   </div>
 *
 *   <template #actions>
 *     <BaseButton variant="ghost" @click="open = false">Clear</BaseButton>
 *     <BaseButton @click="open = false">Apply</BaseButton>
 *   </template>
 * </BaseDrawer>
 * ```
 *
 * @see {@link BaseModal}, {@link BaseSheet} — the near-neighbours this is mistaken for
 */
export { default as BaseDrawer } from './BaseDrawer.vue'

/**
 * `BaseModal`, beside `BaseSheet` rather than named `Modal` on its own.
 *
 * The two are the pair this kit keeps insisting they are — a sheet from the
 * bottom edge, a modal from nowhere — and naming them alike is the cheapest way
 * to make somebody reaching for one notice the other exists.
 *
 * @example
 * ```vue
 * <BaseButton @click="open = true">Delete account</BaseButton>
 *
 * <BaseModal v-model="open" title="Delete account?" close-label="Close" tone="alert">
 *   This cannot be undone.
 *
 *   <template #actions>
 *     <BaseButton variant="secondary" @click="open = false">Cancel</BaseButton>
 *     <BaseButton variant="danger">Delete</BaseButton>
 *   </template>
 * </BaseModal>
 * ```
 *
 * @see {@link BaseDrawer}, {@link BaseMenu}, {@link BasePopover}, {@link BaseSheet} — the near-neighbours this is mistaken for
 */
export { default as BaseModal } from './BaseModal.vue'

/**
 * Moving between pages of a list.
 *
 * @example
 * ```vue
 * <BasePagination
 *   :page="page"
 *   :pages="12"
 *   previous-label="Previous"
 *   next-label="Next"
 *   label="Pages"
 *   @change="page = $event"
 * />
 * ```
 */
export { default as BasePagination } from './BasePagination.vue'

/**
 * Everything the app can do, behind ⌘K. In the wide entry because it is a
 * keyboard shortcut first: a phone has no ⌘, and an app that is only ever a
 * phone should not download it.
 *
 * @example
 * ```vue
 * <BaseButton variant="secondary" @click="open = true">Commands (⌘K)</BaseButton>
 *
 * <CommandMenu
 *   v-model="open"
 *   :groups="groups"
 *   label="Commands"
 *   placeholder="Type a command or search"
 *   empty-label="Nothing found"
 *   hotkey="k"
 *   @select="run"
 * />
 * ```
 *
 * @see {@link BaseMenu} — the near-neighbour this is mistaken for
 */
export { default as CommandMenu } from './CommandMenu.vue'
export type { CommandGroup, CommandItem } from './CommandMenu.vue'

/**
 * `BaseTable` with a sort, a selection and a loading state. Wide because a
 * table of nine columns is not a thing a phone shows; a phone shows a list.
 *
 * @example
 * ```vue
 * <DataTable
 *   v-model:sort="sort"
 *   v-model:selected="selected"
 *   :columns="columns"
 *   :rows="rows"
 *   caption="Payments"
 *   row-key="id"
 *   select-all-label="Select every payment"
 *   :row-label="(row) => `Select ${row.name}`"
 * >
 *   <template #amount="{ value }">{{ value }} ₺</template>
 * </DataTable>
 * ```
 *
 * @see {@link BaseTable} — the near-neighbour this is mistaken for
 */
export { default as DataTable } from './DataTable.vue'
export type { DataColumn, TableSort } from './DataTable.vue'

/**
 * Two panes and a handle, a tree, a toolbar and a transfer list: the shapes
 * a desk-sized screen is arranged with, and that a phone never shows.
 *
 * @example
 * ```vue
 * <BaseSplitter v-model="split" label="Resize the list" class="h-72">
 *   <template #start><nav class="p-3">The list</nav></template>
 *   <template #end><article class="p-3">What is selected</article></template>
 * </BaseSplitter>
 * ```
 */
export { default as BaseSplitter } from './BaseSplitter.vue'

/**
 * A row of controls that belong together: a formatting bar, a row of view
 * switches, the actions over a table.
 *
 * @example
 * ```vue
 * <BaseToolbar label="Formatting">
 *   <BaseButton icon variant="ghost" aria-label="Bold"><Bold class="size-4" /></BaseButton>
 *   <BaseButton icon variant="ghost" aria-label="Italic"><Italic class="size-4" /></BaseButton>
 *   <BaseSeparator orientation="vertical" spacing="sm" />
 *   <BaseButton icon variant="ghost" aria-label="Underline"
 *     ><Underline class="size-4"
 *   /></BaseButton>
 * </BaseToolbar>
 * ```
 */
export { default as BaseToolbar } from './BaseToolbar.vue'

/**
 * A tree of things that contain things: folders, a category list, a table
 * of contents.
 *
 * @example
 * ```vue
 * <BaseTree v-model="chosen" v-model:expanded="open" :nodes="nodes" label="Files" />
 * ```
 *
 * @see {@link BaseAccordion} — the near-neighbour this is mistaken for
 */
export { default as BaseTree } from './BaseTree.vue'
export type { TreeNode } from './BaseTree.vue'

/**
 * Two lists and the way between them: what is available, what is chosen.
 *
 * @example
 * ```vue
 * <TransferList
 *   v-model="granted"
 *   :options="permissions"
 *   available-label="Available"
 *   chosen-label="Granted"
 *   add-label="Grant the chosen permissions"
 *   remove-label="Take back the chosen permissions"
 * />
 * ```
 *
 * @see {@link BaseCombobox}, {@link BaseListbox}, {@link TagsInput} — the near-neighbours this is mistaken for
 */
export { default as TransferList } from './TransferList.vue'

/**
 * One question, asked the way the screen expects: a modal on a wide screen,
 * a sheet on a phone. In the wide entry because it needs both, and a phone
 * app that only ever shows the sheet should reach for `BaseSheet` itself.
 *
 * @example
 * ```vue
 * <BaseButton variant="danger" @click="open = true">Delete account</BaseButton>
 *
 * <ResponsiveDialog v-model="open" title="Delete this account?" close-label="Close" tone="alert">
 *   Everything in it goes with it. This cannot be undone.
 *
 *   <template #actions>
 *     <BaseButton variant="secondary" @click="open = false">Keep it</BaseButton>
 *     <BaseButton variant="danger">Delete</BaseButton>
 *   </template>
 * </ResponsiveDialog>
 * ```
 *
 * @see {@link BasePopconfirm} — the near-neighbour this is mistaken for
 */
export { default as ResponsiveDialog } from './ResponsiveDialog.vue'

/**
 * Sections of one page, one visible at a time.
 *
 * @example
 * ```vue
 * <BaseTabs v-model="tab" :items="tabs" label="Report">
 *   <template #default="{ active }">
 *     <p v-if="active === 'week'">This week…</p>
 *     <p v-else>This month…</p>
 *   </template>
 * </BaseTabs>
 * ```
 *
 * @see {@link NavLinks}, {@link TabBar} — the near-neighbours this is mistaken for
 */
export { default as BaseTabs } from './BaseTabs.vue'
export type { TabPanel } from './BaseTabs.vue'

/**
 * A short label that appears beside a control.
 *
 * @example
 * ```vue
 * <BaseTooltip label="Copy link">
 *   <BaseButton icon variant="ghost" aria-label="Copy link">⧉</BaseButton>
 * </BaseTooltip>
 *
 * <!--
 *   `follow` tracks the pointer, for a target big enough that a bubble pinned
 *   to the middle would be nowhere near what is under the cursor. It falls
 *   back to the anchored bubble for a keyboard and for anyone who asked their
 *   system for less motion.
 * -->
 * <BaseTooltip label="Tuesday, 12 September — 3 entries" follow>
 *   <div class="bg-muted rounded-card grid h-24 w-full place-items-center">A calendar cell</div>
 * </BaseTooltip>
 * ```
 *
 * @see {@link BaseHoverCard} — the near-neighbour this is mistaken for
 */
export { default as BaseTooltip } from './BaseTooltip.vue'

/**
 * A wide site's navigation, where a section has more in it than a row can
 * hold: columns of links under a heading, opened from the bar.
 *
 * @example
 * ```vue
 * <MegaMenu :items="items" active="pricing" label="Main navigation">
 *   <!-- A slot named for a top-level item adds to that panel. -->
 *   <template #products>
 *     <p class="text-ink-soft mt-4 text-xs">Everything is free while it is in beta.</p>
 *   </template>
 * </MegaMenu>
 * ```
 *
 * @see {@link BaseMenu}, {@link NavLinks} — the near-neighbours this is mistaken for
 */
export { default as MegaMenu } from './MegaMenu.vue'
export type { MegaMenuColumn, MegaMenuItem, MegaMenuLink } from './MegaMenu.vue'

/**
 * The primary navigation of a wide site.
 *
 * @example
 * ```vue
 * <NavLinks :items="links" :active="active" label="Main" />
 * ```
 *
 * @see {@link BaseMenu}, {@link BaseTabs}, {@link MegaMenu}, {@link TabBar} — the near-neighbours this is mistaken for
 */
export { default as NavLinks } from './NavLinks.vue'
export type { NavLinkItem } from './NavLinks.vue'

/**
 * `SkipLink`, the first thing in the tab order. The kit ships the header
 * that creates the need for it — bypassing a repeated block is WCAG 2.4.1,
 * Level A — and it moves focus itself rather than trusting the fragment.
 *
 * @example
 * ```vue
 * <!-- First in the tab order, and invisible until it has focus. Press Tab. -->
 * <div>
 *   <SkipLink for="example-main" label="Skip to content" />
 *
 *   <nav class="mb-3 flex gap-3" aria-label="Sections">
 *     <a href="#a" class="text-ink-soft text-sm">Products</a>
 *     <a href="#b" class="text-ink-soft text-sm">Pricing</a>
 *     <a href="#c" class="text-ink-soft text-sm">Docs</a>
 *   </nav>
 *
 *   <main id="example-main" class="text-ink text-sm">The content the link skips to.</main>
 * </div>
 * ```
 */
export { default as SkipLink } from './SkipLink.vue'
