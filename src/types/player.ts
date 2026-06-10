export interface Track {
  id: string
  videoId: string
  title: string
  thumbnail: string
  addedAt: string
}

export type PlayerState = 'playing' | 'paused' | 'stopped'

export interface YouTubePlayer {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  loadVideoById(videoId: string): void
  setVolume(volume: number): void
  getPlayerState(): number
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          height?: string | number
          width?: string | number
          videoId?: string
          playerVars?: Record<string, unknown>
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => YouTubePlayer
      PlayerState: {
        UNSTARTED: -1
        ENDED: 0
        PLAYING: 1
        PAUSED: 2
        BUFFERING: 3
        CUED: 5
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}
