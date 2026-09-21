import { BASICS_PARTS } from './basics-parts'
import { DESK_PARTS } from './desk-parts'
import { FORM_GROUPS, FORM_PARTS } from './form-parts'
import { MOTION_PARTS } from './motion-parts'
import { NAV_PARTS } from './nav-parts'
import { OVERLAY_PARTS } from './overlay-parts'

/**
 * Every place the page can be jumped to, in the order it appears.
 *
 * Read by the side menu and by the command palette, which have to agree:
 * two answers to "where is the date picker" is one answer too many. The
 * part lists are spread in rather than repeated, so a part that gains a
 * heading gains its way in on the same commit.
 */
export const SECTIONS = [
  { id: 'axes', label: 'Themes: materials & palettes' },
  { id: 'evidence', label: 'Evidence: size and guards' },
  { id: 'start', label: 'Get started' },
  { id: 'action', label: 'Action' },
  { id: 'basics', label: 'Basics' },
  ...BASICS_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'motion', label: 'Motion' },
  ...MOTION_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'surfaces', label: 'Surfaces' },
  { id: 'status', label: 'Status and feedback' },
  { id: 'progress', label: 'Progress' },
  { id: 'notifications', label: 'Notifications' },
  ...FORM_GROUPS.flatMap((group) => [
    { id: group.id, label: group.label },
    ...FORM_PARTS.filter((part) => part.group === group.id).map((part) => ({
      id: part.id,
      label: part.label,
      sub: true,
    })),
  ]),
  { id: 'dates', label: 'Dates and times' },
  { id: 'settings', label: 'Settings' },
  { id: 'overlays', label: 'Overlays' },
  ...OVERLAY_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'navigation', label: 'Navigation' },
  ...NAV_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'disclosure', label: 'Disclosure' },
  { id: 'data', label: 'Data' },
  { id: 'command-menu', label: 'Command menu' },
  { id: 'desk', label: 'Desk layout' },
  ...DESK_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'state', label: 'State' },
  { id: 'phone-shell', label: 'Phone shell' },
  { id: 'empty', label: 'Empty and waiting' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'api', label: 'All props' },
  { id: 'credits', label: 'About & credits' },
]

export type Section = (typeof SECTIONS)[number]
