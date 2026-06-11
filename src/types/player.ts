import type { SpotifyTrack, SpotifyPlaybackState } from './spotify'

export type PlayerState = 'playing' | 'paused' | 'stopped'

export interface PlaylistTrack {
  id: string
  spotifyId: string
  uri: string
  title: string
  artist: string
  albumName: string
  albumArt: string
  durationMs: number
  addedAt: string
}

export interface SavedPlaylist {
  id: string
  name: string
  tracks: PlaylistTrack[]
  createdAt: string
  updatedAt: string
}

export function spotifyTrackToPlaylistTrack(
  track: SpotifyTrack
): Omit<PlaylistTrack, 'id' | 'addedAt'> {
  return {
    spotifyId: track.id,
    uri: track.uri,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    albumName: track.album.name,
    albumArt: track.album.images[0]?.url ?? '',
    durationMs: track.duration_ms,
  }
}

// Spotify Web Playback SDK
export interface SpotifySDKPlayer {
  connect(): Promise<boolean>
  disconnect(): void
  addListener(event: 'ready', cb: (data: { device_id: string }) => void): boolean
  addListener(event: 'not_ready', cb: (data: { device_id: string }) => void): boolean
  addListener(
    event: 'player_state_changed',
    cb: (state: SpotifyPlaybackState | null) => void
  ): boolean
  addListener(event: 'initialization_error', cb: (err: { message: string }) => void): boolean
  addListener(event: 'authentication_error', cb: (err: { message: string }) => void): boolean
  addListener(event: 'account_error', cb: (err: { message: string }) => void): boolean
  removeListener(event: string): boolean
  getCurrentState(): Promise<SpotifyPlaybackState | null>
  setVolume(volume: number): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  togglePlay(): Promise<void>
  seek(position_ms: number): Promise<void>
  previousTrack(): Promise<void>
  nextTrack(): Promise<void>
}

declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
        volume?: number
      }) => SpotifySDKPlayer
    }
    onSpotifyWebPlaybackSDKReady: () => void
  }
}
