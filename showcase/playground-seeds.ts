/**
 * The two things the catalogue cannot say about a playground.
 *
 * Which components can be driven by their props alone is derived, not listed:
 * a component qualifies when every required prop has a control, so one that
 * needs a `Column<Row>[]` drops out on its own and one that grows a variant
 * gains a button for it. What is left are two judgements a type cannot make.
 */

/**
 * Components that qualify on their types and still cannot be played with
 * inline, with the reason each is out. A playground that renders an empty box
 * is worse than no playground: it reads as a broken component.
 */
export const NOT_PLAYABLE: Record<string, string> = {
  BaseModal: 'takes over the page',
  BaseDrawer: 'takes over the page',
  BaseSheet: 'takes over the page',
  ResponsiveDialog: 'takes over the page',
  BaseContextMenu: 'needs a right-click target',
  CommandMenu: 'is a dialog opened by a shortcut, over the whole page',
  LocaleSheet: 'is a sheet over the page',
  TourShell: 'takes over the page',
  BaseMenu: 'is a panel anchored to a trigger you provide',
  BasePopover: 'is a panel anchored to a trigger you provide',
  BaseHoverCard: 'is a panel anchored to a trigger you provide',
  BasePopconfirm: 'is a panel anchored to a trigger you provide',
  BaseTooltip: 'is a bubble anchored to a trigger you provide',
  BaseToolbar: 'wraps controls you provide',
  BaseSplitter: 'sizes two panes you provide',
  ScrollArea: 'needs content taller than itself',
  PageContainer: 'is a page-width wrapper',
  SettingsGroup: 'holds rows you provide',
  ToastHost: 'renders nothing until a toast is raised',
  AnnounceHost: 'is a live region with nothing to see',
  AuthShell: 'is a whole sign-in screen',
  TabShell: 'is a whole phone shell',
  ErrorBoundary: 'shows its fallback only when a child throws',
  SkipLink: 'is invisible until it has focus',
  OfflineBanner: 'appears only when the browser goes offline',
  InstallPrompt: 'appears only when the browser offers an install',
  InstallSettings: 'reflects a real install state',
  UpdatePrompt: 'appears only when a service worker has an update',
}

/** Components that render nothing without a default slot, and what to put in it. */
export const SLOT_TEXT: Record<string, string> = {
  BaseAlert: 'Your changes have been saved.',
  BaseButton: 'Save changes',
  BaseBadge: 'Beta',
  BaseCard: 'Anything can go in a card.',
  BaseChip: 'Design',
  BaseAccordion: 'The panel this opens.',
  BaseTabs: 'What this tab holds.',
  BaseDisclosure: 'The panel this opens.',
  BaseLink: 'Read the guide',
  BaseMarquee: 'One long line that scrolls past.',
  BaseReveal: 'Content that arrives when it is scrolled to.',
  EmptyState: 'Nothing here yet.',
  PageHeader: 'What this page is about.',
}
