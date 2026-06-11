import { useTodoStore } from '@/store/useTodoStore'
import type { FilterStatus } from '@/types/todo'

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행중' },
  { value: 'completed', label: '완료' },
]

export function TodoFilter() {
  const { todos, filter, setFilter } = useTodoStore()

  const counts: Record<FilterStatus, number> = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  }

  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filter === f.value
              ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          {f.label}
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            filter === f.value
              ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500'
          }`}>
            {counts[f.value]}
          </span>
        </button>
      ))}
    </div>
  )
}
