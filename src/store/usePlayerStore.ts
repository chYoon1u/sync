import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Track, PlayerState } from '@/types/player'

interface PlayerStore {
  playlist: Track[]
  currentIndex: number
  playerState: PlayerState
  volume: number
  isRepeat: boolean
  isShuffle: boolean
  addTrack: (track: Omit<Track, 'id' | 'addedAt'>) => void
  removeTrack: (id: string) => void
  setCurrentIndex: (index: number) => void
  setPlayerState: (state: PlayerState) => void
  setVolume: (volume: number) => void
  toggleRepeat: () => void
  toggleShuffle: () => void
  playNext: () => void
  playPrev: () => void
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    immer((set, get) => ({
      playlist: [],
      currentIndex: 0,
      playerState: 'stopped',
      volume: 70,
      isRepeat: false,
      isShuffle: false,
      addTrack: (track) =>
        set((state) => {
          state.playlist.push({
            ...track,
            id: crypto.randomUUID(),
            addedAt: new Date().toISOString(),
          })
        }),
      removeTrack: (id) =>
        set((state) => {
          state.playlist = state.playlist.filter((t) => t.id !== id)
        }),
      setCurrentIndex: (index) =>
        set((state) => {
          state.currentIndex = index
        }),
      setPlayerState: (playerState) =>
        set((state) => {
          state.playerState = playerState
        }),
      setVolume: (volume) =>
        set((state) => {
          state.volume = volume
        }),
      toggleRepeat: () =>
        set((state) => {
          state.isRepeat = !state.isRepeat
        }),
      toggleShuffle: () =>
        set((state) => {
          state.isShuffle = !state.isShuffle
        }),
      playNext: () => {
        const { playlist, currentIndex, isShuffle } = get()
        if (!playlist.length) return
        set((state) => {
          if (isShuffle) {
            state.currentIndex = Math.floor(Math.random() * playlist.length)
          } else {
            state.currentIndex = (currentIndex + 1) % playlist.length
          }
        })
      },
      playPrev: () => {
        const { playlist, currentIndex } = get()
        if (!playlist.length) return
        set((state) => {
          state.currentIndex = (currentIndex - 1 + playlist.length) % playlist.length
        })
      },
    })),
    { name: 'player-store' }
  )
)
