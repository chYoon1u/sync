import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { searchTracks } from '@/services/spotify'
import { useAuthStore } from '@/store/useAuthStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { spotifyTrackToPlaylistTrack } from '@/types/player'
import type { SpotifyTrack } from '@/types/spotify'

function msToTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

interface SearchPanelProps {
  onTrackAdded?: () => void
}

const SEARCH_DEBOUNCE_MS = 300

export function SearchPanel({ onTrackAdded }: SearchPanelProps) {
  const { getValidToken } = useAuthStore()
  const { addTrack, playAt, playlist } = usePlayerStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastRequestedQueryRef = useRef('')
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS)

  const runSearch = useCallback(async (searchQuery: string) => {
    lastRequestedQueryRef.current = searchQuery
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setIsLoading(true)
    setError(null)

    const metricLabel = `[Spotify Search][${SEARCH_DEBOUNCE_MS}ms]`
    const startedAt = performance.now()
    console.count(`${metricLabel} API calls`)

    try {
      const token = await getValidToken()
      if (!token) throw new Error('로그인이 필요합니다.')
      const tracks = await searchTracks(searchQuery, token, controller.signal)

      if (!controller.signal.aborted) {
        setResults(tracks)
        console.info(
          `${metricLabel} "${searchQuery}" response: ${(performance.now() - startedAt).toFixed(1)}ms`
        )
      }
    } catch (searchError) {
      if (searchError instanceof Error && searchError.name !== 'AbortError') {
        setError(searchError.message)
      }
    } finally {
      if (abortRef.current === controller) {
        setIsLoading(false)
      }
    }
  }, [getValidToken])

  useEffect(() => {
    const searchQuery = debouncedQuery.trim()

    if (!searchQuery) {
      abortRef.current?.abort()
      lastRequestedQueryRef.current = ''
      return
    }

    if (searchQuery !== lastRequestedQueryRef.current) {
      void runSearch(searchQuery)
    }

    return () => abortRef.current?.abort()
  }, [debouncedQuery, runSearch])

  const handleAdd = (track: SpotifyTrack) => {
    addTrack(spotifyTrackToPlaylistTrack(track))
    onTrackAdded?.()
  }

  const handlePlayNow = (track: SpotifyTrack) => {
    addTrack(spotifyTrackToPlaylistTrack(track))
    const index = usePlayerStore.getState().playlist.findIndex(
      (playlistTrack) => playlistTrack.spotifyId === track.id
    )
    if (index !== -1) void playAt(index)
    onTrackAdded?.()
  }

  const isInPlaylist = (trackId: string) =>
    playlist.some((track) => track.spotifyId === trackId)

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value
            setQuery(nextQuery)

            if (!nextQuery.trim()) {
              abortRef.current?.abort()
              lastRequestedQueryRef.current = ''
              setResults([])
              setIsLoading(false)
              setError(null)
            }
          }}
          placeholder="노래 제목 또는 아티스트 검색"
          className="accent-focus flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 transition focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {isLoading && (
          <div className="flex items-center px-2 text-zinc-400" aria-label="검색 중">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

      <div className="scrollbar-hidden min-h-0 flex-1 space-y-1 overflow-y-auto">
        {results.map((track) => (
          <div
            key={track.id}
            className="group flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
          >
            <img
              src={track.album.images[2]?.url ?? track.album.images[0]?.url}
              alt={track.album.name}
              className="h-10 w-10 shrink-0 rounded-lg bg-zinc-200 object-cover dark:bg-zinc-700"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{track.name}</p>
              <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                {track.artists.map((artist) => artist.name).join(', ')} · {track.album.name}
              </p>
            </div>
            <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
              {msToTime(track.duration_ms)}
            </span>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => handlePlayNow(track)}
                className="accent-bg accent-bg-hover rounded-lg p-1.5 text-white transition"
                aria-label="바로 재생"
                title="바로 재생"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button
                onClick={() => handleAdd(track)}
                disabled={isInPlaylist(track.id)}
                className="rounded-lg bg-zinc-100 p-1.5 text-zinc-600 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                aria-label="현재 재생 목록에 추가"
                title={isInPlaylist(track.id) ? '이미 추가됨' : '현재 재생 목록에 추가'}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {results.length === 0 && !isLoading && query && (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-300 dark:text-zinc-600">
            <p className="text-sm">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
