import { useAuthStore } from '@/store/useAuthStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUIStore } from '@/store/useUIStore'

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function PlayerBar() {
  const requestSpotifySDK = useUIStore((state) => state.requestSpotifySDK)
  const {
    playlist,
    currentIndex,
    playerState,
    volume,
    isRepeat,
    isShuffle,
    progressMs,
    durationMs,
    togglePlay,
    playNext,
    playPrev,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    seekTo,
    _sdkPlayer,
  } = usePlayerStore()
  const { accessToken } = useAuthStore()

  const currentTrack = playlist[currentIndex] ?? null
  const progress = durationMs > 0 ? (progressMs / durationMs) * 100 : 0
  const handleTogglePlay = () => {
    if (_sdkPlayer) {
      void togglePlay()
      return
    }

    requestSpotifySDK()
  }

  if (!accessToken) return null

  return (
    <div
      className="w-full shrink-0 border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      data-testid="player-bar"
      onPointerEnter={requestSpotifySDK}
      onFocusCapture={requestSpotifySDK}
    >
      <div className="playerbar-inner grid h-24 w-full grid-cols-[minmax(0,240px)_minmax(0,1fr)_minmax(0,160px)] items-center gap-4 px-4">
        <div className="playerbar-track flex min-w-0 items-center gap-3">
          {currentTrack ? (
            <>
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.albumName}
                className="h-12 w-12 rounded-xl bg-zinc-200 object-cover shadow-sm dark:bg-zinc-700"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {currentTrack.title}
                </p>
                <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                  {currentTrack.artist}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <svg className="h-5 w-5 text-zinc-300 dark:text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-300 dark:text-zinc-600">재생 중인 곡 없음</p>
            </div>
          )}
        </div>

        <div className="playerbar-controls flex min-w-0 flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`rounded-lg p-1.5 transition ${
                isShuffle
                  ? 'accent-text'
                  : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
              aria-label="셔플"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>

            <button
              onClick={playPrev}
              disabled={!currentTrack}
              className="rounded-xl p-2 text-zinc-600 transition hover:text-zinc-900 disabled:opacity-30 dark:text-zinc-300 dark:hover:text-white"
              aria-label="이전 곡"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              onClick={handleTogglePlay}
              disabled={!currentTrack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md transition-transform hover:scale-105 disabled:opacity-30 dark:bg-white dark:text-zinc-900"
              aria-label={playerState === 'playing' ? '일시정지' : '재생'}
            >
              {playerState === 'playing' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={playNext}
              disabled={!currentTrack}
              className="rounded-xl p-2 text-zinc-600 transition hover:text-zinc-900 disabled:opacity-30 dark:text-zinc-300 dark:hover:text-white"
              aria-label="다음 곡"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
              </svg>
            </button>

            <button
              onClick={toggleRepeat}
              className={`rounded-lg p-1.5 transition ${
                isRepeat
                  ? 'accent-text'
                  : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
              aria-label="반복"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            </button>
          </div>

          <div className="flex w-full items-center gap-3">
            <span className="w-10 text-right text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              {msToTime(progressMs)}
            </span>
            <div className="group relative h-1.5 flex-1">
              <div className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-zinc-800 transition-colors group-hover:bg-[var(--accent)] dark:bg-white"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min={0}
                max={durationMs || 100}
                value={progressMs}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="재생 위치"
              />
            </div>
            <span className="w-10 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              {msToTime(durationMs)}
            </span>
          </div>
        </div>

        <div className="playerbar-volume flex w-full max-w-40 items-center gap-2 justify-self-end">
          <button
            onClick={() => setVolume(volume === 0 ? 70 : 0)}
            className="shrink-0 text-zinc-400 transition hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            aria-label={volume === 0 ? '음소거 해제' : '음소거'}
          >
            {volume === 0 ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            )}
          </button>
          <div className="group relative h-1 flex-1">
            <div className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-zinc-400 transition-colors group-hover:bg-[var(--accent)]"
              style={{ width: `${volume}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="볼륨"
            />
          </div>
          <span className="w-7 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{volume}</span>
        </div>
      </div>
    </div>
  )
}
