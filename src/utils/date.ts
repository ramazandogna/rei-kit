/**
 * Local calendar-day helpers.
 *
 * Every function is pure and works on `YYYY-MM-DD` keys, the same shape as the
 * `date` columns in Postgres. Nothing here calls `toISOString`: that converts to
 * UTC, so in a UTC+9 timezone every entry made between midnight and 09:00 would
 * be written to the previous day.
 */

/**
 * Formats a `Date` as a local `YYYY-MM-DD` key.
 *
 * @param date - Any `Date`; only its local year, month and day are read.
 * @returns The calendar day in the runtime's own timezone.
 *
 * @example
 * ```ts
 * // 2026-08-23 01:30 in Tokyo
 * toDateKey(new Date())        // '2026-08-23'
 * new Date().toISOString()     // '2026-08-22T16:30…'  ← the bug
 * ```
 */
export function toDateKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/** Today's key in the user's own timezone. */
export function todayKey(): string {
  return toDateKey(new Date())
}

/**
 * Parses a `YYYY-MM-DD` key into a `Date` at local midnight.
 *
 * @param key - A key produced by {@link toDateKey}.
 * @returns Local midnight of that calendar day.
 * @throws If the key is not three numeric parts.
 *
 * @example
 * ```ts
 * fromDateKey('2026-08-23')      // local midnight, correct
 * new Date('2026-08-23')         // UTC midnight — shifts a day in some zones
 * ```
 */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid date key: ${key}`)
  }

  return new Date(year, month - 1, day)
}

/**
 * Shifts a date key by whole calendar days.
 *
 * Uses `setDate`, which is calendar-aware: it rolls over month and year ends,
 * and stays correct across daylight-saving transitions. Adding
 * `days * 86_400_000` milliseconds would not — a DST day is 23 or 25 hours long.
 *
 * @param key - Starting `YYYY-MM-DD` key.
 * @param days - Days to add; negative goes back.
 * @returns The resulting key.
 *
 * @example
 * ```ts
 * addDays('2026-01-31', 1)   // '2026-02-01'
 * addDays('2026-01-01', -1)  // '2025-12-31'
 * addDays('2028-02-28', 1)   // '2028-02-29'  — leap year
 * ```
 */
export function addDays(key: string, days: number): string {
  const date = fromDateKey(key)
  date.setDate(date.getDate() + days)

  return toDateKey(date)
}

/**
 * The last `count` days ending today, oldest first.
 *
 * `today` is a parameter so the function stays pure and testable; call sites
 * normally omit it.
 *
 * @param count - How many days to return, including `today`.
 * @param today - End of the range. Defaults to the real today.
 * @returns Keys in ascending order.
 *
 * @example
 * ```ts
 * lastNDays(3, '2026-08-23')  // ['2026-08-21', '2026-08-22', '2026-08-23']
 * ```
 */
export function lastNDays(count: number, today: string = todayKey()): string[] {
  const keys: string[] = []

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    keys.push(addDays(today, -offset))
  }

  return keys
}

/** 0 = week starts on Sunday, 1 = on Monday. Mirrors `profiles.week_starts_on`. */
export type WeekStart = 0 | 1

/**
 * The first day of the week containing `key`.
 *
 * The user's preference is a parameter, not a module-level setting: changing it
 * in Profile has to re-render the week grid and the year heatmap immediately,
 * and a global would make that a hidden dependency.
 *
 * @param key - Any day in the week.
 * @param weekStartsOn - 0 for Sunday, 1 for Monday.
 * @returns Key of that week's first day.
 *
 * @example
 * ```ts
 * // 2026-08-23 is a Sunday
 * startOfWeek('2026-08-23', 1)  // '2026-08-17'  — previous Monday
 * startOfWeek('2026-08-23', 0)  // '2026-08-23'  — already Sunday
 * ```
 */
export function startOfWeek(key: string, weekStartsOn: WeekStart): string {
  const weekday = fromDateKey(key).getDay()
  const offset = (weekday - weekStartsOn + 7) % 7

  return addDays(key, -offset)
}

/**
 * Every day of a calendar year, in order.
 *
 * Leap years fall out of the loop for free: it walks day by day until the year
 * rolls over, so February 29 is included when it exists.
 *
 * @param year - Four-digit year.
 * @returns 365 or 366 keys, oldest first.
 */
export function eachDayOfYear(year: number): string[] {
  const keys: string[] = []
  const date = new Date(year, 0, 1)

  while (date.getFullYear() === year) {
    keys.push(toDateKey(date))
    date.setDate(date.getDate() + 1)
  }

  return keys
}

/**
 * Empty cells before a block's first day in a seven-row column grid.
 *
 * The grid fills column by column, so the first column is only partly used
 * unless the block starts exactly on the week's first day. An off-by-one here
 * shifts the whole block by a row, so this is unit tested.
 *
 * @param firstDayKey - First day of the block, e.g. `'2026-02-01'`.
 * @param weekStartsOn - 0 for Sunday, 1 for Monday.
 * @returns 0-6 blank cells.
 *
 * @example
 * ```ts
 * leadingBlanks('2026-01-01', 1)  // 3 — a Thursday, Mon-Wed are blank
 * leadingBlanks('2024-01-01', 1)  // 0 — a Monday
 * ```
 */
export function leadingBlanks(firstDayKey: string, weekStartsOn: WeekStart): number {
  return (fromDateKey(firstDayKey).getDay() - weekStartsOn + 7) % 7
}
