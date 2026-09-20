/**
 * The small parts, as the page presents them: one heading each, one sentence
 * on what it is for. Shared by the section and the menu, so a part cannot be
 * on the page and missing from the way to it.
 *
 * These were one card called "Basics" with eight components inside it, which
 * is the arrangement that reads well once and fails the thing people actually
 * do: arrive looking for `BaseSeparator` and scan a card for it. A heading per
 * part is a menu entry per part, and a link somebody can send.
 */
export const BASICS_PARTS = [
  {
    id: 'basics-separator',
    label: 'BaseSeparator',
    title: 'BaseSeparator — a rule that can carry a word',
    pitch:
      'A divider on its own is decoration, so it is hidden from a screen reader. Give it a label — "or" between a sign-in and a sign-up — and it becomes a heading for what follows.',
  },
  {
    id: 'basics-skeleton',
    label: 'BaseSkeleton',
    title: 'BaseSkeleton — the shape before the content',
    pitch:
      'Takes a length rather than a class, so it can be the size of the thing that is coming. For rows of the same shape, which is most loading states, reach for SkeletonList instead.',
  },
  {
    id: 'basics-kbd',
    label: 'BaseKbd',
    title: 'BaseKbd — a key, written as a key',
    pitch:
      'A real <kbd>, one per key, with the joiner between them as text. A shortcut spelled out in a paragraph is a shortcut nobody sees.',
  },
  {
    id: 'basics-chip',
    label: 'BaseChip',
    title: 'BaseChip — one of a set somebody assembled',
    pitch:
      'A filter, a recipient, a tag: it can be selected, removed, or both — and when it is both, the two are separate buttons rather than one nested in the other.',
  },
  {
    id: 'basics-avatars',
    label: 'AvatarStack',
    title: 'AvatarStack — who else is here',
    pitch:
      'Overlapping faces with a count for the rest. The whole group carries one name, so it is heard as "shared with 5 people" and not as five unlabelled images.',
  },
  {
    id: 'basics-rating',
    label: 'BaseRating',
    title: 'BaseRating — a score out of five',
    pitch:
      'A radio group wearing stars: the arrows move it, and the value is read as words because a row of filled shapes says nothing out loud. Readonly for an average.',
  },
  {
    id: 'basics-link',
    label: 'BaseLink',
    title: 'BaseLink — text that goes somewhere',
    pitch:
      'If it navigates, it is a link. An external one says so, and opens with the rel that stops the new page reaching back into this one.',
  },
  {
    id: 'basics-copy',
    label: 'CopyButton',
    title: 'CopyButton — the thing on the page, on the clipboard',
    pitch:
      'Copies, says it copied, and says so out loud as well as in the label. It carries a failure state because a clipboard write is refused more often than anyone expects.',
  },
] as const

export type BasicsPartId = (typeof BASICS_PARTS)[number]['id']
