import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  isDarkMode: boolean
  accentColor: AccentColor
  setDarkMode: (enabled: boolean) => void
  toggleDarkMode: () => void
  setAccentColor: (color: AccentColor) => void
}

export type AccentColor = 'lime' | 'sage' | 'blue' | 'coral'

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      accentColor: 'lime',
      setDarkMode: (enabled) => set({ isDarkMode: enabled }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setAccentColor: (accentColor) => set({ accentColor }),
    }),
    { name: 'ui-store' }
  )
)
