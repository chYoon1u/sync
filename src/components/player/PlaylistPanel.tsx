import { usePlayerStore } from '@/store/usePlayerStore'

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function PlaylistPanel() {
  const { playlist, currentIndex, playerState, playAt, removeTrack, clearPlaylist } =
    usePlayerStore()

  if (playlist.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-zinc-300 dark:text-zinc-600">
        <svg className="mb-2 h-10 w-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p className="text-xs">플레이리스트가 비어 있습니다</p>
        <p className="mt-1 text-xs opacity-60">곡 추가 버튼에서 음악을 추가하세요</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{playlist.length}곡</p>
        <button
          onClick={clearPlaylist}
          className="text-xs text-zinc-400 transition hover:text-red-500 dark:hover:text-red-400"
        >
          전체 삭제
        </button>
      </div>

      <ul className="scrollbar-hidden min-h-0 flex-1 space-y-1 overflow-y-auto">
        {playlist.map((track, index) => {
          const isCurrent = index === currentIndex
          const isPlaying = isCurrent && playerState === 'playing'

          return (
            <li
              key={track.id}
              className={`group flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition ${
                isCurrent
                  ? 'accent-soft border'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
              }`}
              onClick={() => playAt(index)}
            >
              <div className="flex w-7 shrink-0 items-center justify-center">
                {isPlaying ? (
                  <span className="flex h-4 items-end gap-0.5">
                    {[1, 2, 3].map((bar) => (
                      <span
                        key={bar}
                        className="accent-bg w-0.5 animate-pulse rounded-full"
                        style={{ height: `${40 + bar * 20}%`, animationDelay: `${bar * 0.15}s` }}
                      />
                    ))}
                  </span>
                ) : (
                  <span className={`text-xs ${isCurrent ? 'accent-text' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {index + 1}
                  </span>
                )}
              </div>

              <img
                src={track.albumArt}
                alt={track.albumName}
                className="h-9 w-9 shrink-0 rounded-lg bg-zinc-200 object-cover dark:bg-zinc-700"
              />

              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${isCurrent ? 'accent-text' : 'text-zinc-800 dark:text-zinc-100'}`}>
                  {track.title}
                </p>
                <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">{track.artist}</p>
              </div>

              <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                {msToTime(track.durationMs)}
              </span>

              <button
                onClick={(event) => {
                  event.stopPropagation()
                  removeTrack(track.id)
                }}
                className="shrink-0 rounded-lg p-1 text-zinc-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100 dark:text-zinc-600 dark:hover:text-red-400"
                aria-label={`${track.title} 제거`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
