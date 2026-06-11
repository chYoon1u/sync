import { useTodoStore } from '@/store/useTodoStore'
import type { FilterStatus } from '@/types/todo'

function localDateKey(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'today', label: '오늘 투두리스트' },
  { value: 'allDates', label: '전체 날짜' },
]

export function TodoFilter() {
  const { todos, filter, setFilter } = useTodoStore()
  const today = localDateKey()
  const counts: Record<FilterStatus, number> = {
    today: todos.filter((todo) => todo.dueDate === today).length,
    allDates: todos.length,
  }

  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900/60">
      {FILTERS.map((item) => (
        <button
          key={item.value}
          onClick={() => setFilter(item.value)}
          className={`min-w-0 rounded-lg px-2 py-2 text-xs font-semibold transition ${
            filter === item.value
              ? 'accent-soft accent-text shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <span className="block truncate">{item.label}</span>
          <span className="mt-0.5 block text-[10px] font-normal opacity-60">{counts[item.value]}개</span>
        </button>
      ))}
    </div>
  )
}
