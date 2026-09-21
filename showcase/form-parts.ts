/**
 * The form controls as the page presents them, in three groups by the kind of
 * answer they take.
 *
 * They were two sections: "Form" and "Form — continued". "Continued" is not a
 * category — it told a reader looking for a switch that it was somewhere
 * after the things that fitted in the first card, which is the arrangement of
 * a page that ran out of room rather than one that was arranged.
 *
 * Shared by the section and the menu, so a part cannot be on the page and
 * missing from the way to it.
 */
export const FORM_GROUPS = [
  {
    id: 'form',
    label: 'Form: text and choice',
    lead: 'Fields that take words, and fields that take one of a list. Every one of them is labelled, and the label is a prop rather than a slot because a field without one is the single most common thing wrong with a form.',
  },
  {
    id: 'form-toggles',
    label: 'Form: on, off and one of a set',
    lead: 'Four ways to answer a closed question, and they are not interchangeable. The differences are small on screen and large to somebody using the page.',
  },
  {
    id: 'form-values',
    label: 'Form: numbers, codes and files',
    lead: 'Answers with a shape: an amount, a length, a one-time code, a set of tags, a file, a colour. Each carries the keyboard behaviour its shape implies.',
  },
] as const

export type FormGroupId = (typeof FORM_GROUPS)[number]['id']

export const FORM_PARTS = [
  {
    id: 'form-input',
    group: 'form',
    label: 'BaseInput',
    title: 'BaseInput — a line of text',
    pitch:
      'The label, the hint and the error are all wired to the field by id, so an error is read out with the field rather than sitting near it in red.',
  },
  {
    id: 'form-textarea',
    group: 'form',
    label: 'BaseTextarea',
    title: 'BaseTextarea — more than a line',
    pitch: 'The same wiring, with rows. For a note, a description, an address.',
  },
  {
    id: 'form-field',
    group: 'form',
    label: 'FormField',
    title: 'FormField — the wiring, around your own control',
    pitch:
      'When the control is yours — an editor, a masked field, something from another library — this supplies the label, the hint, the error and the ids that tie them together, and hands them to you in a slot.',
  },
  {
    id: 'form-error-summary',
    group: 'form',
    label: 'ErrorSummary',
    title: 'ErrorSummary — what a rejected form says at the top of itself',
    pitch:
      'FormField puts the reason beside the field; what that cannot do is say the submission failed at all. On a long form the first rejected field is a screenful away and focus is still on the submit button, so to a reader nothing happened when it was pressed. This is the answer to “did that work?”, and a way into each field in one press. Focused rather than announced: role="alert" would read the list at somebody whose focus is still on a button they cannot use.',
  },
  {
    id: 'form-select',
    group: 'form',
    label: 'BaseSelect',
    title: 'BaseSelect — the platform’s own picker',
    pitch:
      'A real <select>, which on a phone is the wheel the operating system draws. Up to a few dozen options nothing a web page can build beats it.',
  },
  {
    id: 'form-combobox',
    group: 'form',
    label: 'BaseCombobox',
    title: 'BaseCombobox — a list too long to read',
    pitch:
      'Type to narrow it. Past a few dozen options the problem stops being choosing and starts being finding, and that is the line where this replaces the select. It also takes several answers as chips, a list that lives on a server, and a list too long to put in the DOM.',
  },
  {
    id: 'form-listbox',
    group: 'form',
    label: 'BaseListbox',
    title: 'BaseListbox — a long list that stays on screen',
    pitch:
      'One Tab stop: the arrows move the current option, typing a letter jumps to it, and in multiple mode each one keeps its own tick. Nothing opens or closes.',
  },
  {
    id: 'form-checkbox',
    group: 'form-toggles',
    label: 'BaseCheckbox',
    title: 'BaseCheckbox — an intention',
    pitch:
      'A checkbox states something that a Save button later commits. If there is no Save after it, it is a switch.',
  },
  {
    id: 'form-switch',
    group: 'form-toggles',
    label: 'BaseSwitch',
    title: 'BaseSwitch — the commit itself',
    pitch:
      'A switch is the change itself: it takes effect as it moves, and there is nothing to confirm afterwards. That is the whole difference from a checkbox, and it is a promise to the reader rather than a shape.',
  },
  {
    id: 'form-radio',
    group: 'form-toggles',
    label: 'BaseRadioGroup',
    title: 'BaseRadioGroup — a handful, all visible',
    pitch:
      'Every option on screen and exactly one answer. It is a fieldset with a legend, so the question is read before the options rather than left to the layout.',
  },
  {
    id: 'form-segmented',
    group: 'form-toggles',
    label: 'SegmentedControl',
    title: 'SegmentedControl — radios wearing a pill',
    pitch:
      'The same promise as a radio group — always exactly one — in the shape a filter row wants. The pill follows the focus ring, because the input it is built on is off screen.',
  },
  {
    id: 'form-toggle-group',
    group: 'form-toggles',
    label: 'ToggleGroup',
    title: 'ToggleGroup — buttons that stay pressed',
    pitch:
      'Any number of them in multiple mode, one or none in single. A toolbar’s bold and italic are this; a filter that must have an answer is a segmented control.',
  },
  {
    id: 'form-number',
    group: 'form-values',
    label: 'NumberInput',
    title: 'NumberInput — a number somebody knows',
    pitch:
      'A count, a price, a quantity: typed or stepped, with the arrow keys as well as the buttons, and held inside its range.',
  },
  {
    id: 'form-slider',
    group: 'form-values',
    label: 'BaseSlider',
    title: 'BaseSlider — a number somebody feels out',
    pitch:
      'A length, a volume, a threshold — a value found by moving along a range rather than by knowing it. The arrows move it too, and the value is spoken in your own words.',
  },
  {
    id: 'form-slider-field',
    group: 'form-values',
    label: 'SliderField',
    title: 'SliderField — both at once',
    pitch:
      'A wide range with an exact answer somewhere in it wants the slider and the field together: drag to find roughly right, type to land on it. Both carry the same name, because they are one answer and not two settings side by side.',
  },
  {
    id: 'form-pin',
    group: 'form-values',
    label: 'PinInput',
    title: 'PinInput — a code, one box per digit',
    pitch:
      'Focus moves as it fills, Backspace steps back, and a pasted code fills every box at once — which is what people actually do with the code in the message.',
  },
  {
    id: 'form-tags',
    group: 'form-values',
    label: 'TagsInput',
    title: 'TagsInput — a set the reader assembles',
    pitch:
      'Enter or a comma commits one, Backspace takes the last back, and a pasted list becomes separate tags rather than one long one.',
  },
  {
    id: 'form-colour',
    group: 'form-values',
    label: 'ColorPicker',
    title: 'ColorPicker — a colour, as a hex value',
    pitch:
      'The platform’s own picker, painted — the same decision as the slider, which is a native range in kit clothes. The swatches beside it are yours, values and names both: a row of colours from the kit would be a product decision, and unnamed ones would be buttons a screen reader reads as nothing.',
  },
  {
    id: 'form-file',
    group: 'form-values',
    label: 'FileDrop',
    title: 'FileDrop — a file, dropped or chosen',
    pitch:
      'A drop target that is also a real file input, because a drop target alone cannot be used by a keyboard. Refuses what is too large in your words, before the upload.',
  },
] as const

export type FormPartId = (typeof FORM_PARTS)[number]['id']
