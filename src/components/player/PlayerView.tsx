import { useEffect, useRef, useState } from 'react'
import { initiateLogin } from '@/services/spotifyAuth'
import { useAuthStore } from '@/store/useAuthStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { PlaylistPanel } from './PlaylistPanel'
import { SearchPanel } from './SearchPanel'

export function PlayerView() {
  const [isPlaylistOpen, setPlaylistOpen] = useState(false)
  const [isAddOpen, setAddOpen] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const playlistPopoverRef = useRef<HTMLDivElement>(null)

  const { accessToken, authError, clearTokens, setAuthError } = useAuthStore()
  const { playlist, currentIndex } = usePlayerStore()
  const currentTrack = playlist[currentIndex] ?? null

  useEffect(() => {
    const closePopover = (event: MouseEvent) => {
      if (!playlistPopoverRef.current?.contains(event.target as Node)) {
        setPlaylistOpen(false)
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPlaylistOpen(false)
        setAddOpen(false)
      }
    }

    document.addEventListener('mousedown', closePopover)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closePopover)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const handleLogin = async () => {
    setLoginError(null)
    setAuthError(null)

    try {
      await initiateLogin()
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Spotify 로그인 링크를 열 수 없습니다.')
    }
  }

  if (!accessToken) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5">
        <div className="accent-bg flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg">
          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.371-.721.49-1.101.241-3.021-1.858-6.832-2.278-11.322-1.237-.43.101-.871-.17-.972-.6-.101-.43.17-.871.601-.972 4.911-1.121 9.122-.641 12.513 1.411.38.25.5.731.281 1.157zm1.47-3.27c-.301.471-.94.621-1.41.32-3.462-2.129-8.733-2.75-12.824-1.5-.521.16-1.071-.131-1.231-.651-.16-.52.131-1.07.651-1.23 4.671-1.421 10.472-.73 14.451 1.71.47.3.62.94.363 1.351zm.129-3.401c-4.151-2.461-11.002-2.691-14.962-1.49-.631.191-1.302-.16-1.492-.791-.191-.63.16-1.301.791-1.491 4.551-1.381 12.122-1.111 16.902 1.721.571.34.761 1.07.421 1.641-.34.571-1.07.761-1.66.41z" />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="mb-1 text-base font-semibold text-zinc-800 dark:text-zinc-100">Spotify 연동</h3>
          <p className="text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
            Spotify Premium 계정이 필요합니다.
          </p>
        </div>

        {(loginError || authError) && (
          <p role="alert" className="max-w-72 text-xs leading-relaxed text-red-500 dark:text-red-400">
            {loginError || authError}
          </p>
        )}

        <button
          onClick={handleLogin}
          className="accent-bg accent-bg-hover rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition"
        >
          Spotify로 로그인
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">음악</h2>
        <button
          onClick={clearTokens}
          className="text-xs text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          로그아웃
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5">
        <div className="relative">
          {currentTrack?.albumArt ? (
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.albumName}
              className="h-36 w-36 rounded-3xl object-cover shadow-xl shadow-zinc-200 dark:shadow-black/30"
            />
          ) : (
            <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-zinc-100 dark:bg-zinc-700">
              <svg className="h-12 w-12 text-zinc-300 dark:text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>

        <div className="w-full min-w-0 text-center">
          <p className="truncate text-base font-semibold text-zinc-800 dark:text-zinc-100">
            {currentTrack?.title ?? '재생할 곡을 추가해 주세요'}
          </p>
          <p className="mt-1 truncate text-xs text-zinc-400 dark:text-zinc-500">
            {currentTrack?.artist ?? 'Spotify에서 곡을 검색할 수 있습니다'}
          </p>
        </div>

        <div className="flex w-full gap-2">
          <div ref={playlistPopoverRef} className="relative flex-1">
            <button
              onClick={() => setPlaylistOpen((open) => !open)}
              aria-expanded={isPlaylistOpen}
              aria-haspopup="dialog"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              재생 목록 {playlist.length > 0 ? `(${playlist.length})` : ''}
            </button>

            {isPlaylistOpen && (
              <div
                role="dialog"
                aria-label="재생 목록 및 저장 플레이리스트"
                className="fixed right-2 top-12 z-50 h-96 max-h-[calc(100vh-4rem)] w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-2xl dark:border-zinc-700 dark:bg-zinc-800"
              >
                <PlaylistPanel />
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setPlaylistOpen(false)
              setAddOpen(true)
            }}
            className="accent-bg accent-bg-hover flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition"
          >
            곡 추가
          </button>
        </div>
      </div>

      {isAddOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 p-8 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-track-title"
            className="flex h-[620px] w-[680px] flex-col rounded-3xl border border-white/60 bg-white p-6 text-left shadow-2xl dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 id="add-track-title" className="text-lg font-semibold text-zinc-900 dark:text-white">
                  현재 재생 목록에 곡 추가
                </h3>
                <p className="mt-1 text-xs text-zinc-400">Spotify에서 원하는 곡을 검색하세요.</p>
              </div>

              <button
                onClick={() => setAddOpen(false)}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                aria-label="추가 창 닫기"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1">
              <SearchPanel onTrackAdded={() => setAddOpen(false)} />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
