export type Priority = 'high' | 'medium' | 'low'

export type FilterStatus = 'all' | 'active' | 'completed'

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: Priority
  dueDate?: string
  createdAt: string
}
