import { useState, useRef } from 'react'
import { searchTracks } from '@/services/spotify'
import { useAuthStore } from '@/store/useAuthStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { spotifyTrackToPlaylistTrack } from '@/types/player'
import type { SpotifyTrack } from '@/types/spotify'

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function SearchPanel() {
  const { getValidToken } = useAuthStore()
  const { addTrack, playAt, playlist } = usePlayerStore()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      const token = await getValidToken()
      if (!token) throw new Error('로그인이 필요합니다')
      const tracks = await searchTracks(q, token)
      setResults(tracks)
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = (track: SpotifyTrack) => {
    addTrack(spotifyTrackToPlaylistTrack(track))
  }

  const handlePlayNow = (track: SpotifyTrack) => {
    addTrack(spotifyTrackToPlaylistTrack(track))
    const idx = usePlayerStore.getState().playlist.findIndex((t) => t.spotifyId === track.id)
    if (idx !== -1) playAt(idx)
  }

  const isInPlaylist = (trackId: string) => playlist.some((t) => t.spotifyId === trackId)

  return (
    <div className="flex flex-col gap-3 h-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="노래 제목 또는 아티스트 검색"
          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 rounded-xl px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
        {results.map((track) => (
          <div
            key={track.id}
            className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition"
          >
            <img
              src={track.album.images[2]?.url ?? track.album.images[0]?.url}
              alt={track.album.name}
              className="w-10 h-10 rounded-lg object-cover shrink-0 bg-zinc-200 dark:bg-zinc-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{track.name}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                {track.artists.map((a) => a.name).join(', ')} · {track.album.name}
              </p>
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
              {msToTime(track.duration_ms)}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => handlePlayNow(track)}
                className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
                aria-label="바로 재생"
                title="바로 재생"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button
                onClick={() => handleAdd(track)}
                disabled={isInPlaylist(track.id)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-600 dark:text-zinc-300 transition"
                aria-label="플레이리스트에 추가"
                title={isInPlaylist(track.id) ? '이미 추가됨' : '플레이리스트에 추가'}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {results.length === 0 && !isLoading && query && (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-300 dark:text-zinc-600">
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
