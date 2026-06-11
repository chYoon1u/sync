import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { PlaylistTrack } from '@/types/player'

// Spotify API 모킹 (실제 네트워크 호출 방지)
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
    playerState: 'stopped',
    deviceId: null,
    progressMs: 0,
    durationMs: 0,
    _sdkPlayer: null,
  })
})

describe('usePlayerStore', () => {
  it('트랙 추가', () => {
    act(() => usePlayerStore.getState().addTrack(makeTrack(1)))
    expect(usePlayerStore.getState().playlist).toHaveLength(1)
    expect(usePlayerStore.getState().playlist[0].title).toBe('Track 1')
  })

  it('중복 트랙 추가 방지', () => {
    act(() => usePlayerStore.getState().addTrack(makeTrack(1)))
    act(() => usePlayerStore.getState().addTrack(makeTrack(1)))
    expect(usePlayerStore.getState().playlist).toHaveLength(1)
  })

  it('트랙 삭제', () => {
    act(() => usePlayerStore.getState().addTrack(makeTrack(1)))
    const id = usePlayerStore.getState().playlist[0].id
    act(() => usePlayerStore.getState().removeTrack(id))
    expect(usePlayerStore.getState().playlist).toHaveLength(0)
  })

  it('전체 삭제', () => {
    act(() => usePlayerStore.getState().addTrack(makeTrack(1)))
    act(() => usePlayerStore.getState().addTrack(makeTrack(2)))
    act(() => usePlayerStore.getState().clearPlaylist())
    expect(usePlayerStore.getState().playlist).toHaveLength(0)
    expect(usePlayerStore.getState().playerState).toBe('stopped')
  })

  it('볼륨 설정', () => {
    act(() => usePlayerStore.getState().setVolume(50))
    expect(usePlayerStore.getState().volume).toBe(50)
  })

  it('반복 토글', async () => {
    await act(() => usePlayerStore.getState().toggleRepeat())
    expect(usePlayerStore.getState().isRepeat).toBe(true)
    await act(() => usePlayerStore.getState().toggleRepeat())
    expect(usePlayerStore.getState().isRepeat).toBe(false)
  })

  it('셔플 토글', async () => {
    await act(() => usePlayerStore.getState().toggleShuffle())
    expect(usePlayerStore.getState().isShuffle).toBe(true)
  })

  it('playNext — 순환', async () => {
    act(() => {
      usePlayerStore.getState().addTrack(makeTrack(1))
      usePlayerStore.getState().addTrack(makeTrack(2))
    })
    // SDK 없으면 동작 안함, deviceId 설정 필요
    act(() => usePlayerStore.getState().setDeviceId('device-1'))
    // SDK Player mock
    act(() => usePlayerStore.getState().setSDKPlayer({} as never))
    // playAt은 spotify API를 호출하므로 index 변경만 검증
    act(() => usePlayerStore.setState({ currentIndex: 0 }))
    await act(() => usePlayerStore.getState().playNext())
    expect(usePlayerStore.getState().currentIndex).toBe(1)
  })

  it('진행 상태 업데이트', () => {
    act(() => usePlayerStore.getState().setProgress(30000, 180000))
    expect(usePlayerStore.getState().progressMs).toBe(30000)
    expect(usePlayerStore.getState().durationMs).toBe(180000)
  })
})
