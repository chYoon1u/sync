import { isToday, toDateString } from '@/utils/date'
import type { Priority, Todo } from '@/types/todo'

interface Props {
  dateStr: string
  day: number
  isCurrentMonth: boolean
  isSelected: boolean
  todos: Todo[]
  onClick: (dateStr: string) => void
}

const PRIORITY_DOT: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: 'bg-blue-500',
}

export function CalendarDay({ dateStr, day, isCurrentMonth, isSelected, todos, onClick }: Props) {
  const today = isToday(dateStr)
  const isPast = dateStr < toDateString(new Date())
  const visibleTodos = todos.slice(0, 3)
  const hiddenCount = todos.length - visibleTodos.length

  return (
    <button
      data-testid={`calendar-day-${dateStr}`}
      onClick={() => onClick(dateStr)}
      className={`min-h-0 min-w-0 overflow-hidden rounded-lg p-1.5 text-left align-top transition ${
        !isCurrentMonth
          ? 'bg-zinc-50/80 text-zinc-300 dark:bg-zinc-900/40 dark:text-zinc-600'
          : isPast
            ? 'bg-zinc-100/80 text-zinc-400 hover:bg-zinc-200/80 dark:bg-zinc-900/60 dark:text-zinc-500 dark:hover:bg-zinc-700/70'
            : 'bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
      } ${isSelected ? 'accent-ring' : ''}`}
    >
      <span
        className={`mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
          today ? 'accent-bg text-white' : ''
        }`}
      >
        {day}
      </span>

      <span className="block space-y-0.5 overflow-hidden">
        {visibleTodos.map((todo) => (
          <span
            key={todo.id}
            className={`flex min-w-0 items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight ${
              todo.completed ? 'opacity-50 line-through' : ''
            } ${isPast ? 'bg-zinc-200/70 dark:bg-zinc-700/60' : 'bg-zinc-100 dark:bg-zinc-700/80'}`}
            title={todo.title}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[todo.priority]}`} />
            <span className="truncate">{Array.from(todo.title).slice(0, 6).join('')}</span>
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className="block px-1 text-[9px] font-medium text-zinc-400">+{hiddenCount}개</span>
        )}
      </span>
    </button>
  )
}
