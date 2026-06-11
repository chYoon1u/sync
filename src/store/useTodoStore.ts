import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Todo, Priority, FilterStatus } from '@/types/todo'

interface TodoStore {
  todos: Todo[]
  filter: FilterStatus
  isCompact: boolean
  isAlwaysOnTop: boolean
  setFilter: (filter: FilterStatus) => void
  setCompact: (enabled: boolean) => void
  setAlwaysOnTop: (enabled: boolean) => void
  addTodo: (
    title: string,
    priority?: Priority,
    dueDate?: string,
    memo?: string,
    dueTime?: string
  ) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
  reorderTodo: (sourceId: string, targetId: string) => void
}

export const useTodoStore = create<TodoStore>()(
  persist(
    immer((set) => ({
      todos: [],
      filter: 'today',
      isCompact: false,
      isAlwaysOnTop: false,
      setFilter: (filter) =>
        set((state) => {
          state.filter = filter
        }),
      setCompact: (enabled) =>
        set((state) => {
          state.isCompact = enabled
          if (!enabled) state.isAlwaysOnTop = false
        }),
      setAlwaysOnTop: (enabled) =>
        set((state) => {
          state.isAlwaysOnTop = enabled
        }),
      addTodo: (title, priority = 'medium', dueDate, memo, dueTime) =>
        set((state) => {
          state.todos.unshift({
            id: crypto.randomUUID(),
            title,
            completed: false,
            priority,
            dueDate,
            dueTime,
            memo,
            createdAt: new Date().toISOString(),
          })
        }),
      toggleTodo: (id) =>
        set((state) => {
          const todo = state.todos.find((t) => t.id === id)
          if (todo) todo.completed = !todo.completed
        }),
      deleteTodo: (id) =>
        set((state) => {
          state.todos = state.todos.filter((t) => t.id !== id)
        }),
      updateTodo: (id, updates) =>
        set((state) => {
          const todo = state.todos.find((t) => t.id === id)
          if (todo) Object.assign(todo, updates)
        }),
      reorderTodo: (sourceId, targetId) =>
        set((state) => {
          const sourceIndex = state.todos.findIndex((todo) => todo.id === sourceId)
          const targetIndex = state.todos.findIndex((todo) => todo.id === targetId)
          if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return
          const [moved] = state.todos.splice(sourceIndex, 1)
          state.todos.splice(targetIndex, 0, moved)
        }),
    })),
    {
      name: 'todo-store',
      partialize: (s) => ({
        todos: s.todos,
        isCompact: s.isCompact,
        isAlwaysOnTop: s.isAlwaysOnTop,
      }),
    }
  )
)
