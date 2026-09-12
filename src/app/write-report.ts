import { useToast } from '../composables/use-toast'

/**
 * Saying that a write happened.
 *
 * In one place so every mutation reports the same way. Both phone apps had
 * written this, and both had written it because before it existed none of their
 * mutations reported at all: a row was added, a row was deleted, and the only
 * evidence was that nothing had visibly broken.
 *
 * Deliberately generic. A message naming the thing that was saved reads better
 * once and worse every time after, and these are screens somebody uses dozens
 * of times in a sitting.
 *
 * Form validation does **not** come through here: a rejected field says so
 * beside itself, where the eye already is and where it stays until fixed. These
 * are for what has already happened.
 *
 * @example
 * ```ts
 * export const report = createWriteReport({
 *   saved: () => t('common.saved'),
 *   deleted: () => t('common.deleted'),
 *   failed: () => t('common.failed'),
 * })
 * ```
 */
export function createWriteReport(messages: WriteReportMessages): WriteReport {
  return {
    saved: () => useToast().success(messages.saved()),
    deleted: () => useToast().success(messages.deleted()),
    // `danger` rather than `warning`: the change is not in the database and the
    // person who made it is the only one who can decide what to do about that.
    failed: () => useToast().danger(messages.failed()),
  }
}

/**
 * Functions, not strings.
 *
 * A string would be read once, when the report is built, and would then keep
 * whichever language was active at that moment for the life of the app. Called
 * per report, the wording follows a language switch.
 */
export type WriteReportMessages = {
  saved: () => string
  deleted: () => string
  failed: () => string
}

export type WriteReport = {
  saved: () => void
  deleted: () => void
  failed: () => void
}
