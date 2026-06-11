import { useEffect, useRef, useState } from 'react'
import { TodoView } from '@/components/todo/TodoView'
import { CalendarView } from '@/components/calendar/CalendarView'
import { PlayerView } from '@/components/player/PlayerView'
import { PlayerBar } from '@/components/player/PlayerBar'
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer'
import { useAuthStore } from '@/store/useAuthStore'
import { useTodoStore } from '@/store/useTodoStore'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useUIStore, type AccentColor } from '@/store/useUIStore'
import {
  extractAuthCallback,
  exchangeCodeForToken,
  initiateLogin,
} from '@/services/spotifyAuth'

function SpotifyCallbackHandler() {
  const { setTokens, setInitializing, setAuthError } = useAuthStore()

  useEffect(() => {
    const { code, error } = extractAuthCallback()
    if (error) {
      setAuthError(`Spotify 로그인이 취소되었거나 거부되었습니다: ${error}`)
      return
    }
    if (!code) return

    setInitializing(true)
    setAuthError(null)
    exchangeCodeForToken(code)
      .then(({ accessToken, refreshToken, expiresAt }) => {
        setTokens(accessToken, refreshToken, expiresAt)
      })
      .catch((error: unknown) => {
        console.error(error)
        setAuthError(error instanceof Error ? error.message : 'Spotify 로그인에 실패했습니다.')
      })
      .finally(() => setInitializing(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

function PlayerSDKMount() {
  const isSpotifySDKRequested = useUIStore((state) => state.isSpotifySDKRequested)
  useSpotifyPlayer(isSpotifySDKRequested)
  return null
}

function AppHeader() {
  const [isMusicOpen, setMusicOpen] = useState(false)
  const [isSettingsOpen, setSettingsOpen] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const musicRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const { accessToken, isInitializing, setAuthError } = useAuthStore()
  const {
    isDarkMode,
    accentColor,
    customAccent,
    setAccentColor,
    setCustomAccent,
    toggleDarkMode,
  } = useUIStore()

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!musicRef.current?.contains(event.target as Node)) setMusicOpen(false)
      if (!settingsRef.current?.contains(event.target as Node)) setSettingsOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const login = async () => {
    setLoginError(null)
    setAuthError(null)
    try {
      await initiateLogin()
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Spotify 로그인을 시작할 수 없습니다.')
    }
  }

  return (
    <header className="relative z-40 flex h-9 shrink-0 items-center border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="m-0 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
        Sync
      </h1>

      <div className="ml-auto flex items-center gap-2">
        {loginError && <span className="max-w-64 truncate text-[10px] text-red-500">{loginError}</span>}
        <div ref={settingsRef} className="relative">
          <button
            onClick={() => setSettingsOpen((open) => !open)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-0.4 text-[10px] font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            설정
          </button>
          {isSettingsOpen && (
            <div className="absolute right-0 top-8 w-52 rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">포인트 컬러</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {([
                  ['lime', '#839b51'],
                  ['sage', '#668878'],
                  ['blue', '#6685a8'],
                  ['coral', '#b97868'],
                ] as [AccentColor, string][]).map(([color, hex]) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`h-8 rounded-lg border-2 transition ${
                      accentColor === color ? 'border-zinc-800 dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: hex }}
                    aria-label={`${color} 포인트 컬러`}
                  />
                ))}
              </div>
              <label className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                직접 선택
                <input
                  type="color"
                  value={customAccent}
                  onChange={(event) => setCustomAccent(event.target.value)}
                  className="h-8 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0.5 dark:border-zinc-700"
                  aria-label="사용자 포인트 컬러"
                />
              </label>
            </div>
          )}
        </div>
        <div ref={musicRef} className="relative">
          {accessToken ? (
            <button
              onClick={() => setMusicOpen((open) => !open)}
              className="accent-soft accent-text rounded-full border px-3 py-0.4 text-[10px] font-semibold transition"
            >
              음악
            </button>
          ) : (
            <button
              onClick={login}
              disabled={isInitializing}
              className="accent-soft accent-text rounded-full border px-3 py-1 text-[10px] font-semibold transition disabled:opacity-50"
            >
              {isInitializing ? '연결 중' : 'Spotify 로그인'}
            </button>
          )}

          {isMusicOpen && accessToken && (
            <div className="absolute right-0 top-8 h-[500px] w-[300px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-800">
              <PlayerView />
            </div>
          )}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isDarkMode}
          aria-label="다크 모드"
          onClick={toggleDarkMode}
          className={`relative h-5 w-9 rounded-full transition ${
            isDarkMode ? 'accent-bg' : 'bg-zinc-300'
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              isDarkMode ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </header>
  )
}

function App() {
  const isCompact = useTodoStore((state) => state.isCompact)
  const isCalendarCollapsed = useCalendarStore((state) => state.isCollapsed)
  const isDarkMode = useUIStore((state) => state.isDarkMode)
  const accentColor = useUIStore((state) => state.accentColor)
  const customAccent = useUIStore((state) => state.customAccent)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    document.documentElement.dataset.accent = accentColor
    const rootStyle = document.documentElement.style
    if (accentColor === 'custom') {
      rootStyle.setProperty('--accent', customAccent)
      rootStyle.setProperty('--accent-hover', `color-mix(in srgb, ${customAccent} 82%, black)`)
      rootStyle.setProperty('--accent-soft', `color-mix(in srgb, ${customAccent} 14%, white)`)
      rootStyle.setProperty('--accent-border', `color-mix(in srgb, ${customAccent} 38%, white)`)
      rootStyle.setProperty('--accent-text', `color-mix(in srgb, ${customAccent} 68%, black)`)
    } else {
      for (const property of [
        '--accent',
        '--accent-hover',
        '--accent-soft',
        '--accent-border',
        '--accent-text',
      ]) {
        rootStyle.removeProperty(property)
      }
    }
    document.body.dataset.todoCompact = String(isCompact)
    document.body.dataset.calendarCollapsed = String(isCalendarCollapsed)
  }, [accentColor, customAccent, isCalendarCollapsed, isCompact, isDarkMode])

  useEffect(() => {
    window.electronAPI?.setCalendarCollapsed(isCalendarCollapsed)
  }, [isCalendarCollapsed])

  if (isCompact) {
    return (
      <div className="flex h-screen min-w-[390px] flex-col overflow-hidden bg-[#f8f8f8] dark:bg-zinc-950">
        <SpotifyCallbackHandler />
        <PlayerSDKMount />
        <div className="h-[390px] min-h-0 shrink-0">
          <TodoView />
        </div>
        <PlayerBar />
      </div>
    )
  }

  return (
    <div
      className={`mx-auto flex h-screen w-full flex-col overflow-hidden bg-[#f8f8f8] transition-[max-width] duration-300 dark:bg-zinc-950 ${
        isCalendarCollapsed ? 'max-w-[376px]' : 'max-w-[1080px]'
      }`}
    >
      <SpotifyCallbackHandler />
      <PlayerSDKMount />
      <AppHeader />

      <main
        className={`grid min-h-0 flex-1 gap-2 p-2 transition-[grid-template-columns] duration-300 ${
          isCalendarCollapsed
            ? 'grid-cols-[300px_52px]'
            : 'grid-cols-[300px_minmax(520px,1fr)]'
        }`}
      >
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <TodoView />
        </section>

        <section
          className={`overflow-hidden rounded-xl border border-zinc-200 bg-white transition-[padding] duration-300 dark:border-zinc-800 dark:bg-zinc-900 ${
            isCalendarCollapsed ? 'p-1.5' : 'p-4'
          }`}
        >
          <CalendarView />
        </section>
      </main>

      <PlayerBar />
    </div>
  )
}

export default App
