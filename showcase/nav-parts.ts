/**
 * The navigation parts, as the page presents them.
 *
 * Seven of them shared one card, and five had no heading at all — so a
 * reader looking for the bottom bar had to recognise it by sight. Shared by
 * the section and the menu, so a part cannot be on the page and missing from
 * the way to it.
 */
export const NAV_PARTS = [
  {
    id: 'nav-links',
    label: 'NavLinks',
    title: 'NavLinks — the row at the top',
    pitch:
      'A wide site’s primary navigation. It shares its item shape with TabBar, so moving an app between a top row and a bottom bar is a change of component and not of data. A rule under the current section rather than a filled pill, because these are not buttons — they are where you are.',
  },
  {
    id: 'nav-mega',
    label: 'MegaMenu',
    title: 'MegaMenu — when a section holds more than a row can',
    pitch:
      'Each top item discloses a panel of columns; an item with no columns stays a plain link. Not role="menu", which would promise a keyboard contract links do not have. Hover opens it, and so do a press and Enter; Escape closes it and gives focus back.',
  },
  {
    id: 'nav-breadcrumb',
    label: 'BaseBreadcrumb',
    title: 'BaseBreadcrumb — the way back up',
    pitch:
      'Where this page sits in the tree above it. The last item is the page itself and is not a link, which is the part most hand-written ones get wrong.',
  },
  {
    id: 'nav-tabs',
    label: 'BaseTabs',
    title: 'BaseTabs — panels inside one page',
    pitch:
      'Switches what is shown without navigating, so it leaves no history — the back button will not undo it. The arrows move between tabs and Home and End jump to the ends. If you want the back button to work, these are links, not tabs.',
  },
  {
    id: 'nav-pagination',
    label: 'BasePagination',
    title: 'BasePagination — one page of many',
    pitch:
      'Ellipses that keep the control the same width whatever page you are on, and a current page announced as such rather than only coloured in.',
  },
  {
    id: 'nav-tabbar',
    label: 'TabBar',
    title: 'TabBar — the bar at the bottom',
    pitch:
      'A phone app’s primary navigation, within reach of a thumb. The same item shape as NavLinks, icons aside.',
  },
  {
    id: 'nav-stepper',
    label: 'BaseStepper',
    title: 'BaseStepper — where you are in a process',
    pitch:
      'Finished steps can be clicked to go back; steps ahead cannot. Not BaseTimeline: this is a process you are in, and that is a record of one that happened.',
  },
] as const

export type NavPartId = (typeof NAV_PARTS)[number]['id']
