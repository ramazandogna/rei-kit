import type { Entry } from './catalog'
import { plain } from './catalog'

/**
 * The AI tab's prompt: a plain template over catalog data. Nothing here
 * talks to a network; the page only links out when the reader asks.
 */

const GOALS: Record<string, string> = {
  BaseButton: 'a form footer with a primary Save and a secondary Cancel action',
  DataTable: 'a sortable orders table with row selection',
  BaseTable: 'a compact invoice summary table',
  BaseModal: 'a confirm-delete dialog for a project',
  BaseSheet: 'a mobile filter sheet for a product list',
  BaseDrawer: 'a settings drawer that slides in from the side',
  BaseInput: 'a sign-in form with email and password',
  PasswordInput: 'a sign-in form with email and password',
  BaseSelect: 'a country picker inside a shipping address form',
  BaseCombobox: 'a searchable assignee picker for an issue tracker',
  BaseTabs: 'an account page with Profile, Billing and Security tabs',
  BaseCalendar: 'a booking page where people pick a free day',
  BaseDatePicker: 'a travel form with check-in and check-out dates',
  CommandMenu: 'a Cmd+K command palette for an admin app',
  BaseCard: 'a pricing card with a plan name, price and call to action',
  BaseAlert: 'an inline billing warning with a link to fix it',
  ToastHost: 'save confirmations that appear after a form submits',
  BarChart: 'a weekly revenue chart on a dashboard',
}

const BY_CATEGORY: Record<string, string> = {
  Actions: 'a toolbar of actions for a document editor',
  Selection: 'a settings form where people choose their preferences',
  'Dates and times': 'a scheduling form for booking a meeting',
  Feedback: 'clear status feedback after a user saves their work',
  'Disclosure and tables': 'a dashboard panel that organises dense data',
  'Desk and editing': 'a desktop editing workspace',
  Motion: 'a landing page hero that draws the eye without distracting',
  Effects: 'a polished marketing section',
  Chat: 'a support chat panel',
  Install: 'an install prompt for a progressive web app',
}

export function suggestedGoal(entry: Entry): string {
  return GOALS[entry.name] ?? BY_CATEGORY[entry.category] ?? `a screen that uses ${entry.name}`
}

const one = (text: string) => text.replace(/\s+/g, ' ').trim()

export function buildPrompt(entry: Entry, goal: string, example?: string): string {
  const g = goal.trim() || suggestedGoal(entry)
  const lines: string[] = [
    `Build ${g} as a Vue 3 single-file component.`,
    '',
    'Use rei-kit (Vue 3 + Tailwind CSS 4). Do not add other UI libraries.',
    `Import: import { ${entry.name} } from '${entry.entry}'`,
    `${entry.name}: ${one(plain(entry.summary))}`,
  ]

  if (entry.props.length) {
    lines.push('', 'Props (name: type = default):')
    for (const p of entry.props) {
      const def = p.default && p.default !== 'undefined' ? ` = ${p.default}` : ''
      const req = p.required ? ' (required)' : ''
      const note = p.description ? ` - ${one(p.description)}` : ''
      lines.push(`- ${p.name}: ${one(p.type)}${def}${req}${note}`)
    }
  }
  if (entry.slots.length)
    lines.push(
      '',
      `Slots: ${entry.slots.map((s) => (s.payload ? `#${s.name} ${s.payload}` : `#${s.name}`)).join(', ')}`,
    )
  if (entry.emits.length)
    lines.push('', `Emits: ${entry.emits.map((e) => `${e.name} ${e.payload}`.trim()).join(', ')}`)

  if (example)
    lines.push('', 'Start from this working example and adapt it:', '```vue', example.trim(), '```')

  lines.push(
    '',
    'Theming:',
    '- Never hard-code colours. Use the token utilities (bg-surface, text-ink, text-ink-soft, border-hair, bg-primary, text-on-primary, rounded-card, shadow-card).',
    '- The look switches with data-material="quiet|glass|brutal|soft" and data-palette on an ancestor, and .dark on <html>. The result must hold up in all of them.',
    '',
    'Accessibility:',
    '- Keep every label, name and description the component asks for; text is already translated, so pass it in.',
    '- Everything must work by keyboard with a visible focus ring; do not remove focus styles.',
    '- Respect prefers-reduced-motion; add no animation of your own that ignores it.',
    '',
    'Output: one .vue file with <script setup lang="ts">, typed props and realistic sample data, then two sentences on the choices you made. No placeholder TODOs.',
  )
  return lines.join('\n')
}
