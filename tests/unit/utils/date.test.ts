import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatDate, getDaysInMonth, getFirstDayOfMonth, toDateString, isToday } from '@/utils/date'

afterEach(() => vi.restoreAllMocks())

describe('date utils', () => {
  it('formatDate — 한국어 날짜 형식', () => {
    expect(formatDate('2026-06-10')).toContain('2026')
    expect(formatDate('2026-06-10')).toContain('6')
  })

  it('getDaysInMonth', () => {
    expect(getDaysInMonth(2026, 1)).toBe(28) // 2월
    expect(getDaysInMonth(2024, 1)).toBe(29) // 윤년
    expect(getDaysInMonth(2026, 5)).toBe(30) // 6월
    expect(getDaysInMonth(2026, 0)).toBe(31) // 1월
  })

  it('getFirstDayOfMonth', () => {
    expect(getFirstDayOfMonth(2026, 5)).toBe(1) // 2026-06-01 월요일
  })

  it('toDateString', () => {
    expect(toDateString(new Date('2026-06-10T00:00:00Z'))).toBe('2026-06-10')
  })

  it('isToday', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(isToday(today)).toBe(true)
    expect(isToday('2000-01-01')).toBe(false)
  })
})
