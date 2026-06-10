export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function isToday(dateStr: string): boolean {
  return dateStr === toDateString(new Date())
}
