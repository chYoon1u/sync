import { usePlayerStore } from '@/store/usePlayerStore'
import { useAuthStore } from '@/store/useAuthStore'

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function PlayerBar() {
  const {
    playlist, currentIndex, playerState, volume, isRepeat, isShuffle,
    progressMs, durationMs,
    togglePlay, playNext, playPrev, setVolume, toggleRepeat, toggleShuffle, seekTo,
  } = usePlayerStore()

  const { accessToken } = useAuthStore()

  const currentTrack = playlist[currentIndex] ?? null
  const progress = durationMs > 0 ? (progressMs / durationMs) * 100 : 0

  if (!accessToken) return null

  return (
    <div className="h-20 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center px-6 gap-6 shrink-0">
      {/* 현재 곡 정보 */}
      <div className="flex items-center gap-3 w-64 shrink-0">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.albumName}
              className="w-12 h-12 rounded-xl object-cover bg-zinc-200 dark:bg-zinc-700 shadow-sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-300 dark:text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-300 dark:text-zinc-600">재생 중인 곡 없음</p>
          </div>
        )}
      </div>

      {/* 중앙 컨트롤 */}
      <div className="flex-1 flex flex-col items-center gap-1.5 max-w-xl mx-auto">
        <div className="flex items-center gap-4">
          {/* 셔플 */}
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-lg transition ${isShuffle ? 'text-green-500' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            aria-label="셔플"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>

          {/* 이전 */}
          <button
            onClick={playPrev}
            disabled={!currentTrack}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 transition"
            aria-label="이전 곡"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* 재생/일시정지 */}
          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center disabled:opacity-30 hover:scale-105 transition-transform shadow-md"
            aria-label={playerState === 'playing' ? '일시정지' : '재생'}
          >
            {playerState === 'playing' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* 다음 */}
          <button
            onClick={playNext}
            disabled={!currentTrack}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 transition"
            aria-label="다음 곡"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
            </svg>
          </button>

          {/* 반복 */}
          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-lg transition ${isRepeat ? 'text-green-500' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            aria-label="반복"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            </svg>
          </button>
        </div>

        {/* 진행 바 */}
        <div className="w-full flex items-center gap-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 w-8 text-right tabular-nums">
            {msToTime(progressMs)}
          </span>
          <div className="flex-1 relative h-1 group">
            <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
            <div
              className="absolute inset-y-0 left-0 bg-zinc-800 dark:bg-white rounded-full group-hover:bg-green-500 transition-colors"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={durationMs || 100}
              value={progressMs}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="재생 위치"
            />
          </div>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 w-8 tabular-nums">
            {msToTime(durationMs)}
          </span>
        </div>
      </div>

      {/* 볼륨 */}
      <div className="flex items-center gap-2 w-36 shrink-0">
        <button
          onClick={() => setVolume(volume === 0 ? 70 : 0)}
          className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition shrink-0"
          aria-label={volume === 0 ? '음소거 해제' : '음소거'}
        >
          {volume === 0 ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          )}
        </button>
        <div className="flex-1 relative h-1 group">
          <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
          <div
            className="absolute inset-y-0 left-0 bg-zinc-400 dark:bg-zinc-400 rounded-full group-hover:bg-green-500 transition-colors"
            style={{ width: `${volume}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="볼륨"
          />
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 w-7 tabular-nums">{volume}</span>
      </div>
    </div>
  )
}
