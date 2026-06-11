import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { transferPlayback } from '@/services/spotify'
import type { SpotifySDKPlayer } from '@/types/player'
import type { SpotifyPlaybackState } from '@/types/spotify'

let sdkLoaded = false
let sdkLoadPromise: Promise<void> | null = null

export function loadSpotifySDKScript(): Promise<void> {
  if (sdkLoaded || window.Spotify) {
    sdkLoaded = true
    return Promise.resolve()
  }
  if (sdkLoadPromise) return sdkLoadPromise

  sdkLoadPromise = new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      sdkLoadPromise = null
      reject(new Error('Spotify 플레이어 SDK 연결 시간이 초과되었습니다.'))
    }, 15000)

    window.onSpotifyWebPlaybackSDKReady = () => {
      window.clearTimeout(timeoutId)
      sdkLoaded = true
      resolve()
    }

    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    script.addEventListener('error', () => {
      window.clearTimeout(timeoutId)
      sdkLoadPromise = null
      reject(new Error('Spotify 플레이어 SDK를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.'))
    }, { once: true })
    document.head.appendChild(script)
  })

  return sdkLoadPromise
}

/**
 * Spotify Web Playback SDK를 초기화하고 전역 Zustand 스토어와 동기화.
 * App 루트에서 단 한 번 마운트해야 한다.
 */
export function useSpotifyPlayer(enabled = true) {
  const playerRef = useRef<SpotifySDKPlayer | null>(null)
  const { getValidToken, accessToken } = useAuthStore()
  const { setDeviceId, setSDKPlayer, setPlayerState, setProgress } = usePlayerStore()
  const isAuthenticated = Boolean(accessToken)

  useEffect(() => {
    if (!isAuthenticated || !enabled) return

    let cancelled = false
    let progressTimer: number | null = null

    const init = async () => {
      try {
        const token = await getValidToken()
        if (!token || cancelled) return

        await loadSpotifySDKScript()
        if (cancelled) return

        const player = new window.Spotify.Player({
          name: 'Sync Player',
          getOAuthToken: async (cb) => {
            const t = await getValidToken()
            if (t) cb(t)
          },
          volume: usePlayerStore.getState().volume / 100,
        })

        // The ready event can fire before connect() resolves, so expose the
        // SDK bridge before restore playback calls playAt().
        playerRef.current = player
        setSDKPlayer(player)

        player.addListener('initialization_error', ({ message }) => {
          console.error('[Spotify SDK] init error:', message)
          useAuthStore.getState().setAuthError(`Spotify 플레이어 초기화 실패: ${message}`)
        })

        player.addListener('authentication_error', ({ message }) => {
          console.error('[Spotify SDK] auth error:', message)
          useAuthStore.getState().setAuthError(`Spotify 인증 오류: ${message}`)
          useAuthStore.getState().clearTokens()
        })

        player.addListener('account_error', ({ message }) => {
          console.error('[Spotify SDK] account error (Premium required):', message)
          useAuthStore.getState().setAuthError(
            `Spotify Premium 계정과 앱 사용자 등록 상태를 확인해 주세요: ${message}`
          )
        })

        player.addListener('ready', async ({ device_id }) => {
          setDeviceId(device_id)
          const t = await getValidToken()
          if (t) {
            await transferPlayback(device_id, t).catch(console.error)
            const {
              playlist,
              currentIndex,
              progressMs,
              hasPlaybackHistory,
              lastPlayedSpotifyId,
              pendingPlayIndex,
              playAt,
            } = usePlayerStore.getState()
            const resumeIndex = pendingPlayIndex ?? (lastPlayedSpotifyId
              ? playlist.findIndex((track) => track.spotifyId === lastPlayedSpotifyId)
              : currentIndex)

            if (playlist[resumeIndex]) {
              await playAt(
                resumeIndex,
                pendingPlayIndex === null && hasPlaybackHistory ? progressMs : 0
              ).catch(console.error)
            }
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
              usePlayerStore.setState((s) => ({
                ...s,
                currentIndex: idx,
                hasPlaybackHistory: true,
                lastPlayedSpotifyId: playlist[idx]?.spotifyId ?? null,
              }))
            }
          }
        })

        const connected = await player.connect()
        if (!connected || cancelled) {
          player.disconnect()
          playerRef.current = null
          setSDKPlayer(null)
          return
        }

        progressTimer = window.setInterval(async () => {
          const state = await player.getCurrentState().catch(() => null)
          if (state) setProgress(state.position, state.duration)
        }, 1000)
      } catch (error) {
        console.error('[Spotify SDK] connection error:', error)
        useAuthStore.getState().setAuthError(
          error instanceof Error ? error.message : 'Spotify 플레이어 연결에 실패했습니다.'
        )
      }
    }

    init()

    return () => {
      cancelled = true
      if (progressTimer !== null) window.clearInterval(progressTimer)
      if (playerRef.current) {
        playerRef.current.disconnect()
        playerRef.current = null
        setSDKPlayer(null)
        setPlayerState('stopped')
      }
    }
    // Token refreshes must not disconnect and recreate the active player.
  }, [enabled, isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  return playerRef
}
