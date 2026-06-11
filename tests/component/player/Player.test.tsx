import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useAuthStore } from '@/store/useAuthStore'
import { PlayerView } from '@/components/player/PlayerView'

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
  usePlayerStore.setState({ playlist: [], currentIndex: 0, playerState: 'stopped', _sdkPlayer: null, deviceId: null })
  useAuthStore.setState({ accessToken: null, refreshToken: null, expiresAt: null, isInitializing: false })
})

describe('PlayerView', () => {
  it('비로그인 상태에서 로그인 버튼 표시', () => {
    render(<PlayerView />)
    expect(screen.getByRole('button', { name: /Spotify로 로그인/i })).toBeInTheDocument()
  })

  it('로그인 상태에서 검색창 표시', () => {
    useAuthStore.setState({ accessToken: 'mock-token', refreshToken: 'mock-refresh', expiresAt: Date.now() + 3600000, isInitializing: false })
    render(<PlayerView />)
    expect(screen.getByPlaceholderText('노래 제목 또는 아티스트 검색')).toBeInTheDocument()
  })

  it('로그인 상태에서 플레이리스트 탭 전환', async () => {
    useAuthStore.setState({ accessToken: 'mock-token', refreshToken: 'mock-refresh', expiresAt: Date.now() + 3600000, isInitializing: false })
    const user = userEvent.setup()
    render(<PlayerView />)
    await user.click(screen.getByRole('button', { name: /플레이리스트/i }))
    expect(screen.getByText('플레이리스트가 비어있습니다')).toBeInTheDocument()
  })
})
