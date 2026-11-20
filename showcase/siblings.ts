/**
 * "Which one?": groups of components that get mistaken for each other.
 * Each row says what to use it for. The component page shows the box when its
 * component is in a group.
 */
export interface Sibling {
  name: string
  use: string
}

export const SIBLINGS: Sibling[][] = [
  [
    { name: 'TabBar', use: 'The bottom bar of an app shell; each tab is a route.' },
    { name: 'BaseTabs', use: 'Switching panels of content on one page.' },
    { name: 'NavLinks', use: 'A row of links in a header.' },
    { name: 'MegaMenu', use: 'A wide menu with grouped links under one trigger.' },
  ],
  [
    { name: 'BaseTable', use: 'A small, static table that reads as a document.' },
    { name: 'DataTable', use: 'Sorting, selection and many rows.' },
  ],
  [
    { name: 'CountUp', use: 'A figure that counts in once, on screen.' },
    { name: 'NumberTicker', use: 'A value that changes while someone watches.' },
  ],
  [
    { name: 'BaseModal', use: 'A decision that blocks the page.' },
    { name: 'BaseSheet', use: 'A task that rises from the bottom, on a phone.' },
    { name: 'BaseDrawer', use: 'A side panel that keeps the page in view.' },
    { name: 'ResponsiveDialog', use: 'One of the above, chosen by screen size.' },
  ],
  [
    { name: 'PriceCard', use: 'One price, one plan, one action.' },
    { name: 'PricingCard', use: 'A plan card with features and a highlighted tier.' },
  ],
  [
    { name: 'BarChart', use: 'Comparing a few values.' },
    { name: 'LineChart', use: 'A trend over time, with axes.' },
    { name: 'Sparkline', use: 'A trend with no axes, inside a line of text or a card.' },
  ],
  [
    { name: 'Dock', use: 'A row of app-style icon buttons that magnify.' },
    { name: 'BaseToolbar', use: 'A set of related controls with one tab stop.' },
  ],
]

export const siblingsOf = (name: string): Sibling[] | undefined =>
  SIBLINGS.find((group) => group.some((s) => s.name === name))
