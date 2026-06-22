import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PlannerBlock {
  id: string
  date: string
  title: string
  startMinute: number
  endMinute: number
}

export interface PlannerGoal {
  id: string
  date: string
  title: string
  completed: boolean
}

interface TimeTrackerStore {
  blocks: PlannerBlock[]
  goals: PlannerGoal[]
  addBlock: (
    date: string,
    title: string,
    startMinute: number,
    endMinute: number
  ) => void
  deleteBlock: (id: string) => void
  addGoal: (date: string, title: string) => void
  toggleGoal: (id: string) => void
  deleteGoal: (id: string) => void
}

function clampMinute(value: number): number {
  return Math.max(0, Math.min(1740, Math.round(value / 10) * 10))
}

export const useTimeTrackerStore = create<TimeTrackerStore>()(
  persist(
    (set) => ({
      blocks: [],
      goals: [],
      addBlock: (date, title, startMinute, endMinute) => {
        const trimmed = title.trim()
        const start = clampMinute(Math.min(startMinute, endMinute))
        const end = clampMinute(Math.max(startMinute, endMinute))
        if (!trimmed || start === end) return
        set((state) => ({
          blocks: [
            ...state.blocks,
            {
              id: crypto.randomUUID(),
              date,
              title: trimmed,
              startMinute: start,
              endMinute: end,
            },
          ],
        }))
      },
      deleteBlock: (id) =>
        set((state) => ({ blocks: state.blocks.filter((block) => block.id !== id) })),
      addGoal: (date, title) => {
        const trimmed = title.trim()
        if (!trimmed) return
        set((state) => ({
          goals: [
            ...state.goals,
            { id: crypto.randomUUID(), date, title: trimmed, completed: false },
          ],
        }))
      },
      toggleGoal: (id) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
          ),
        })),
      deleteGoal: (id) =>
        set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) })),
    }),
    {
      name: 'time-tracker-store',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<TimeTrackerStore>
        return {
          ...state,
          blocks: state.blocks ?? [],
          goals: state.goals ?? [],
        }
      },
    }
  )
)
