import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { PlaylistTrack, PlayerState, SpotifySDKPlayer } from '@/types/player'
import { playTracks, setRepeatMode, setShuffleMode } from '@/services/spotify'
import { useAuthStore } from './useAuthStore'

interface PlayerStore {
  // ── 퍼시스트 대상 ─────────────────────────────
  playlist: PlaylistTrack[]
  currentIndex: number
  volume: number
  isRepeat: boolean
  isShuffle: boolean

  // ── 런타임 전용 ───────────────────────────────
  playerState: PlayerState
  deviceId: string | null
  progressMs: number
  durationMs: number
  _sdkPlayer: SpotifySDKPlayer | null

  // ── 액션 ─────────────────────────────────────
  addTrack: (track: Omit<PlaylistTrack, 'id' | 'addedAt'>) => void
  removeTrack: (id: string) => void
  clearPlaylist: () => void

  setDeviceId: (id: string) => void
  setSDKPlayer: (player: SpotifySDKPlayer | null) => void
  setPlayerState: (state: PlayerState) => void
  setProgress: (ms: number, duration: number) => void

  /** 플레이리스트의 특정 인덱스 트랙 재생 */
  playAt: (index: number) => Promise<void>
  togglePlay: () => Promise<void>
  playNext: () => Promise<void>
  playPrev: () => Promise<void>
  setVolume: (volume: number) => Promise<void>
  toggleRepeat: () => Promise<void>
  toggleShuffle: () => Promise<void>
  seekTo: (ms: number) => Promise<void>
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    immer((set, get) => ({
      playlist: [],
      currentIndex: 0,
      volume: 70,
      isRepeat: false,
      isShuffle: false,

      playerState: 'stopped',
      deviceId: null,
      progressMs: 0,
      durationMs: 0,
      _sdkPlayer: null,

      addTrack: (track) =>
        set((s) => {
          const alreadyExists = s.playlist.some((t) => t.spotifyId === track.spotifyId)
          if (alreadyExists) return
          s.playlist.push({ ...track, id: crypto.randomUUID(), addedAt: new Date().toISOString() })
        }),

      removeTrack: (id) =>
        set((s) => {
          const idx = s.playlist.findIndex((t) => t.id === id)
          s.playlist = s.playlist.filter((t) => t.id !== id)
          if (idx <= s.currentIndex && s.currentIndex > 0) s.currentIndex -= 1
        }),

      clearPlaylist: () =>
        set((s) => {
          s.playlist = []
          s.currentIndex = 0
          s.playerState = 'stopped'
        }),

      setDeviceId: (id) => set((s) => { s.deviceId = id }),
      setSDKPlayer: (player) => set((s) => { s._sdkPlayer = player }),
      setPlayerState: (state) => set((s) => { s.playerState = state }),
      setProgress: (ms, duration) =>
        set((s) => {
          s.progressMs = ms
          s.durationMs = duration
        }),

      playAt: async (index) => {
        const { playlist, deviceId, _sdkPlayer } = get()
        if (!playlist.length || !deviceId || !_sdkPlayer) return

        const safeIndex = Math.max(0, Math.min(index, playlist.length - 1))
        set((s) => { s.currentIndex = safeIndex })

        const token = await useAuthStore.getState().getValidToken()
        if (!token) return

        const uris = playlist.map((t) => t.uri)
        await playTracks(deviceId, uris, token, safeIndex)
      },

      togglePlay: async () => {
        const { _sdkPlayer } = get()
        if (!_sdkPlayer) return
        await _sdkPlayer.togglePlay()
      },

      playNext: async () => {
        const { playlist, currentIndex, isShuffle, _sdkPlayer } = get()
        if (!playlist.length || !_sdkPlayer) return

        const next = isShuffle
          ? Math.floor(Math.random() * playlist.length)
          : (currentIndex + 1) % playlist.length

        await get().playAt(next)
      },

      playPrev: async () => {
        const { playlist, currentIndex, progressMs, _sdkPlayer } = get()
        if (!playlist.length || !_sdkPlayer) return

        // 3초 이상 재생 중이면 처음으로, 아니면 이전 트랙
        if (progressMs > 3000) {
          await _sdkPlayer.seek(0)
          return
        }

        const prev = (currentIndex - 1 + playlist.length) % playlist.length
        await get().playAt(prev)
      },

      setVolume: async (volume) => {
        set((s) => { s.volume = volume })
        const { _sdkPlayer } = get()
        if (_sdkPlayer) await _sdkPlayer.setVolume(volume / 100)
      },

      toggleRepeat: async () => {
        const next = !get().isRepeat
        set((s) => { s.isRepeat = next })
        const token = await useAuthStore.getState().getValidToken()
        if (token) await setRepeatMode(next ? 'track' : 'off', token)
      },

      toggleShuffle: async () => {
        const next = !get().isShuffle
        set((s) => { s.isShuffle = next })
        const token = await useAuthStore.getState().getValidToken()
        if (token) await setShuffleMode(next, token)
      },

      seekTo: async (ms) => {
        const { _sdkPlayer } = get()
        if (_sdkPlayer) await _sdkPlayer.seek(ms)
      },
    })),
    {
      name: 'player-store',
      partialize: (s) => ({
        playlist: s.playlist,
        currentIndex: s.currentIndex,
        volume: s.volume,
        isRepeat: s.isRepeat,
        isShuffle: s.isShuffle,
      }),
    }
  )
)
