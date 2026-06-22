import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Todo, Priority, FilterStatus, RoutineTemplate } from '@/types/todo'
import { addDays, dateRange, localDateKey } from '@/utils/todo'

interface TodoStore {
  todos: Todo[]
  routines: RoutineTemplate[]
  dismissedRoutineOccurrences: string[]
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
    dueTime?: string,
    endDate?: string
  ) => void
  addRoutine: (routine: Omit<RoutineTemplate, 'id' | 'createdAt'>) => void
  deleteRoutine: (id: string) => void
  materializeRoutines: (fromDate?: string, days?: number) => void
  moveTodoToNextDay: (id: string) => void
  setTodoPeriod: (id: string, endDate: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
  reorderTodo: (sourceId: string, targetId: string) => void
}

export const useTodoStore = create<TodoStore>()(
  persist(
    immer((set) => ({
      todos: [],
      routines: [],
      dismissedRoutineOccurrences: [],
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
      addTodo: (title, priority = 'medium', dueDate, memo, dueTime, endDate) =>
        set((state) => {
          const periodDates = dueDate && endDate ? dateRange(dueDate, endDate) : []
          const dates = periodDates.length > 0 ? periodDates : [dueDate]
          const seriesId = dates.length > 1 ? crypto.randomUUID() : undefined
          const createdAt = new Date().toISOString()
          for (const date of [...dates].reverse()) {
            state.todos.unshift({
              id: crypto.randomUUID(),
              title,
              completed: false,
              priority,
              dueDate: date,
              dueTime,
              memo,
              seriesId,
              createdAt,
            })
          }
        }),
      addRoutine: (routine) =>
        set((state) => {
          const template: RoutineTemplate = {
            ...routine,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          }
          state.routines.unshift(template)
          const dates = template.scheduledDate
            ? [template.scheduledDate]
            : dateRange(localDateKey(), addDays(localDateKey(), 89)).filter((date) =>
                template.weekdays.includes(new Date(`${date}T12:00:00`).getDay())
              )
          for (const date of [...dates].reverse()) {
            state.todos.unshift(createRoutineTodo(template, date))
          }
        }),
      deleteRoutine: (id) =>
        set((state) => {
          state.routines = state.routines.filter((routine) => routine.id !== id)
        }),
      materializeRoutines: (fromDate = localDateKey(), days = 90) =>
        set((state) => {
          const endDate = addDays(fromDate, days - 1)
          for (const routine of state.routines) {
            const dates = routine.scheduledDate
              ? routine.scheduledDate >= fromDate && routine.scheduledDate <= endDate
                ? [routine.scheduledDate]
                : []
              : dateRange(fromDate, endDate).filter((date) =>
                  routine.weekdays.includes(new Date(`${date}T12:00:00`).getDay())
                )
            for (const date of dates) {
              const exists = state.todos.some(
                (todo) => todo.routineId === routine.id && todo.dueDate === date
              )
              const occurrenceKey = `${routine.id}:${date}`
              if (!exists && !state.dismissedRoutineOccurrences.includes(occurrenceKey)) {
                state.todos.push(createRoutineTodo(routine, date))
              }
            }
          }
        }),
      moveTodoToNextDay: (id) =>
        set((state) => {
          const todo = state.todos.find((item) => item.id === id)
          if (todo?.dueDate && !todo.completed) todo.dueDate = addDays(todo.dueDate, 1)
        }),
      setTodoPeriod: (id, endDate) =>
        set((state) => {
          const todo = state.todos.find((item) => item.id === id)
          if (!todo?.dueDate || endDate <= todo.dueDate) return
          const seriesId = todo.seriesId ?? crypto.randomUUID()
          todo.seriesId = seriesId
          const existingDates = new Set(
            state.todos
              .filter((item) => item.seriesId === seriesId)
              .map((item) => item.dueDate)
          )
          for (const date of dateRange(addDays(todo.dueDate, 1), endDate)) {
            if (existingDates.has(date)) continue
            state.todos.push({
              ...todo,
              id: crypto.randomUUID(),
              completed: false,
              dueDate: date,
              createdAt: new Date().toISOString(),
            })
          }
        }),
      toggleTodo: (id) =>
        set((state) => {
          const todo = state.todos.find((t) => t.id === id)
          if (todo) todo.completed = !todo.completed
        }),
      deleteTodo: (id) =>
        set((state) => {
          const todo = state.todos.find((item) => item.id === id)
          if (todo?.routineId && todo.dueDate) {
            const occurrenceKey = `${todo.routineId}:${todo.dueDate}`
            if (!state.dismissedRoutineOccurrences.includes(occurrenceKey)) {
              state.dismissedRoutineOccurrences.push(occurrenceKey)
            }
          }
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
        routines: s.routines,
        dismissedRoutineOccurrences: s.dismissedRoutineOccurrences,
        isCompact: s.isCompact,
        isAlwaysOnTop: s.isAlwaysOnTop,
      }),
    }
  )
)

function createRoutineTodo(routine: RoutineTemplate, dueDate: string): Todo {
  return {
    id: crypto.randomUUID(),
    title: routine.title,
    completed: false,
    priority: routine.priority,
    dueDate,
    dueTime: routine.dueTime,
    memo: routine.memo,
    routineId: routine.id,
    createdAt: new Date().toISOString(),
  }
}
