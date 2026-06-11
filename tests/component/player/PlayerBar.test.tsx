import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlayerBar } from '@/components/player/PlayerBar'
import { useAuthStore } from '@/store/useAuthStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { PlaylistTrack } from '@/types/player'

const track: PlaylistTrack = {
  id: 'track-1',
  spotifyId: 'spotify-track-1',
  uri: 'spotify:track:1',
  title: 'Test Track',
  artist: 'Test Artist',
  albumName: 'Test Album',
  albumArt: 'https://example.com/cover.jpg',
  durationMs: 180000,
  addedAt: '2026-06-11T00:00:00.000Z',
}

beforeEach(() => {
  useAuthStore.setState({ accessToken: null })
  usePlayerStore.setState({
    playlist: [],
    currentIndex: 0,
    hasPlaybackHistory: false,
    lastPlayedSpotifyId: null,
    playerState: 'stopped',
    progressMs: 0,
    durationMs: 0,
  })
})

describe('PlayerBar', () => {
  it('shows the played track in a full-width bottom bar', () => {
    useAuthStore.setState({ accessToken: 'mock-token' })
    usePlayerStore.setState({
      playlist: [track],
      hasPlaybackHistory: true,
      lastPlayedSpotifyId: track.spotifyId,
    })

    render(<PlayerBar />)

    expect(screen.getByTestId('player-bar')).toHaveClass('w-full')
    expect(screen.getByText(track.title)).toBeInTheDocument()
  })

  it('로그인 상태에서는 재생 전에도 하단바를 표시', () => {
    useAuthStore.setState({ accessToken: 'mock-token' })
    usePlayerStore.setState({ playlist: [track] })

    render(<PlayerBar />)

    expect(screen.getByTestId('player-bar')).toBeInTheDocument()
  })
})
