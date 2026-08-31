import { addDays, fromDateKey } from './date'
import { formatDate } from './format'

/** The two days worth naming rather than numbering. */
export interface DayLabels {
  today: string
  yesterday: string
}

/**
 * A short name for a day, relative to today.
 *
 * "Today" and "Yesterday" are worth spelling out — they are the two a user
 * actually reaches for. Anything older gets its weekday, which inside a
 * five-day window is unambiguous and stays two or three characters in every
 * language.
 *
 * The two words are arguments rather than translated here: a library that calls
 * `t()` forces every consumer onto one i18n setup.
 *
 * @param dateKey - The day to label (`YYYY-MM-DD`).
 * @param today - Today's key, passed in so the caller controls the clock.
 * @param labels - What to call today and yesterday.
 *
 * @example
 * ```ts
 * relativeDayLabel('2026-08-28', '2026-08-31', { today: 'Today', yesterday: 'Yesterday' })
 * // 'Fri'
 * ```
 */
export function relativeDayLabel(dateKey: string, today: string, labels: DayLabels): string {
  if (dateKey === today) return labels.today
  if (dateKey === addDays(today, -1)) return labels.yesterday

  return formatDate(fromDateKey(dateKey), { weekday: 'short' })
}
