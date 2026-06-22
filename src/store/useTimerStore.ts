import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TimerStep {
  id: string
  label: string
  durationSeconds: number
}

export interface TimerRoutine {
  id: string
  name: string
  steps: TimerStep[]
  repeat: boolean
  scheduledTime?: string
  lastAutoStartDate?: string
}

interface TimerStore {
  routines: TimerRoutine[]
  status: 'idle' | 'running' | 'paused'
  label: string
  remainingSeconds: number
  endsAt: number | null
  activeRoutineId: string | null
  stepIndex: number
  completionSerial: number
  start: (seconds: number, label?: string) => void
  pause: () => void
  resume: () => void
  reset: () => void
  tick: (now?: number) => void
  addRoutine: (
    name: string,
    steps: Array<Omit<TimerStep, 'id'>>,
    repeat: boolean,
    scheduledTime?: string
  ) => void
  deleteRoutine: (id: string) => void
  startRoutine: (id: string, autoStartDate?: string) => void
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      routines: [],
      status: 'idle',
      label: '타이머',
      remainingSeconds: 0,
      endsAt: null,
      activeRoutineId: null,
      stepIndex: 0,
      completionSerial: 0,
      start: (seconds, label = '타이머') => {
        const safeSeconds = Math.max(1, Math.floor(seconds))
        set({
          status: 'running',
          label,
          remainingSeconds: safeSeconds,
          endsAt: Date.now() + safeSeconds * 1000,
          activeRoutineId: null,
          stepIndex: 0,
        })
      },
      pause: () => {
        const { status, endsAt } = get()
        if (status !== 'running' || endsAt === null) return
        set({
          status: 'paused',
          remainingSeconds: Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)),
          endsAt: null,
        })
      },
      resume: () => {
        const { status, remainingSeconds } = get()
        if (status !== 'paused' || remainingSeconds <= 0) return
        set({
          status: 'running',
          endsAt: Date.now() + remainingSeconds * 1000,
        })
      },
      reset: () =>
        set({
          status: 'idle',
          label: '타이머',
          remainingSeconds: 0,
          endsAt: null,
          activeRoutineId: null,
          stepIndex: 0,
        }),
      tick: (now = Date.now()) => {
        const state = get()
        if (state.status !== 'running' || state.endsAt === null) return
        const remaining = Math.max(0, Math.ceil((state.endsAt - now) / 1000))
        if (remaining > 0) {
          set({ remainingSeconds: remaining })
          return
        }

        const routine = state.routines.find((item) => item.id === state.activeRoutineId)
        const nextIndex = state.stepIndex + 1
        if (routine && routine.steps[nextIndex]) {
          const step = routine.steps[nextIndex]
          set({
            completionSerial: state.completionSerial + 1,
            stepIndex: nextIndex,
            label: step.label,
            remainingSeconds: step.durationSeconds,
            endsAt: now + step.durationSeconds * 1000,
          })
          return
        }
        if (routine?.repeat && routine.steps[0]) {
          const step = routine.steps[0]
          set({
            completionSerial: state.completionSerial + 1,
            stepIndex: 0,
            label: step.label,
            remainingSeconds: step.durationSeconds,
            endsAt: now + step.durationSeconds * 1000,
          })
          return
        }
        set({
          completionSerial: state.completionSerial + 1,
          status: 'idle',
          remainingSeconds: 0,
          endsAt: null,
          activeRoutineId: null,
          stepIndex: 0,
        })
      },
      addRoutine: (name, steps, repeat, scheduledTime) => {
        const trimmed = name.trim()
        const validSteps = steps.filter((step) => step.durationSeconds > 0)
        if (!trimmed || validSteps.length === 0) return
        set((state) => ({
          routines: [
            ...state.routines,
            {
              id: crypto.randomUUID(),
              name: trimmed,
              steps: validSteps.map((step) => ({ ...step, id: crypto.randomUUID() })),
              repeat,
              scheduledTime: scheduledTime || undefined,
            },
          ],
        }))
      },
      deleteRoutine: (id) =>
        set((state) => ({ routines: state.routines.filter((routine) => routine.id !== id) })),
      startRoutine: (id, autoStartDate) => {
        const routine = get().routines.find((item) => item.id === id)
        const step = routine?.steps[0]
        if (!routine || !step) return
        set((state) => ({
          routines: state.routines.map((item) =>
            item.id === id && autoStartDate
              ? { ...item, lastAutoStartDate: autoStartDate }
              : item
          ),
          status: 'running',
          label: step.label,
          remainingSeconds: step.durationSeconds,
          endsAt: Date.now() + step.durationSeconds * 1000,
          activeRoutineId: id,
          stepIndex: 0,
        }))
      },
    }),
    {
      name: 'timer-store',
      partialize: (state) => ({
        routines: state.routines,
        status: state.status,
        label: state.label,
        remainingSeconds: state.remainingSeconds,
        endsAt: state.endsAt,
        activeRoutineId: state.activeRoutineId,
        stepIndex: state.stepIndex,
      }),
    }
  )
)
