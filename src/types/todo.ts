export type Priority = 'high' | 'medium' | 'low'

export type FilterStatus = 'today' | 'allDates'

export interface RoutineTemplate {
  id: string
  title: string
  priority: Priority
  dueTime?: string
  memo?: string
  scheduledDate?: string
  weekdays: number[]
  createdAt: string
}

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: Priority
  dueDate?: string
  dueTime?: string
  memo?: string
  routineId?: string
  seriesId?: string
  createdAt: string
}

declare global {
  interface Window {
    electronAPI?: {
      platform: string
      setAlwaysOnTop: (enabled: boolean) => Promise<boolean>
      setTodoCompact: (enabled: boolean) => Promise<void>
      setCalendarCollapsed: (enabled: boolean) => Promise<void>
    }
  }
}
