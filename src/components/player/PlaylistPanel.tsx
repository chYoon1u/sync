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
      <div className="flex flex-col items-center justify-center h-full text-zinc-300 dark:text-zinc-600">
        <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p className="text-xs">플레이리스트가 비어있습니다</p>
        <p className="text-xs mt-1 opacity-60">검색탭에서 곡을 추가하세요</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{playlist.length}곡</p>
        <button
          onClick={clearPlaylist}
          className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition"
        >
          전체 삭제
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto min-h-0 space-y-1">
        {playlist.map((track, i) => {
          const isCurrent = i === currentIndex
          const isPlaying = isCurrent && playerState === 'playing'

          return (
            <li
              key={track.id}
              className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition ${
                isCurrent
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
              }`}
              onClick={() => playAt(i)}
            >
              {/* 인덱스 / 재생 인디케이터 */}
              <div className="w-7 shrink-0 flex items-center justify-center">
                {isPlaying ? (
                  <span className="flex gap-0.5 items-end h-4">
                    {[1, 2, 3].map((n) => (
                      <span
                        key={n}
                        className="w-0.5 bg-green-500 rounded-full animate-pulse"
                        style={{ height: `${40 + n * 20}%`, animationDelay: `${n * 0.15}s` }}
                      />
                    ))}
                  </span>
                ) : (
                  <span className={`text-xs ${isCurrent ? 'text-green-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {i + 1}
                  </span>
                )}
              </div>

              <img
                src={track.albumArt}
                alt={track.albumName}
                className="w-9 h-9 rounded-lg object-cover shrink-0 bg-zinc-200 dark:bg-zinc-700"
              />

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isCurrent ? 'text-green-600 dark:text-green-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
                  {track.title}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{track.artist}</p>
              </div>

              <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                {msToTime(track.durationMs)}
              </span>

              <button
                onClick={(e) => { e.stopPropagation(); removeTrack(track.id) }}
                className="p-1 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition shrink-0"
                aria-label="제거"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
