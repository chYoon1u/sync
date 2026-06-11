export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'))
}

export function formatYearMonth(year: number, month: number): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(
    new Date(year, month, 1)
  )
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isToday(dateStr: string): boolean {
  return dateStr === toDateString(new Date())
}

export interface CalendarCell {
  dateStr: string
  day: number
  isCurrentMonth: boolean
}

/** 6주 × 7일 그리드 셀 배열을 반환합니다 */
export function buildCalendarGrid(year: number, month: number): CalendarCell[] {
  const cells: CalendarCell[] = []
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInMonth = getDaysInMonth(year, month)
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

  // 이전 달 채우기
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    cells.push({
      dateStr: toDateString(new Date(prevYear, prevMonth, day)),
      day,
      isCurrentMonth: false,
    })
  }

  // 현재 달
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      dateStr: toDateString(new Date(year, month, day)),
      day,
      isCurrentMonth: true,
    })
  }

  // 다음 달 채우기 (6주 = 42칸 고정)
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  const remaining = 42 - cells.length
  for (let day = 1; day <= remaining; day++) {
    cells.push({
      dateStr: toDateString(new Date(nextYear, nextMonth, day)),
      day,
      isCurrentMonth: false,
    })
  }

  return cells
}
