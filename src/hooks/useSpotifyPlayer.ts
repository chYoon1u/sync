import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { transferPlayback } from '@/services/spotify'
import type { SpotifySDKPlayer } from '@/types/player'
import type { SpotifyPlaybackState } from '@/types/spotify'

let sdkLoaded = false

function loadSDKScript(): Promise<void> {
  if (sdkLoaded || window.Spotify) {
    sdkLoaded = true
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      sdkLoaded = true
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.head.appendChild(script)
  })
}

/**
 * Spotify Web Playback SDK를 초기화하고 전역 Zustand 스토어와 동기화.
 * App 루트에서 단 한 번 마운트해야 한다.
 */
export function useSpotifyPlayer() {
  const playerRef = useRef<SpotifySDKPlayer | null>(null)
  const { getValidToken, accessToken } = useAuthStore()
  const { setDeviceId, setSDKPlayer, setPlayerState, setProgress } = usePlayerStore()

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false

    const init = async () => {
      const token = await getValidToken()
      if (!token || cancelled) return

      await loadSDKScript()
      if (cancelled) return

      const player = new window.Spotify.Player({
        name: 'Sync Player',
        getOAuthToken: async (cb) => {
          const t = await getValidToken()
          if (t) cb(t)
        },
        volume: usePlayerStore.getState().volume / 100,
      })

      player.addListener('initialization_error', ({ message }) => {
        console.error('[Spotify SDK] init error:', message)
      })

      player.addListener('authentication_error', ({ message }) => {
        console.error('[Spotify SDK] auth error:', message)
        useAuthStore.getState().clearTokens()
      })

      player.addListener('account_error', ({ message }) => {
        console.error('[Spotify SDK] account error (Premium required):', message)
      })

      player.addListener('ready', async ({ device_id }) => {
        setDeviceId(device_id)
        const t = await getValidToken()
        if (t) {
          await transferPlayback(device_id, t).catch(console.error)
        }
      })

      player.addListener('not_ready', () => {
        setPlayerState('stopped')
      })

      player.addListener('player_state_changed', (state: SpotifyPlaybackState | null) => {
        if (!state) {
          setPlayerState('stopped')
          return
        }

        setPlayerState(state.paused ? 'paused' : 'playing')
        setProgress(state.position, state.duration)

        // SDK의 현재 트랙을 플레이리스트와 동기화
        const { playlist, currentIndex } = usePlayerStore.getState()
        const sdkUri = state.track_window.current_track?.uri
        if (sdkUri && playlist[currentIndex]?.uri !== sdkUri) {
          const idx = playlist.findIndex((t) => t.uri === sdkUri)
          if (idx !== -1) {
            usePlayerStore.setState((s) => ({ ...s, currentIndex: idx }))
          }
        }
      })

      const connected = await player.connect()
      if (!connected || cancelled) {
        player.disconnect()
        return
      }

      playerRef.current = player
      setSDKPlayer(player)
    }

    init()

    return () => {
      cancelled = true
      if (playerRef.current) {
        playerRef.current.disconnect()
        playerRef.current = null
        setSDKPlayer(null)
        setPlayerState('stopped')
      }
    }
    // accessToken 변경 시(로그인/로그아웃) SDK 재초기화
  }, [accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  return playerRef
}
