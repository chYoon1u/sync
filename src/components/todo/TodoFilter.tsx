import { useTodoStore } from '@/store/useTodoStore'
import type { FilterStatus } from '@/types/todo'
import { localDateKey } from '@/utils/todo'

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'allDates', label: 'All Dates' },
]

export function TodoFilter() {
  const { todos, filter, setFilter } = useTodoStore()
  const today = localDateKey()
  const grouped: Record<FilterStatus, typeof todos> = {
    today: todos.filter((todo) => todo.dueDate === today),
    allDates: todos,
  }

  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-50/80 p-1 dark:bg-zinc-900/40">
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
          <span className="mt-0.5 block text-[10px] font-normal opacity-60">
            {grouped[item.value].filter((todo) => todo.completed).length}/{grouped[item.value].length}
          </span>
        </button>
      ))}
    </div>
  )
}
