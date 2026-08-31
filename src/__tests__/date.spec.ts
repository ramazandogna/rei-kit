import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  addDays,
  eachDayOfYear,
  fromDateKey,
  lastNDays,
  leadingBlanks,
  startOfWeek,
  toDateKey,
  todayKey,
} from '../utils/date'

afterEach(() => {
  vi.useRealTimers()
})

describe('toDateKey', () => {
  it('pads month and day', () => {
    expect(toDateKey(new Date(2026, 0, 3))).toBe('2026-01-03')
  })

  it('reads local fields, not UTC ones', () => {
    // 00:30 local: in any timezone ahead of UTC this is still the previous
    // day in UTC, which is exactly what toISOString would have returned.
    expect(toDateKey(new Date(2026, 7, 23, 0, 30))).toBe('2026-08-23')
    expect(toDateKey(new Date(2026, 7, 23, 23, 30))).toBe('2026-08-23')
  })
})

describe('todayKey', () => {
  it('returns the local day just before midnight', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 23, 23, 59))

    expect(todayKey()).toBe('2026-08-23')
  })

  it('returns the local day just after midnight', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 24, 0, 1))

    expect(todayKey()).toBe('2026-08-24')
  })
})

describe('fromDateKey', () => {
  it('parses to local midnight', () => {
    const date = fromDateKey('2026-08-23')

    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(7)
    expect(date.getDate()).toBe(23)
    expect(date.getHours()).toBe(0)
  })

  it('round-trips with toDateKey', () => {
    expect(toDateKey(fromDateKey('2026-08-23'))).toBe('2026-08-23')
  })

  it('throws on a malformed key', () => {
    expect(() => fromDateKey('2026-08')).toThrow('Invalid date key')
  })
})

describe('addDays', () => {
  it('crosses a month boundary', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
  })

  it('crosses a year boundary', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('handles a leap day', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01')
  })

  it('skips February 29 in a non-leap year', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
  })
})

describe('lastNDays', () => {
  it('returns oldest first and includes today', () => {
    expect(lastNDays(3, '2026-08-23')).toEqual(['2026-08-21', '2026-08-22', '2026-08-23'])
  })

  it('crosses a month boundary', () => {
    expect(lastNDays(2, '2026-03-01')).toEqual(['2026-02-28', '2026-03-01'])
  })
})

describe('startOfWeek', () => {
  it('walks back to Monday', () => {
    // 2026-08-23 is a Sunday
    expect(startOfWeek('2026-08-23', 1)).toBe('2026-08-17')
  })

  it('returns the day itself when it is already the first day', () => {
    expect(startOfWeek('2026-08-23', 0)).toBe('2026-08-23')
  })
})

describe('eachDayOfYear', () => {
  it('counts a normal year', () => {
    expect(eachDayOfYear(2026)).toHaveLength(365)
  })

  it('counts a leap year and includes February 29', () => {
    const days = eachDayOfYear(2028)

    expect(days).toHaveLength(366)
    expect(days).toContain('2028-02-29')
  })

  it('starts and ends on the right days', () => {
    const days = eachDayOfYear(2026)

    expect(days[0]).toBe('2026-01-01')
    expect(days.at(-1)).toBe('2026-12-31')
  })
})

describe('leadingBlanks', () => {
  it('counts blanks for a Monday-first grid', () => {
    // 2026-01-01 is a Thursday
    expect(leadingBlanks('2026-01-01', 1)).toBe(3)
  })

  it('counts blanks for a Sunday-first grid', () => {
    expect(leadingBlanks('2026-01-01', 0)).toBe(4)
  })

  it('is zero when the block starts on the first weekday', () => {
    // 2024-01-01 is a Monday
    expect(leadingBlanks('2024-01-01', 1)).toBe(0)
  })

  it('works for a month that is not January', () => {
    // 2026-02-01 is a Sunday
    expect(leadingBlanks('2026-02-01', 1)).toBe(6)
  })
})
