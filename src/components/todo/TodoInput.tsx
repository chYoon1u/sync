import { useState } from 'react'
import { useTodoStore } from '@/store/useTodoStore'
import type { Priority } from '@/types/todo'

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'high', label: '높음' },
  { value: 'medium', label: '중간' },
  { value: 'low', label: '낮음' },
]

export function TodoInput() {
  const addTodo = useTodoStore((s) => s.addTodo)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    addTodo(trimmed, priority, dueDate || undefined)
    setTitle('')
    setDueDate('')
    setPriority('medium')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-700 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일을 입력하세요"
          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 rounded-xl px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition"
        >
          추가
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                priority === p.value
                  ? PRIORITY_SELECTED[p.value]
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="ml-auto bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 rounded-xl px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
        />
      </div>
    </form>
  )
}

const PRIORITY_SELECTED: Record<Priority, string> = {
  high: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  low: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
}
