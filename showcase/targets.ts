import { BASICS_PARTS } from './basics-parts'
import { DESK_PARTS } from './desk-parts'
import { FORM_PARTS } from './form-parts'
import { MOTION_PARTS } from './motion-parts'
import { NAV_PARTS } from './nav-parts'
import { OVERLAY_PARTS } from './overlay-parts'

/**
 * Where a component's name should take you.
 *
 * The demo, wherever one exists — that is what somebody clicking `BaseSwitch`
 * wants to see, and the props are printed directly under it anyway. Only when
 * there is no demo does the props table stand in.
 *
 * Built from the same part lists the sections are, so a part that gains a
 * heading gains the link on the same commit. It lives here rather than in the
 * menu because the command palette has to agree with it — two answers to
 * "where is BaseModal" is one answer too many.
 */
const DEMOS = new Map<string, string>([
  ...BASICS_PARTS.map((part) => [part.label, part.id] as const),
  ...MOTION_PARTS.map((part) => [part.label, part.id] as const),
  ...FORM_PARTS.map((part) => [part.label, part.id] as const),
  ...OVERLAY_PARTS.map((part) => [part.label, part.id] as const),
  ...NAV_PARTS.map((part) => [part.label, part.id] as const),
  ...DESK_PARTS.map((part) => [part.label, part.id] as const),
])

/** The id to jump to for a component name. */
export const targetFor = (name: string): string => DEMOS.get(name) ?? `api-${name}`
