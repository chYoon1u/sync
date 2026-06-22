import { useEffect, useRef, useState } from 'react'
import { TodoView } from '@/components/todo/TodoView'
import { CalendarView } from '@/components/calendar/CalendarView'
import { PlayerView } from '@/components/player/PlayerView'
import { PlayerBar } from '@/components/player/PlayerBar'
import { TimeTrackerView } from '@/components/tracker/TimeTrackerView'
import { TimerView } from '@/components/timer/TimerView'
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
    activeTab,
    setAccentColor,
    setCustomAccent,
    setActiveTab,
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

  const headerTabs = [
    { id: 'schedule', label: 'Schedule', icon: '/Schedule.svg' },
    { id: 'timer', label: 'Timer', icon: '/Timer.svg' },
    { id: 'todo', label: 'Todo', icon: '/Todo.svg' },
    { id: 'calendar', label: 'Calendar', icon: '/Calendar.svg' },
  ] as const

  return (
    <header className="relative z-40 flex h-10 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
      <nav className="flex items-center gap-1" aria-label="주요 화면">
        {headerTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
            aria-pressed={activeTab === tab.id}
            title={tab.label}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
              activeTab === tab.id
                ? 'accent-soft'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <img src={tab.icon} alt="" className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}
      </nav>

      <h1 className="pointer-events-none absolute left-1/2 m-0 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
        Sync
      </h1>

      <div className="flex items-center gap-1">
        {loginError && <span className="max-w-64 truncate text-[10px] text-red-500">{loginError}</span>}
        <div ref={settingsRef} className="relative">
          <button
            onClick={() => setSettingsOpen((open) => !open)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
              isSettingsOpen ? 'accent-soft' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            aria-label="설정"
            aria-expanded={isSettingsOpen}
            title="설정"
          >
            <img src="/Settings.svg" alt="" className="h-4 w-4" aria-hidden="true" />
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
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                isMusicOpen ? 'accent-soft' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              aria-label="음악"
              aria-expanded={isMusicOpen}
              title="음악"
            >
              <img src="/Music.svg" alt="" className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={login}
              disabled={isInitializing}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
              aria-label={isInitializing ? 'Spotify 연결 중' : 'Spotify 로그인'}
              title={isInitializing ? 'Spotify 연결 중' : 'Spotify 로그인'}
            >
              <img src="/Music.svg" alt="" className="h-4 w-4" aria-hidden="true" />
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
          className={`relative h-4 w-7 rounded-full transition ${
            isDarkMode ? 'accent-bg' : 'bg-zinc-300'
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
              isDarkMode ? 'translate-x-3' : 'translate-x-0'
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
  const activeTab = useUIStore((state) => state.activeTab)

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
        className="min-h-0 flex-1 p-2"
      >
        <section className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          {activeTab === 'schedule' && <TimeTrackerView compact={isCalendarCollapsed} />}
          {activeTab === 'timer' && <TimerView />}
          {activeTab === 'todo' && <TodoView />}
          {activeTab === 'calendar' && <CalendarView />}
        </section>
      </main>

      <PlayerBar />
    </div>
  )
}

export default App
