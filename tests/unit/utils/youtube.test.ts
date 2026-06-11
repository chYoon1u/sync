import { describe, it, expect } from 'vitest'
import { spotifyTrackToPlaylistTrack } from '@/types/player'
import type { SpotifyTrack } from '@/types/spotify'

const mockTrack: SpotifyTrack = {
  id: 'abc123',
  name: 'Test Song',
  uri: 'spotify:track:abc123',
  artists: [
    { id: '1', name: 'Artist A', uri: '' },
    { id: '2', name: 'Artist B', uri: '' },
  ],
  album: {
    id: 'alb1',
    name: 'Test Album',
    uri: '',
    images: [{ url: 'https://example.com/img.jpg', height: 640, width: 640 }],
  },
  duration_ms: 210000,
  preview_url: null,
  explicit: false,
}

describe('spotifyTrackToPlaylistTrack', () => {
  it('기본 필드 변환', () => {
    const result = spotifyTrackToPlaylistTrack(mockTrack)
    expect(result.spotifyId).toBe('abc123')
    expect(result.uri).toBe('spotify:track:abc123')
    expect(result.title).toBe('Test Song')
    expect(result.durationMs).toBe(210000)
  })

  it('아티스트 여러 명 — 쉼표로 합산', () => {
    const result = spotifyTrackToPlaylistTrack(mockTrack)
    expect(result.artist).toBe('Artist A, Artist B')
  })

  it('앨범 정보 추출', () => {
    const result = spotifyTrackToPlaylistTrack(mockTrack)
    expect(result.albumName).toBe('Test Album')
    expect(result.albumArt).toBe('https://example.com/img.jpg')
  })

  it('앨범 이미지 없으면 빈 문자열', () => {
    const noImage = { ...mockTrack, album: { ...mockTrack.album, images: [] } }
    const result = spotifyTrackToPlaylistTrack(noImage)
    expect(result.albumArt).toBe('')
  })
})
