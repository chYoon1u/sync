import { useEffect } from 'react'
import { TodoView } from '@/components/todo/TodoView'
import { CalendarView } from '@/components/calendar/CalendarView'
import { PlayerView } from '@/components/player/PlayerView'
import { PlayerBar } from '@/components/player/PlayerBar'
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer'
import { useAuthStore } from '@/store/useAuthStore'
import { extractAuthCode, exchangeCodeForToken } from '@/services/spotifyAuth'

function SpotifyCallbackHandler() {
  const { setTokens, setInitializing } = useAuthStore()

  useEffect(() => {
    const code = extractAuthCode()
    if (!code) return

    setInitializing(true)
    exchangeCodeForToken(code)
      .then(({ accessToken, refreshToken, expiresAt }) => {
        setTokens(accessToken, refreshToken, expiresAt)
      })
      .catch(console.error)
      .finally(() => setInitializing(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

function PlayerSDKMount() {
  useSpotifyPlayer()
  return null
}

function App() {
  const isInitializing = useAuthStore((s) => s.isInitializing)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col">
      <SpotifyCallbackHandler />
      <PlayerSDKMount />

      {/* 상단 헤더 */}
      <header className="shrink-0 px-6 py-4 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-violet-900/50">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Sync</h1>

        {isInitializing && (
          <span className="ml-auto text-xs text-green-500 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Spotify 연결 중...
          </span>
        )}
      </header>

      {/* 메인 3열 레이아웃 */}
      <main className="flex-1 grid grid-cols-[1fr_380px_340px] gap-4 p-4 min-h-0 overflow-hidden">
        {/* 투두 패널 */}
        <section className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-700 overflow-y-auto">
          <TodoView />
        </section>

        {/* 캘린더 패널 */}
        <section className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-700 overflow-y-auto">
          <CalendarView />
        </section>

        {/* 플레이어 패널 */}
        <section className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-700 overflow-y-auto">
          <PlayerView />
        </section>
      </main>

      {/* 하단 고정 PlayerBar — 탭 이동해도 유지 */}
      <PlayerBar />
    </div>
  )
}

export default App
