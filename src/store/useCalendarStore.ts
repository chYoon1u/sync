import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { CalendarEvent } from '@/types/calendar'

interface CalendarStore {
  events: CalendarEvent[]
  selectedDate: string
  isCollapsed: boolean
  setSelectedDate: (date: string) => void
  setCollapsed: (collapsed: boolean) => void
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void
  deleteEvent: (id: string) => void
  updateEvent: (id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => void
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    immer((set) => ({
      events: [],
      selectedDate: new Date().toISOString().split('T')[0],
      isCollapsed: false,
      setSelectedDate: (date) =>
        set((state) => {
          state.selectedDate = date
        }),
      setCollapsed: (collapsed) =>
        set((state) => {
          state.isCollapsed = collapsed
        }),
      addEvent: (event) =>
        set((state) => {
          state.events.push({ ...event, id: crypto.randomUUID() })
        }),
      deleteEvent: (id) =>
        set((state) => {
          state.events = state.events.filter((e) => e.id !== id)
        }),
      updateEvent: (id, updates) =>
        set((state) => {
          const event = state.events.find((e) => e.id === id)
          if (event) Object.assign(event, updates)
        }),
    })),
    { name: 'calendar-store' }
  )
)
