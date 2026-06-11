import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchTracks } from '@/services/spotify'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('searchTracks', () => {
  it('Spotify 개발 모드 검색 상한인 10개를 요청한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ tracks: { items: [] } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await searchTracks('test query', 'token')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('limit=10'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      })
    )
  })
})
