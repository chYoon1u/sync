import { describe, it, expect } from 'vitest'
import {
  formatYearMonth,
  getDaysInMonth,
  getFirstDayOfMonth,
  toDateString,
  isToday,
  buildCalendarGrid,
} from '@/utils/date'

describe('date utils', () => {
  it('getDaysInMonth', () => {
    expect(getDaysInMonth(2026, 1)).toBe(28)
    expect(getDaysInMonth(2024, 1)).toBe(29) // 윤년
    expect(getDaysInMonth(2026, 5)).toBe(30) // 6월
    expect(getDaysInMonth(2026, 0)).toBe(31)
  })

  it('getFirstDayOfMonth — 2026-06-01 월요일(1)', () => {
    expect(getFirstDayOfMonth(2026, 5)).toBe(1)
  })

  it('toDateString', () => {
    expect(toDateString(new Date(2026, 5, 10))).toBe('2026-06-10')
  })

  it('isToday', () => {
    const today = toDateString(new Date())
    expect(isToday(today)).toBe(true)
    expect(isToday('2000-01-01')).toBe(false)
  })

  it('formatYearMonth', () => {
    const result = formatYearMonth(2026, 5)
    expect(result).toContain('2026')
    expect(result).toContain('6')
  })

  describe('buildCalendarGrid', () => {
    it('항상 42개 셀 반환', () => {
      expect(buildCalendarGrid(2026, 5)).toHaveLength(42)
      expect(buildCalendarGrid(2026, 1)).toHaveLength(42)
      expect(buildCalendarGrid(2024, 1)).toHaveLength(42)
    })

    it('2026년 6월 — 첫 셀이 일요일(2026-05-31)로 시작', () => {
      const cells = buildCalendarGrid(2026, 5)
      expect(cells[0].dateStr).toBe('2026-05-31')
      expect(cells[0].isCurrentMonth).toBe(false)
    })

    it('현재 달 날짜는 isCurrentMonth=true', () => {
      const cells = buildCalendarGrid(2026, 5)
      const juneFirst = cells.find((c) => c.dateStr === '2026-06-01')
      expect(juneFirst?.isCurrentMonth).toBe(true)
    })

    it('이전/다음 달 날짜는 isCurrentMonth=false', () => {
      const cells = buildCalendarGrid(2026, 5)
      const prevMonth = cells.filter((c) => !c.isCurrentMonth)
      expect(prevMonth.length).toBeGreaterThan(0)
      prevMonth.forEach((c) => expect(c.isCurrentMonth).toBe(false))
    })

    it('12월 다음 달은 다음 해 1월', () => {
      const cells = buildCalendarGrid(2026, 11)
      const nextYearCell = cells.find((c) => c.dateStr.startsWith('2027'))
      expect(nextYearCell).toBeDefined()
    })
  })
})
