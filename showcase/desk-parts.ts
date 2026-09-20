/**
 * The desk-sized shapes, as the page presents them.
 *
 * All four shared one section and two of them — the toolbar and the
 * splitter — had no prop table at all, because a single demo showed three
 * components at once and could only carry one. Shared by the section and the
 * menu, so a part cannot be on the page and missing from the way to it.
 */
export const DESK_PARTS = [
  {
    id: 'desk-toolbar',
    label: 'BaseToolbar',
    title: 'BaseToolbar — one Tab stop for a row of controls',
    pitch:
      'Wrap a row in it and passing it costs one Tab press instead of one per control; the arrows move between them and skip what is disabled. It picks up whatever is inside, so the controls stay yours.',
  },
  {
    id: 'desk-splitter',
    label: 'BaseSplitter',
    title: 'BaseSplitter — two panes and a handle',
    pitch:
      'The handle is a separator with a value, which is what a hand-written divider never has: the arrows move it, Home and End send it to its limits, and Enter puts it back where it started. A divider that only answers to a drag is a layout a keyboard cannot change at all.',
  },
  {
    id: 'desk-tree',
    label: 'BaseTree',
    title: 'BaseTree — branches inside branches',
    pitch:
      'Right opens a branch and then steps into it, left closes it and then steps out. Every row states its level, its position and how many siblings it has, so somebody listening hears “level 2, 3 of 7” — the only way to know where you are in a shape you cannot see.',
  },
  {
    id: 'desk-transfer',
    label: 'TransferList',
    title: 'TransferList — available on one side, chosen on the other',
    pitch:
      'Both sides on screen at once, and the chosen side keeps the order things were added in. Reach for a listbox with `multiple` when one list with ticks is enough and the order does not matter.',
  },
] as const

export type DeskPartId = (typeof DESK_PARTS)[number]['id']
