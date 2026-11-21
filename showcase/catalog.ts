import catalogue from './props.generated.json'

/**
 * The catalogue, as the site's routes read it: one list in one order, with the
 * category each part belongs to.
 *
 * Category is the only fact the source does not carry, so it lives here and
 * nowhere else. The command palette, the catalog page, the breadcrumb and the
 * prev/next links all read it from this file.
 */
export interface Entry {
  name: string
  entry: string
  summary: string
  category: string
  props: (typeof catalogue)[number]['props']
  slots: { name: string; payload: string; description: string }[]
  emits: { name: string; payload: string; description: string }[]
}

const GROUPS: [category: string, names: string[]][] = [
  ['Actions', ['BaseButton', 'GoogleButton', 'CopyButton', 'BaseLink']],
  [
    'Text inputs',
    [
      'BaseInput',
      'PasswordInput',
      'BaseTextarea',
      'FormField',
      'ErrorSummary',
      'NumberInput',
      'PinInput',
      'TagsInput',
      'ColorPicker',
      'FileDrop',
    ],
  ],
  [
    'Choice controls',
    [
      'BaseCheckbox',
      'BaseCheckboxGroup',
      'BaseSwitch',
      'BaseRadioGroup',
      'SegmentedControl',
      'ToggleGroup',
      'BaseSlider',
      'SliderField',
    ],
  ],
  ['Selection', ['BaseSelect', 'BaseCombobox', 'BaseListbox']],
  ['Dates and times', ['BaseCalendar', 'BaseDatePicker', 'TimePicker']],
  [
    'Status and display',
    [
      'BaseAlert',
      'BaseBadge',
      'BaseChip',
      'BaseAvatar',
      'AvatarStack',
      'BaseKbd',
      'BaseSeparator',
      'BaseSkeleton',
      'SkeletonList',
      'BaseSpinner',
      'ToneDot',
      'EmptyState',
      'ProgressBar',
      'CircularProgress',
      'BaseRating',
      'BaseTimeline',
      'DescriptionList',
      'StatCard',
      'SectionHeading',
      'CodeBlock',
    ],
  ],
  [
    'Layout and surfaces',
    [
      'BaseCard',
      'PageContainer',
      'PageHeader',
      'SettingsGroup',
      'SettingsRow',
      'PriceCard',
      'PricingCard',
      'ScrollArea',
      'VirtualList',
      'BentoGrid',
      'BentoCell',
    ],
  ],
  [
    'Data and charts',
    ['BaseTable', 'DataTable', 'ActivityGrid', 'BarChart', 'DonutChart', 'LineChart', 'Sparkline'],
  ],
  ['Feedback', ['ToastHost', 'AnnounceHost', 'ErrorBoundary']],
  [
    'Navigation',
    [
      'TabBar',
      'LocaleLinks',
      'BaseStepper',
      'BaseTabs',
      'BaseBreadcrumb',
      'BasePagination',
      'NavLinks',
      'MegaMenu',
      'SkipLink',
      'Dock',
    ],
  ],
  [
    'Overlays',
    [
      'BaseMenu',
      'BaseSheet',
      'BasePopover',
      'BasePopconfirm',
      'BaseModal',
      'BaseDrawer',
      'BaseTooltip',
      'BaseHoverCard',
      'BaseContextMenu',
      'ResponsiveDialog',
    ],
  ],
  ['Disclosure and tables', ['BaseAccordion', 'BaseDisclosure', 'BaseSplitter']],
  ['Desk and editing', ['BaseToolbar', 'BaseTree', 'TransferList', 'CommandMenu']],
  [
    'App shell',
    ['AuthForm', 'AuthShell', 'FabButton', 'LocaleSheet', 'OfflineBanner', 'TabShell', 'TourShell'],
  ],
  ['Motion', ['BaseMarquee', 'BaseReveal', 'CountUp', 'NumberTicker', 'TextRotate', 'TypeWriter']],
  ['Effects', ['HeroBackdrop', 'SpotlightCard', 'BorderBeam', 'AnimatedBeam', 'TiltCard']],
  ['Chat', ['ChatMessage', 'ChatThread', 'PromptInput']],
  ['Install', ['InstallPrompt', 'InstallSettings', 'UpdatePrompt']],
]

export const CATEGORIES = GROUPS.map(([name]) => name)

const byName = new Map(catalogue.map((c) => [c.name, c]))

/** Every component, in catalog order (category, then the order above). */
export const ENTRIES: Entry[] = GROUPS.flatMap(([category, names]) =>
  names.flatMap((name) => {
    const c = byName.get(name)
    return c ? [{ ...c, category } as Entry] : []
  }),
)

/* Anything the groups above forgot still shows up, under "More", so a new
   component is never invisible just because nobody filed it. */
const filed = new Set(ENTRIES.map((e) => e.name))
for (const c of catalogue) {
  if (!filed.has(c.name)) ENTRIES.push({ ...c, category: 'More' } as Entry)
}

export const entryByName = (name: string) => ENTRIES.find((e) => e.name === name)

/** Summaries are authored for an editor, where a backtick is code. */
export const plain = (text: string) => text.replaceAll('`', '')

export const ENTRY_LABEL: Record<string, string> = {
  'rei-kit': 'rei-kit',
  'rei-kit/web': '/web',
  'rei-kit/app': '/app',
  'rei-kit/motion': '/motion',
  'rei-kit/pwa': '/pwa',
}

export { REPO } from './site'

export function sourcePath(entry: Entry): string {
  const dir = entry.entry === 'rei-kit' ? 'components' : entry.entry.replace('rei-kit/', '')
  return `src/${dir}/${entry.name}.vue`
}
