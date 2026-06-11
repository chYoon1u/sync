import { useState } from 'react'
import { SearchPanel } from './SearchPanel'
import { PlaylistPanel } from './PlaylistPanel'
import { useAuthStore } from '@/store/useAuthStore'
import { initiateLogin } from '@/services/spotifyAuth'
import { usePlayerStore } from '@/store/usePlayerStore'

type Tab = 'search' | 'playlist'

export function PlayerView() {
  const [tab, setTab] = useState<Tab>('search')
  const { accessToken, clearTokens } = useAuthStore()
  const playlist = usePlayerStore((s) => s.playlist)

  if (!accessToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5">
        <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-green-900/50">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.371-.721.49-1.101.241-3.021-1.858-6.832-2.278-11.322-1.237-.43.101-.871-.17-.972-.6-.101-.43.17-.871.601-.972 4.911-1.121 9.122-.641 12.513 1.411.38.25.5.731.281 1.157zm1.47-3.27c-.301.471-.94.621-1.41.32-3.462-2.129-8.733-2.75-12.824-1.5-.521.16-1.071-.131-1.231-.651-.16-.52.131-1.07.651-1.23 4.671-1.421 10.472-.73 14.451 1.71.47.3.62.94.363 1.351zm.129-3.401c-4.151-2.461-11.002-2.691-14.962-1.49-.631.191-1.302-.16-1.492-.791-.191-.63.16-1.301.791-1.491 4.551-1.381 12.122-1.111 16.902 1.721.571.34.761 1.07.421 1.641-.34.571-1.07.761-1.66.41z" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Spotify 연동</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
            Spotify Premium 계정이 필요합니다
          </p>
        </div>
        <button
          onClick={initiateLogin}
          className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-full transition shadow-md"
        >
          Spotify로 로그인
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">음악</h2>
        <button
          onClick={clearTokens}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
        >
          로그아웃
        </button>
      </div>

      {/* 탭 */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
        {([
          { key: 'search', label: '검색' },
          { key: 'playlist', label: `플레이리스트 ${playlist.length > 0 ? `(${playlist.length})` : ''}` },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 min-h-0">
        {tab === 'search' ? <SearchPanel /> : <PlaylistPanel />}
      </div>
    </div>
  )
}
