import { useMemo } from 'react'
import { useTodoStore } from '@/store/useTodoStore'
import { TodoItem } from './TodoItem'
import type { Priority } from '@/types/todo'

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

export function TodoList() {
  const { todos, filter } = useTodoStore()

  const filtered = useMemo(() => {
    const base = todos.filter((t) => {
      if (filter === 'active') return !t.completed
      if (filter === 'completed') return t.completed
      return true
    })
    return [...base].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    })
  }, [todos, filter])

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-500">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm">할 일이 없습니다</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {filtered.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
