import type { Todo } from '@/types/todo'

export function localDateKey(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00`)
  date.setDate(date.getDate() + days)
  return localDateKey(date)
}

export function dateRange(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate || endDate < startDate) return []
  const dates: string[] = []
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) dates.push(date)
  return dates
}

export function isTodoOverdue(todo: Todo, now = new Date()): boolean {
  if (todo.completed || !todo.dueDate) return false
  const deadline = todo.dueTime
    ? new Date(`${todo.dueDate}T${todo.dueTime}:00`)
    : new Date(`${addDays(todo.dueDate, 1)}T00:00:00`)
  return now.getTime() >= deadline.getTime()
}
