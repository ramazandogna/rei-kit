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
  { id: 'start', label: 'Get started' },
  { id: 'axes', label: 'Themes: materials & palettes' },
  { id: 'aksiyon', label: 'Action' },
  { id: 'basics', label: 'Basics' },
  ...BASICS_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'hareket', label: 'Motion' },
  ...MOTION_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'yuzey', label: 'Surfaces' },
  { id: 'geri-bildirim', label: 'Status and feedback' },
  { id: 'ilerleme', label: 'Progress' },
  { id: 'bildirim', label: 'Notifications' },
  ...FORM_GROUPS.flatMap((group) => [
    { id: group.id, label: group.label },
    ...FORM_PARTS.filter((part) => part.group === group.id).map((part) => ({
      id: part.id,
      label: part.label,
      sub: true,
    })),
  ]),
  { id: 'tarih', label: 'Dates and times' },
  { id: 'ayarlar', label: 'Settings' },
  { id: 'ust-katman', label: 'Overlays' },
  ...OVERLAY_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'gezinme', label: 'Navigation' },
  ...NAV_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'acilir', label: 'Disclosure' },
  { id: 'veri', label: 'Data' },
  { id: 'komut', label: 'Command menu' },
  { id: 'masa', label: 'Desk layout' },
  ...DESK_PARTS.map((part) => ({ id: part.id, label: part.label, sub: true })),
  { id: 'durum', label: 'State' },
  { id: 'kabuk', label: 'Phone shell' },
  { id: 'bosluk', label: 'Empty and waiting' },
  { id: 'olcu', label: 'Metrics' },
  { id: 'api', label: 'All props' },
  { id: 'credits', label: 'About & credits' },
]

export type Section = (typeof SECTIONS)[number]
