/**
 * What a keyboard and a screen reader get from each interactive component.
 * Anything not listed gets a generic note on the component page.
 */
export interface A11y {
  keyboard?: [keys: string[], action: string][]
  notes: string[]
}

const press: [string[], string] = [['Enter'], 'Activates it.']
const dialog: A11y = {
  keyboard: [
    [['Tab'], 'Moves through the controls inside; the page behind is inert.'],
    [['Esc'], 'Closes it and returns focus to what opened it.'],
  ],
  notes: ['Has a role and an accessible name.', 'Focus moves in on open and back on close.'],
}

export const A11Y: Record<string, A11y> = {
  BaseButton: {
    keyboard: [press, [['Space'], 'Activates it.']],
    notes: [
      'A real <button>; `pressed` writes aria-pressed.',
      'Icon-only buttons need aria-label.',
    ],
  },
  BaseModal: dialog,
  BaseSheet: dialog,
  BaseDrawer: dialog,
  ResponsiveDialog: dialog,
  BasePopover: {
    keyboard: [
      [['Esc'], 'Closes and returns focus to the trigger.'],
      [['Tab'], 'Leaving the panel closes it.'],
    ],
    notes: ['A non-modal dialog; the page behind stays usable.'],
  },
  BaseMenu: {
    keyboard: [
      [['↓', '↑'], 'Opens, then moves between items.'],
      [['Home', 'End'], 'First and last item.'],
      [['Esc'], 'Closes.'],
    ],
    notes: ['Items are `role="menuitem"`; the trigger has aria-expanded.'],
  },
  BaseTabs: {
    keyboard: [
      [['←', '→'], 'Moves between tabs (mirrored in RTL).'],
      [['Home', 'End'], 'First and last tab.'],
    ],
    notes: ['Tablist, tab and tabpanel roles with aria-selected.'],
  },
  BaseAccordion: {
    keyboard: [
      [['Enter', 'Space'], 'Toggles a section.'],
      [['↓', '↑'], 'Moves between headers.'],
    ],
    notes: ['Headers are buttons with aria-expanded and aria-controls.'],
  },
  BaseCombobox: {
    keyboard: [
      [['↓', '↑'], 'Moves through options.'],
      [['Enter'], 'Chooses the active option.'],
      [['Esc'], 'Closes the list.'],
    ],
    notes: ['aria-activedescendant keeps focus in the input.'],
  },
  BaseSelect: {
    keyboard: [
      [['↓', '↑'], 'Changes the choice.'],
      [['Type'], 'Jumps to a matching option.'],
    ],
    notes: ['A native select underneath, so every platform behaves as users expect.'],
  },
  BaseCheckbox: {
    keyboard: [[['Space'], 'Toggles it.']],
    notes: ['A real checkbox input with a visible label.'],
  },
  BaseSwitch: {
    keyboard: [[['Space'], 'Toggles it.']],
    notes: ['role="switch" with aria-checked.'],
  },
  BaseRadioGroup: {
    keyboard: [
      [['←', '→', '↑', '↓'], 'Moves and selects.'],
      [['Tab'], 'One tab stop for the group.'],
    ],
    notes: ['A radiogroup with a visible legend.'],
  },
  BaseSlider: {
    keyboard: [
      [['←', '→'], 'Changes by one step.'],
      [['Home', 'End'], 'Minimum and maximum.'],
    ],
    notes: ['Native range input; the value is announced.'],
  },
  BaseCalendar: {
    keyboard: [
      [['←', '→'], 'Previous or next day.'],
      [['↑', '↓'], 'Previous or next week.'],
      [['PgUp', 'PgDn'], 'Previous or next month.'],
      [['Enter'], 'Chooses the day.'],
    ],
    notes: ['A grid; each day has a spoken name in the page language.'],
  },
  CommandMenu: {
    keyboard: [
      [['↓', '↑'], 'Moves through results.'],
      [['Enter'], 'Runs the active item.'],
      [['Esc'], 'Closes.'],
    ],
    notes: ['A dialog with a combobox inside it.'],
  },
  Dock: {
    keyboard: [
      [['←', '→'], 'Moves between items.'],
      [['Enter'], 'Selects.'],
    ],
    notes: ['A toolbar with one tab stop; magnification is decorative and off for reduced motion.'],
  },
  BaseToolbar: {
    keyboard: [
      [['←', '→'], 'Moves between controls.'],
      [['Tab'], 'One tab stop for the whole bar.'],
    ],
    notes: ['role="toolbar" with a required label.'],
  },
  CopyButton: {
    keyboard: [press],
    notes: ['The result is announced politely: Copied or Could not copy.'],
  },
  ToastHost: {
    notes: ['Messages are announced politely; errors assertively. Each can be dismissed.'],
  },
  HeroBackdrop: {
    notes: ['Decorative: aria-hidden and pointer-events none. No motion for reduced motion.'],
  },
  BorderBeam: { notes: ['Decorative: aria-hidden. Static for reduced motion.'] },
  AnimatedBeam: { notes: ['Decorative: aria-hidden. Static for reduced motion.'] },
  SpotlightCard: { notes: ['The glow is decorative and follows focus as well as the pointer.'] },
  TiltCard: {
    notes: [
      'The tilt is decorative and off for reduced motion and touch. Content stays readable at rest.',
    ],
  },
}

export function a11yFor(name: string, element = 'div'): A11y {
  return (
    A11Y[name] ?? {
      notes: [
        `Follows the WAI-ARIA pattern for its role. Where it has no visible text, pass a label prop. Renders a <${element}>.`,
      ],
    }
  )
}
