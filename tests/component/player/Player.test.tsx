import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerView } from '@/components/player/PlayerView'
import { useAuthStore } from '@/store/useAuthStore'
import { usePlayerStore } from '@/store/usePlayerStore'

vi.mock('@/services/spotifyAuth', () => ({
  initiateLogin: vi.fn(),
}))

vi.mock('@/services/spotify', () => ({
  searchTracks: vi.fn().mockResolvedValue([]),
  playTracks: vi.fn().mockResolvedValue(undefined),
  setRepeatMode: vi.fn().mockResolvedValue(undefined),
  setShuffleMode: vi.fn().mockResolvedValue(undefined),
}))

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

  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isInitializing: false,
    authError: null,
  })
})

describe('PlayerView', () => {
  it('로그아웃 상태에서 로그인 버튼을 표시한다', () => {
    render(<PlayerView />)
    expect(screen.getByRole('button', { name: 'Spotify로 로그인' })).toBeInTheDocument()
  })

  it('곡 추가 버튼으로 검색 모달을 연다', async () => {
    useAuthStore.setState({
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      expiresAt: Date.now() + 3600000,
      isInitializing: false,
      authError: null,
    })

    const user = userEvent.setup()
    render(<PlayerView />)

    await user.click(screen.getByRole('button', { name: '곡 추가' }))

    expect(screen.getByPlaceholderText('노래 제목 또는 아티스트 검색')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: '플레이리스트에 곡 추가' })).toBeInTheDocument()
  })

  it('플레이리스트 버튼으로 목록 팝업을 연다', async () => {
    useAuthStore.setState({
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      expiresAt: Date.now() + 3600000,
      isInitializing: false,
      authError: null,
    })

    const user = userEvent.setup()
    render(<PlayerView />)

    await user.click(screen.getByRole('button', { name: /플레이리스트/i }))

    expect(
      screen.getByRole('dialog', { name: '재생 목록 및 저장 플레이리스트' })
    ).toBeInTheDocument()
    expect(screen.getByText('현재 재생 목록이 비어 있습니다')).toBeInTheDocument()
  })
})
