import { isToday } from '@/utils/date'
import type { Priority } from '@/types/todo'

interface DotInfo {
  priority: Priority
}

interface Props {
  dateStr: string
  day: number
  isCurrentMonth: boolean
  isSelected: boolean
  dots: DotInfo[]
  onClick: (dateStr: string) => void
}

const PRIORITY_DOT: Record<Priority, string> = {
  high: 'bg-red-400 dark:bg-red-500',
  medium: 'bg-amber-400 dark:bg-amber-500',
  low: 'bg-blue-400 dark:bg-blue-500',
}

export function CalendarDay({ dateStr, day, isCurrentMonth, isSelected, dots, onClick }: Props) {
  const today = isToday(dateStr)

  // 최대 3개 점만 표시, 중복 우선순위는 한 번만
  const uniqueDots = dots.filter((d, i, arr) => arr.findIndex((x) => x.priority === d.priority) === i).slice(0, 3)

  return (
    <button
      data-testid={`calendar-day-${dateStr}`}
      onClick={() => onClick(dateStr)}
      className={`
        relative flex flex-col items-center justify-start pt-1.5 pb-2 rounded-xl
        text-sm font-medium transition-all aspect-square
        ${!isCurrentMonth ? 'opacity-25 cursor-default' : 'cursor-pointer'}
        ${isSelected && isCurrentMonth
          ? 'bg-violet-500 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/50'
          : today && isCurrentMonth
          ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 ring-2 ring-violet-400 dark:ring-violet-500'
          : isCurrentMonth
          ? 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/60'
          : 'text-zinc-400 dark:text-zinc-600'
        }
      `}
    >
      <span>{day}</span>

      {/* 투두 점 표시 */}
      {uniqueDots.length > 0 && (
        <div className="flex items-center gap-0.5 mt-1">
          {uniqueDots.map((dot, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                isSelected ? 'bg-white/80' : PRIORITY_DOT[dot.priority]
              }`}
            />
          ))}
        </div>
      )}
    </button>
  )
}
