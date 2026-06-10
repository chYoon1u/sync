import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Todo, Priority } from '@/types/todo'

interface TodoStore {
  todos: Todo[]
  addTodo: (title: string, priority?: Priority, dueDate?: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
}

export const useTodoStore = create<TodoStore>()(
  persist(
    immer((set) => ({
      todos: [],
      addTodo: (title, priority = 'medium', dueDate) =>
        set((state) => {
          state.todos.push({
            id: crypto.randomUUID(),
            title,
            completed: false,
            priority,
            dueDate,
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
    })),
    { name: 'todo-store' }
  )
)
