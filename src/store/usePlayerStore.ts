import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  PlaylistTrack,
  PlayerState,
  SavedPlaylist,
  SpotifySDKPlayer,
} from '@/types/player'
import { playTracks, setRepeatMode, setShuffleMode } from '@/services/spotify'
import { useAuthStore } from './useAuthStore'
import { useUIStore } from './useUIStore'

interface PlayerStore {
  // ── 퍼시스트 대상 ─────────────────────────────
  playlist: PlaylistTrack[]
  savedPlaylists: SavedPlaylist[]
  currentIndex: number
  volume: number
  isRepeat: boolean
  isShuffle: boolean
  hasPlaybackHistory: boolean
  lastPlayedSpotifyId: string | null

  // ── 런타임 전용 ───────────────────────────────
  playerState: PlayerState
  deviceId: string | null
  progressMs: number
  durationMs: number
  _sdkPlayer: SpotifySDKPlayer | null
  pendingPlayIndex: number | null

  // ── 액션 ─────────────────────────────────────
  addTrack: (track: Omit<PlaylistTrack, 'id' | 'addedAt'>) => void
  removeTrack: (id: string) => void
  clearPlaylist: () => void
  reorderQueue: (fromIndex: number, toIndex: number) => void
  createSavedPlaylist: (name: string) => boolean
  renameSavedPlaylist: (id: string, name: string) => void
  deleteSavedPlaylist: (id: string) => void
  loadSavedPlaylist: (id: string) => void
  reorderSavedPlaylist: (fromIndex: number, toIndex: number) => void
  reorderSavedPlaylistTrack: (
    playlistId: string,
    fromIndex: number,
    toIndex: number
  ) => void

  setDeviceId: (id: string) => void
  setSDKPlayer: (player: SpotifySDKPlayer | null) => void
  setPlayerState: (state: PlayerState) => void
  setProgress: (ms: number, duration: number) => void

  /** 플레이리스트의 특정 인덱스 트랙 재생 */
  playAt: (index: number, positionMs?: number) => Promise<void>
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
      savedPlaylists: [],
      currentIndex: 0,
      volume: 70,
      isRepeat: false,
      isShuffle: false,
      hasPlaybackHistory: false,
      lastPlayedSpotifyId: null,

      playerState: 'stopped',
      deviceId: null,
      progressMs: 0,
      durationMs: 0,
      _sdkPlayer: null,
      pendingPlayIndex: null,

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
          if (s.playlist.length === 0) {
            s.currentIndex = 0
            s.progressMs = 0
            s.durationMs = 0
            s.hasPlaybackHistory = false
            s.lastPlayedSpotifyId = null
            s.playerState = 'stopped'
          } else if (idx === s.currentIndex) {
            s.lastPlayedSpotifyId = s.playlist[s.currentIndex]?.spotifyId ?? null
          }
        }),

      clearPlaylist: () =>
        set((s) => {
          s.playlist = []
          s.currentIndex = 0
          s.progressMs = 0
          s.durationMs = 0
          s.hasPlaybackHistory = false
          s.lastPlayedSpotifyId = null
          s.playerState = 'stopped'
        }),

      reorderQueue: (fromIndex, toIndex) =>
        set((s) => {
          if (
            fromIndex === toIndex ||
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= s.playlist.length ||
            toIndex >= s.playlist.length
          ) return

          const [track] = s.playlist.splice(fromIndex, 1)
          s.playlist.splice(toIndex, 0, track)

          if (s.currentIndex === fromIndex) {
            s.currentIndex = toIndex
          } else if (fromIndex < s.currentIndex && toIndex >= s.currentIndex) {
            s.currentIndex -= 1
          } else if (fromIndex > s.currentIndex && toIndex <= s.currentIndex) {
            s.currentIndex += 1
          }
        }),

      createSavedPlaylist: (name) => {
        const trimmedName = name.trim()
        if (!trimmedName || get().playlist.length === 0) return false

        set((s) => {
          const now = new Date().toISOString()
          s.savedPlaylists.push({
            id: crypto.randomUUID(),
            name: trimmedName,
            tracks: s.playlist.map((track) => ({ ...track })),
            createdAt: now,
            updatedAt: now,
          })
        })
        return true
      },

      renameSavedPlaylist: (id, name) =>
        set((s) => {
          const trimmedName = name.trim()
          const savedPlaylist = s.savedPlaylists.find((item) => item.id === id)
          if (!savedPlaylist || !trimmedName) return
          savedPlaylist.name = trimmedName
          savedPlaylist.updatedAt = new Date().toISOString()
        }),

      deleteSavedPlaylist: (id) =>
        set((s) => {
          s.savedPlaylists = s.savedPlaylists.filter((item) => item.id !== id)
        }),

      loadSavedPlaylist: (id) =>
        set((s) => {
          const savedPlaylist = s.savedPlaylists.find((item) => item.id === id)
          if (!savedPlaylist) return

          s.playlist = savedPlaylist.tracks.map((track) => ({
            ...track,
            id: crypto.randomUUID(),
            addedAt: new Date().toISOString(),
          }))
          s.currentIndex = 0
          s.progressMs = 0
          s.durationMs = s.playlist[0]?.durationMs ?? 0
          s.hasPlaybackHistory = false
          s.lastPlayedSpotifyId = null
          s.pendingPlayIndex = null
          s.playerState = 'stopped'
        }),

      reorderSavedPlaylist: (fromIndex, toIndex) =>
        set((s) => {
          if (
            fromIndex === toIndex ||
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= s.savedPlaylists.length ||
            toIndex >= s.savedPlaylists.length
          ) return
          const [savedPlaylist] = s.savedPlaylists.splice(fromIndex, 1)
          s.savedPlaylists.splice(toIndex, 0, savedPlaylist)
        }),

      reorderSavedPlaylistTrack: (playlistId, fromIndex, toIndex) =>
        set((s) => {
          const savedPlaylist = s.savedPlaylists.find((item) => item.id === playlistId)
          if (
            !savedPlaylist ||
            fromIndex === toIndex ||
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= savedPlaylist.tracks.length ||
            toIndex >= savedPlaylist.tracks.length
          ) return
          const [track] = savedPlaylist.tracks.splice(fromIndex, 1)
          savedPlaylist.tracks.splice(toIndex, 0, track)
          savedPlaylist.updatedAt = new Date().toISOString()
        }),

      setDeviceId: (id) => set((s) => { s.deviceId = id }),
      setSDKPlayer: (player) => set((s) => { s._sdkPlayer = player }),
      setPlayerState: (state) => set((s) => { s.playerState = state }),
      setProgress: (ms, duration) =>
        set((s) => {
          s.progressMs = ms
          s.durationMs = duration
        }),

      playAt: async (index, positionMs = 0) => {
        const { playlist, deviceId, _sdkPlayer } = get()
        if (!playlist.length) return

        const safeIndex = Math.max(0, Math.min(index, playlist.length - 1))
        set((s) => {
          s.currentIndex = safeIndex
          s.hasPlaybackHistory = true
          s.lastPlayedSpotifyId = playlist[safeIndex]?.spotifyId ?? null
          s.pendingPlayIndex = deviceId && _sdkPlayer ? null : safeIndex
        })

        if (!deviceId || !_sdkPlayer) {
          useUIStore.getState().requestSpotifySDK()
          return
        }

        const token = await useAuthStore.getState().getValidToken()
        if (!token) return

        const uris = playlist.map((t) => t.uri)
        await playTracks(deviceId, uris, token, safeIndex, positionMs)
      },

      togglePlay: async () => {
        const { _sdkPlayer } = get()
        if (!_sdkPlayer) return
        await _sdkPlayer.togglePlay()
      },

      playNext: async () => {
        const { playlist, currentIndex, isShuffle, _sdkPlayer } = get()
        if (playlist.length <= 1) {
          if (_sdkPlayer) {
            await _sdkPlayer.seek(0)
          } else if (playlist.length === 1) {
            await get().playAt(0)
          }
          return
        }

        const next = isShuffle
          ? Math.floor(Math.random() * playlist.length)
          : (currentIndex + 1) % playlist.length

        await get().playAt(next)
      },

      playPrev: async () => {
        const { playlist, currentIndex, _sdkPlayer } = get()
        if (playlist.length <= 1) {
          if (_sdkPlayer) {
            await _sdkPlayer.seek(0)
          } else if (playlist.length === 1) {
            await get().playAt(0)
          }
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
        savedPlaylists: s.savedPlaylists,
        currentIndex: s.currentIndex,
        volume: s.volume,
        isRepeat: s.isRepeat,
        isShuffle: s.isShuffle,
        hasPlaybackHistory: s.hasPlaybackHistory,
        lastPlayedSpotifyId: s.lastPlayedSpotifyId,
        progressMs: s.progressMs,
        durationMs: s.durationMs,
      }),
    }
  )
)
