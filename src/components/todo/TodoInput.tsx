import { useState } from 'react'
import { useTodoStore } from '@/store/useTodoStore'
import type { Priority } from '@/types/todo'

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'high', label: '높음' },
  { value: 'medium', label: '중간' },
  { value: 'low', label: '낮음' },
]

const PRIORITY_SELECTED: Record<Priority, string> = {
  high: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  low: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
}

function localDateKey(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function TodoInput() {
  const addTodo = useTodoStore((state) => state.addTodo)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState(localDateKey)
  const [dueTime, setDueTime] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    addTodo(trimmed, priority, dueDate || undefined, undefined, dueTime || undefined)
    setTitle('')
    setDueDate(localDateKey())
    setPriority('medium')
    setDueTime('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-2xl border border-zinc-100 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex min-w-0 gap-2">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="할 일을 입력하세요"
          className="accent-focus min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 transition focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="accent-bg accent-bg-hover flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="투두 추가"
          title="투두 추가"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex shrink-0 items-center gap-1.5">
          {PRIORITIES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPriority(item.value)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                priority === item.value
                  ? PRIORITY_SELECTED[item.value]
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-1.5">
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="accent-focus min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-600 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
        />
        <input
          type="time"
          value={dueTime}
          onChange={(event) => setDueTime(event.target.value)}
          aria-label="완료 시간"
          className="accent-focus w-28 shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-600 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
        />
      </div>
    </form>
  )
}
