export type Priority = 'high' | 'medium' | 'low'

export type FilterStatus = 'today' | 'allDates'

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: Priority
  dueDate?: string
  dueTime?: string
  memo?: string
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
