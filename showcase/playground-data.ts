/**
 * Data for the props no knob can offer.
 *
 * A control can be derived for a string, a number, a boolean or a union of
 * literals. It cannot be derived for `readonly Column<Row>[]` — and that is
 * the prop `BaseTable`, `BaseSelect`, `SegmentedControl`, `TabBar`, both
 * charts and thirty others require. Until this file existed those thirty-odd
 * components had no playground at all: the one page where somebody decides
 * whether to install this showed them a code sample and a table of types,
 * and the two parts of the kit a reader reaches for first — a select and a
 * table — were among the ones they could not touch.
 *
 * So the shapes are written out once, here, taken from each component's own
 * `showcase/examples/<Name>.vue` so the playground and the sample agree. They
 * are seeds, not knobs: the prop keeps its row in the table, the component
 * renders, and every scalar prop beside it becomes something to turn.
 *
 * `playground.spec.ts` fails on a seed for a prop a component does not have,
 * and on a component that is neither playable nor listed in `NOT_PLAYABLE`
 * with a reason — so this cannot quietly fall behind the package.
 */

const LEVELS = ['bg-muted', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary']

/* A year of days without importing the kit's date helpers into a data file:
   the grid only needs the keys to be real and in order. */
function lastYear(): string[] {
  const days: string[] = []
  const today = new Date(2026, 8, 30)

  for (let back = 364; back >= 0; back -= 1) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back)
    days.push(
      `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`,
    )
  }

  return days
}

const busyness = (key: string) => (key.charCodeAt(9) + key.charCodeAt(8)) % 5

export const PLAYGROUND_DATA: Record<string, Record<string, unknown>> = {
  ActivityGrid: {
    days: lastYear(),
    levelFor: (key: string) => LEVELS[busyness(key)]!,
    dayLabel: (key: string) => `${key}: ${busyness(key)} entries`,
  },
  AuthForm: {
    labels: {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      submit: 'Create account',
      google: 'Continue with Google',
      or: 'or',
      rememberMe: 'Remember me',
    },
  },
  AvatarStack: {
    people: [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }, { name: 'Alan Turing' }],
  },
  BarChart: {
    series: [
      { key: 'rei', label: 'rei-kit', value: 31.1 },
      { key: 'element', label: 'element-plus', value: 104.1 },
      { key: 'naive', label: 'naive-ui', value: 132.4 },
    ],
    valueLabel: (kb: number) => `${kb.toFixed(1)} KB`,
  },
  BaseAccordion: {
    items: [
      { key: 'price', title: 'How much does it cost?' },
      { key: 'export', title: 'Can I export my data?' },
    ],
  },
  BaseBreadcrumb: {
    items: [
      { key: 'home', to: '/', label: 'Home' },
      { key: 'reports', to: '/reports', label: 'Reports' },
      { key: 'week', label: 'This week' },
    ],
  },
  BaseCheckboxGroup: {
    options: [
      { value: 'mon', label: 'Monday' },
      { value: 'tue', label: 'Tuesday' },
      { value: 'wed', label: 'Wednesday' },
      { value: 'fri', label: 'Friday', hint: 'Busiest day' },
    ],
  },
  BaseCombobox: {
    options: [
      { value: 'tr', label: 'Türkiye' },
      { value: 'jp', label: 'Japan' },
      { value: 'de', label: 'Germany' },
    ],
  },
  BaseKbd: { keys: ['⌘', 'K'] },
  BaseListbox: {
    options: [
      { value: 'week', label: 'This week' },
      { value: 'month', label: 'This month' },
      { value: 'year', label: 'This year' },
    ],
  },
  BaseRadioGroup: {
    options: [
      { value: 'card', label: 'Card' },
      { value: 'transfer', label: 'Bank transfer' },
      { value: 'cash', label: 'Cash' },
    ],
  },
  BaseRating: { valueLabel: (value: number, max: number) => `${value} of ${max}` },
  BaseSelect: {
    options: [
      { value: 'tr', label: 'Türkiye' },
      { value: 'jp', label: 'Japan' },
      { value: 'de', label: 'Germany' },
    ],
  },
  BaseStepper: {
    steps: [
      { key: 'account', label: 'Account' },
      { key: 'plan', label: 'Plan' },
      { key: 'payment', label: 'Payment' },
    ],
  },
  BaseTable: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'amount', label: 'Amount', align: 'end' },
    ],
    rows: [
      { id: 1, date: '12 Sep', amount: '₺320' },
      { id: 2, date: '14 Sep', amount: '₺1,250' },
    ],
  },
  BaseTabs: {
    items: [
      { key: 'week', label: 'Week' },
      { key: 'month', label: 'Month' },
    ],
  },
  BaseTimeline: {
    events: [
      { key: 'n3', time: '12 September', body: 'Walked the long way home.' },
      { key: 'n2', time: '11 September', body: 'Rested. No guilt.' },
    ],
  },
  BaseTree: {
    nodes: [
      {
        key: 'src',
        label: 'src',
        children: [
          { key: 'index', label: 'index.ts' },
          {
            key: 'components',
            label: 'components',
            children: [{ key: 'button', label: 'Button.vue' }],
          },
        ],
      },
      { key: 'readme', label: 'README.md' },
    ],
  },
  DataTable: {
    columns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'amount', label: 'Amount', align: 'end', sortable: true },
    ],
    rows: [
      { id: 'a', name: 'Ada Lovelace', amount: '₺4,200' },
      { id: 'b', name: 'Ömer Seyfettin', amount: '₺120' },
    ],
  },
  DescriptionList: {
    items: [
      { term: 'Status', description: 'Paid' },
      { term: 'Created', description: '12 September 2026' },
      { term: 'Total', description: '₺1,240' },
    ],
  },
  DonutChart: {
    slices: [
      { key: 'components', label: 'Component styles', value: 19.8 },
      { key: 'tokens', label: 'Tokens', value: 4.6 },
      { key: 'palettes', label: 'Palettes', value: 2.2 },
    ],
    valueLabel: (kb: number) => `${kb.toFixed(1)} KB`,
    fill: (_item: unknown, index: number) =>
      ['text-primary', 'text-accent', 'text-positive'][index % 3]!,
  },
  ErrorSummary: {
    errors: { email: 'Enter an email address.', password: 'At least 8 characters.' },
    labelFor: (field: string) => (field === 'email' ? 'Email' : 'Password'),
  },
  LocaleLinks: { locales: ['en', 'tr'], labels: { en: 'English', tr: 'Türkçe' } },
  MegaMenu: {
    items: [
      {
        key: 'products',
        label: 'Products',
        columns: [
          {
            key: 'apps',
            title: 'Apps',
            links: [
              { key: 'journal', to: '/journal', label: 'Journal', description: 'A day at a time' },
              { key: 'ledger', to: '/ledger', label: 'Ledger', description: 'Where it went' },
            ],
          },
        ],
      },
      { key: 'pricing', to: '/pricing', label: 'Pricing' },
    ],
  },
  NavLinks: {
    items: [
      { key: 'home', to: '/', label: 'Home' },
      { key: 'reports', to: '/reports', label: 'Reports' },
    ],
  },
  PinInput: {
    cellLabel: (position: number, total: number) => `Digit ${position} of ${total}`,
  },
  PriceCard: { features: ['Unlimited entries', 'Export', 'Sync'] },
  SectionHeading: {
    /* The words are `text-ink`, not `text-positive`: a role on a wash of
       itself measured 2.01:1 here, painted, which is the fault the kit
       documents and five of its components were fixed for. The role carries
       the dot and the edge. */
    tone: { fill: 'bg-positive', card: 'bg-positive/5 border-positive/25', text: 'text-ink' },
  },
  SegmentedControl: {
    options: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
    ],
  },
  TabBar: {
    items: [
      { key: 'home', to: '/', label: 'Home' },
      { key: 'stats', to: '/stats', label: 'Stats' },
      { key: 'settings', to: '/settings', label: 'Settings' },
    ],
  },
  TagsInput: { removeLabel: (tag: string) => `Remove ${tag}` },
  TextRotate: { words: ['typed', 'measured', 'shipped'] },
  ToggleGroup: {
    options: [
      { value: 'bold', label: 'Bold' },
      { value: 'italic', label: 'Italic' },
      { value: 'underline', label: 'Underline' },
    ],
  },
  TransferList: {
    options: [
      { value: 'a', label: 'Ada Lovelace' },
      { value: 'b', label: 'Grace Hopper' },
      { value: 'c', label: 'Alan Turing' },
    ],
  },
  TypeWriter: { text: 'Typed one character at a time.' },
  VirtualList: {
    items: Array.from({ length: 2000 }, (_, index) => ({ id: index, label: `Row ${index + 1}` })),
  },
}
