import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { PlaylistTrack } from '@/types/player'

vi.mock('@/services/spotify', () => ({
  playTracks: vi.fn().mockResolvedValue(undefined),
  setRepeatMode: vi.fn().mockResolvedValue(undefined),
  setShuffleMode: vi.fn().mockResolvedValue(undefined),
  setVolume: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({ getValidToken: async () => 'mock-token' }),
  },
}))

const makeTrack = (n: number): Omit<PlaylistTrack, 'id' | 'addedAt'> => ({
  spotifyId: `spotify-id-${n}`,
  uri: `spotify:track:id${n}`,
  title: `Track ${n}`,
  artist: `Artist ${n}`,
  albumName: `Album ${n}`,
  albumArt: '',
  durationMs: 180000,
})

beforeEach(() => {
  usePlayerStore.setState({
    playlist: [],
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
  })
})

describe('usePlayerStore', () => {
  it('트랙을 추가한다', () => {
    act(() => usePlayerStore.getState().addTrack(makeTrack(1)))
    expect(usePlayerStore.getState().playlist).toHaveLength(1)
    expect(usePlayerStore.getState().playlist[0].title).toBe('Track 1')
  })

  it('중복 트랙 추가를 막는다', () => {
    act(() => usePlayerStore.getState().addTrack(makeTrack(1)))
    act(() => usePlayerStore.getState().addTrack(makeTrack(1)))
    expect(usePlayerStore.getState().playlist).toHaveLength(1)
  })

  it('트랙을 제거한다', () => {
    act(() => usePlayerStore.getState().addTrack(makeTrack(1)))
    const id = usePlayerStore.getState().playlist[0].id
    act(() => usePlayerStore.getState().removeTrack(id))
    expect(usePlayerStore.getState().playlist).toHaveLength(0)
  })

  it('전체 삭제 시 재생 복원 상태도 초기화한다', () => {
    act(() => {
      usePlayerStore.getState().addTrack(makeTrack(1))
      usePlayerStore.setState({ hasPlaybackHistory: true, lastPlayedSpotifyId: 'spotify-id-1' })
      usePlayerStore.getState().clearPlaylist()
    })

    expect(usePlayerStore.getState().playlist).toHaveLength(0)
    expect(usePlayerStore.getState().playerState).toBe('stopped')
    expect(usePlayerStore.getState().hasPlaybackHistory).toBe(false)
    expect(usePlayerStore.getState().lastPlayedSpotifyId).toBeNull()
  })

  it('볼륨을 설정한다', () => {
    act(() => {
      void usePlayerStore.getState().setVolume(50)
    })
    expect(usePlayerStore.getState().volume).toBe(50)
  })

  it('반복 재생 상태를 토글한다', async () => {
    await act(() => usePlayerStore.getState().toggleRepeat())
    expect(usePlayerStore.getState().isRepeat).toBe(true)
    await act(() => usePlayerStore.getState().toggleRepeat())
    expect(usePlayerStore.getState().isRepeat).toBe(false)
  })

  it('셔플 상태를 토글한다', async () => {
    await act(() => usePlayerStore.getState().toggleShuffle())
    expect(usePlayerStore.getState().isShuffle).toBe(true)
  })

  it('playNext 호출 시 다음 인덱스와 마지막 곡 정보를 갱신한다', async () => {
    act(() => {
      usePlayerStore.getState().addTrack(makeTrack(1))
      usePlayerStore.getState().addTrack(makeTrack(2))
      usePlayerStore.getState().setDeviceId('device-1')
      usePlayerStore.getState().setSDKPlayer({} as never)
      usePlayerStore.setState({ currentIndex: 0 })
    })

    await act(() => usePlayerStore.getState().playNext())

    expect(usePlayerStore.getState().currentIndex).toBe(1)
    expect(usePlayerStore.getState().hasPlaybackHistory).toBe(true)
    expect(usePlayerStore.getState().lastPlayedSpotifyId).toBe('spotify-id-2')
  })

  it('진행 상태를 업데이트한다', () => {
    act(() => usePlayerStore.getState().setProgress(30000, 180000))
    expect(usePlayerStore.getState().progressMs).toBe(30000)
    expect(usePlayerStore.getState().durationMs).toBe(180000)
  })
})
