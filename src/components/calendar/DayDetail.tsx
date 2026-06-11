import { useState } from 'react'
import { useTodoStore } from '@/store/useTodoStore'
import { formatDate } from '@/utils/date'
import type { Priority } from '@/types/todo'

const PRIORITY_BADGE: Record<Priority, string> = {
  high: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
}

const PRIORITY_LABEL: Record<Priority, string> = { high: '높음', medium: '중간', low: '낮음' }

interface Props {
  selectedDate: string
}

export function DayDetail({ selectedDate }: Props) {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodoStore()
  const [inputValue, setInputValue] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const dayTodos = todos.filter((t) => t.dueDate === selectedDate)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return
    addTodo(trimmed, priority, selectedDate)
    setInputValue('')
    setPriority('medium')
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 날짜 헤더 */}
      <div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">선택된 날짜</p>
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
          {formatDate(selectedDate)}
        </h3>
      </div>

      {/* 빠른 추가 폼 */}
      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="이 날짜에 추가..."
            className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-3 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-xl transition"
          >
            추가
          </button>
        </div>
        <div className="flex gap-1">
          {(['high', 'medium', 'low'] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`flex-1 py-1 rounded-lg text-xs font-medium transition ${
                priority === p ? PRIORITY_BADGE[p] : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
              }`}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
      </form>

      {/* 투두 목록 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {dayTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-300 dark:text-zinc-600">
            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">이 날짜에 할 일이 없습니다</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {dayTodos.map((todo) => (
              <li
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                  todo.completed
                    ? 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-700/50 opacity-60'
                    : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700'
                }`}
              >
                {/* 체크 */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-violet-500 border-violet-500'
                      : 'border-zinc-300 dark:border-zinc-500 hover:border-violet-400'
                  }`}
                  aria-label={todo.completed ? '완료 취소' : '완료로 표시'}
                >
                  {todo.completed && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* 제목 */}
                <span className={`flex-1 text-xs leading-snug ${todo.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-200'}`}>
                  {todo.title}
                </span>

                {/* 우선순위 + 삭제 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${PRIORITY_BADGE[todo.priority]}`}>
                    {PRIORITY_LABEL[todo.priority]}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition"
                    aria-label="삭제"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 요약 */}
      {dayTodos.length > 0 && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-right">
          {dayTodos.filter((t) => t.completed).length} / {dayTodos.length} 완료
        </p>
      )}
    </div>
  )
}
