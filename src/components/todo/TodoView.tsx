import { useEffect } from 'react'
import { useTodoStore } from '@/store/useTodoStore'
import { TodoInput } from './TodoInput'
import { TodoFilter } from './TodoFilter'
import { TodoList } from './TodoList'

function localDateKey(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function TodoView() {
  const {
    todos,
    isCompact,
    isAlwaysOnTop,
    setCompact,
    setAlwaysOnTop,
    setFilter,
  } = useTodoStore()
  const today = localDateKey()
  const todayTodos = todos.filter((todo) => todo.dueDate === today)
  const remaining = todos.filter((todo) => !todo.completed).length
  const isElectron = Boolean(window.electronAPI)

  useEffect(() => {
    if (isCompact) setFilter('today')
  }, [isCompact, setFilter])

  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.setTodoCompact(isCompact)
    window.electronAPI.setAlwaysOnTop(isCompact && isAlwaysOnTop)
  }, [isAlwaysOnTop, isCompact])

  const changeCompactMode = (enabled: boolean) => {
    setCompact(enabled)
  }

  const changeAlwaysOnTop = async () => {
    if (!window.electronAPI) return
    const actual = await window.electronAPI.setAlwaysOnTop(!isAlwaysOnTop)
    setAlwaysOnTop(actual)
  }

  if (isCompact) {
    return (
      <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
        <header className="flex min-w-0 items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-zinc-800 dark:text-zinc-100">오늘의 메모</h2>
            <p className="text-[11px] text-zinc-400">{todayTodos.length}개의 투두</p>
          </div>
          <button
            onClick={() => changeCompactMode(false)}
            className="accent-hover shrink-0 rounded-lg p-2 text-zinc-500 transition"
            aria-label="투두리스트 펼치기"
            title="원래 화면으로"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </header>

        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {todayTodos.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">오늘 할 일이 없습니다.</p>
          ) : (
            <ul className="space-y-1">
              {todayTodos.map((todo) => (
                <li key={todo.id} className="flex min-w-0 items-start gap-2 border-b border-zinc-200 py-2.5 last:border-0 dark:border-zinc-700">
                  <button
                    onClick={() => useTodoStore.getState().toggleTodo(todo.id)}
                    aria-label={todo.completed ? '완료 취소' : '완료로 표시'}
                    className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${todo.completed ? 'accent-bg accent-border' : 'border-zinc-300 dark:border-zinc-500'}`}
                  />
                  <p className={`min-w-0 flex-1 break-words text-sm leading-relaxed ${todo.completed ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>
                    {todo.title}
                  </p>
                  {todo.dueTime && (
                    <time className="shrink-0 text-[11px] font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                      {todo.dueTime}
                    </time>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">항상 위에 표시</p>
            {!isElectron && <p className="truncate text-[10px] text-zinc-400">Electron 앱에서 사용 가능</p>}
          </div>
          <button
            onClick={changeAlwaysOnTop}
            disabled={!isElectron}
            role="switch"
            aria-checked={isAlwaysOnTop}
            aria-label="항상 위에 표시"
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${isAlwaysOnTop ? 'accent-bg' : 'bg-zinc-300 dark:bg-zinc-600'} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${isAlwaysOnTop ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </footer>
      </section>
    )
  }

  return (
    <div className="flex h-full min-w-0 flex-col gap-3 overflow-hidden">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-zinc-800 dark:text-zinc-100">투두리스트</h2>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{remaining}개 남음</p>
        </div>
        <button
          onClick={() => changeCompactMode(true)}
          className="accent-hover shrink-0 rounded-lg border border-zinc-200 p-2 text-zinc-400 transition dark:border-zinc-600"
          aria-label="투두리스트 최소화"
          title="오늘 목록만 작게 보기"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M5 12h14" />
          </svg>
        </button>
      </div>

      <TodoInput />
      <TodoFilter />
      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto pr-1">
        <TodoList />
      </div>
    </div>
  )
}
