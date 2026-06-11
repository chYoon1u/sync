export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyArtist {
  id: string
  name: string
  uri: string
}

export interface SpotifyAlbum {
  id: string
  name: string
  images: SpotifyImage[]
  uri: string
}

export interface SpotifyTrack {
  id: string
  name: string
  uri: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  duration_ms: number
  preview_url: string | null
  explicit: boolean
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
    total: number
    next: string | null
  }
}

export interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  scope: string
  expires_in: number
  refresh_token?: string
}

// Web Playback SDK 상태
export interface SpotifyPlaybackState {
  context: {
    uri: string | null
    metadata: Record<string, unknown> | null
  }
  disallows: Record<string, boolean>
  duration: number
  paused: boolean
  position: number
  repeat_mode: 0 | 1 | 2
  shuffle: boolean
  track_window: {
    current_track: SpotifyWebTrack
    previous_tracks: SpotifyWebTrack[]
    next_tracks: SpotifyWebTrack[]
  }
}

export interface SpotifyWebTrack {
  id: string
  uri: string
  name: string
  duration_ms: number
  artists: Array<{ name: string; uri: string }>
  album: {
    name: string
    uri: string
    images: SpotifyImage[]
  }
}
