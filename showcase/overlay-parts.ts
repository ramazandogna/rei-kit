/**
 * The overlays, as the page presents them.
 *
 * They were one card holding seven, which is the arrangement that reads well
 * once and fails somebody who arrived knowing they need "the one that asks
 * beside the button". A heading each is a menu entry each, and a link that
 * can be sent.
 *
 * Shared by the section and the menu, so a part cannot be on the page and
 * missing from the way to it.
 */
export const OVERLAY_PARTS = [
  {
    id: 'overlay-modal',
    label: 'BaseModal',
    title: 'BaseModal — arrives from nowhere',
    pitch:
      'For a decision that interrupts what you were reading. Focus moves inside, Tab cannot escape, Escape closes — and with `dismissible: false` neither does, for an answer the reader has to actually give.',
  },
  {
    id: 'overlay-sheet',
    label: 'BaseSheet',
    title: 'BaseSheet — arrives from the bottom edge',
    pitch:
      'The same job on a phone, where the top of the screen is out of reach and the bottom is where the thumb already is. It looks narrow on a desktop because it is pinned to the app shell’s column — on a phone that column is the whole screen.',
  },
  {
    id: 'overlay-drawer',
    label: 'BaseDrawer',
    title: 'BaseDrawer — arrives from the side',
    pitch:
      'What a wide screen keeps beside the page rather than on top of it: filters, a cart, a menu that outgrew its bar. `side` is `start` and `end`, not left and right, so it follows the writing direction on its own.',
  },
  {
    id: 'overlay-menu',
    label: 'BaseMenu',
    title: 'BaseMenu — a short list of actions',
    pitch:
      'Not a dialog at all: the arrows move between items, Home and End jump to the ends, and Tab *leaves* rather than trapping you. Getting that backwards traps somebody in a list of links.',
  },
  {
    id: 'overlay-context',
    label: 'BaseContextMenu',
    title: 'BaseContextMenu — the menu a right-click opens',
    pitch:
      'And Shift+F10, and the Menu key. That is the whole reason this is a kit part: the half that breaks is the half with no mouse in it, and a right-click menu without a keyboard is a set of actions some readers simply do not have.',
  },
  {
    id: 'overlay-tooltip',
    label: 'BaseTooltip',
    title: 'BaseTooltip — a label, not a layer',
    pitch:
      'Shown by :hover and :focus-within in the stylesheet, so it survives a prerendered page and a reader with scripting off. `follow` tracks the pointer instead, and is the one part of it that needs JavaScript.',
  },
  {
    id: 'overlay-hovercard',
    label: 'BaseHoverCard',
    title: 'BaseHoverCard — when the answer is a thing, not a sentence',
    pitch:
      'A tooltip is wired with `aria-describedby`, which flattens whatever is inside it to text — right for a sentence, and the end of a card with a link in it. This keeps its contents real, and survives the pointer crossing the gap, which is the whole reason it is a component rather than two CSS rules.',
  },
  {
    id: 'overlay-popover',
    label: 'BasePopover',
    title: 'BasePopover — anything, beside its trigger',
    pitch:
      'A few settings, a picker, a filter row — next to the control that opened it, with the page still usable behind. Focus goes in, Escape brings it back, and the trigger stays your own button.',
  },
  {
    id: 'overlay-popconfirm',
    label: 'BasePopconfirm',
    title: 'BasePopconfirm — the question beside the button',
    pitch:
      'So what is being deleted stays on screen. It sits between a toast with an undo, which is kinder still, and a dialog, which is for an answer that needs explaining.',
  },
  {
    id: 'overlay-responsive',
    label: 'ResponsiveDialog',
    title: 'ResponsiveDialog — whichever the screen can hold',
    pitch:
      'A modal on a wide screen and a sheet on a phone, from one set of props. The width is read after mount rather than guessed during render, and until it is known it is the sheet — the narrow answer fits on both.',
  },
] as const

export type OverlayPartId = (typeof OVERLAY_PARTS)[number]['id']
