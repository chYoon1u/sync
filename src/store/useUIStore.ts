import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  activeTab: AppTab
  isDarkMode: boolean
  accentColor: AccentColor
  customAccent: string
  isSpotifySDKRequested: boolean
  setDarkMode: (enabled: boolean) => void
  toggleDarkMode: () => void
  setAccentColor: (color: AccentColor) => void
  setCustomAccent: (color: string) => void
  requestSpotifySDK: () => void
  setActiveTab: (tab: AppTab) => void
}

export type AccentColor = 'lime' | 'sage' | 'blue' | 'coral' | 'custom'
export type AppTab = 'schedule' | 'timer' | 'todo' | 'calendar'

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      activeTab: 'schedule',
      isDarkMode: false,
      accentColor: 'lime',
      customAccent: '#839b51',
      isSpotifySDKRequested: false,
      setDarkMode: (enabled) => set({ isDarkMode: enabled }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setAccentColor: (accentColor) => set({ accentColor }),
      setCustomAccent: (customAccent) =>
        set({ customAccent, accentColor: 'custom' }),
      requestSpotifySDK: () => set({ isSpotifySDKRequested: true }),
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        accentColor: state.accentColor,
        customAccent: state.customAccent,
        activeTab: state.activeTab,
      }),
    }
  )
)
