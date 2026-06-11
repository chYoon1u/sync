import { useMemo } from 'react'
import { buildCalendarGrid } from '@/utils/date'
import { CalendarDay } from './CalendarDay'
import { useTodoStore } from '@/store/useTodoStore'
import type { Priority } from '@/types/todo'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

interface Props {
  year: number
  month: number
  selectedDate: string
  onSelectDate: (dateStr: string) => void
}

export function CalendarGrid({ year, month, selectedDate, onSelectDate }: Props) {
  const todos = useTodoStore((s) => s.todos)

  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month])

  // 날짜별 투두 dot 정보를 미리 계산
  const dotMap = useMemo(() => {
    const map = new Map<string, { priority: Priority }[]>()
    for (const todo of todos) {
      if (!todo.dueDate) continue
      if (!map.has(todo.dueDate)) map.set(todo.dueDate, [])
      map.get(todo.dueDate)!.push({ priority: todo.priority })
    }
    return map
  }, [todos])

  return (
    <div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-1.5 ${
              i === 0 ? 'text-red-400 dark:text-red-500' : i === 6 ? 'text-blue-400 dark:text-blue-500' : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => (
          <CalendarDay
            key={cell.dateStr}
            dateStr={cell.dateStr}
            day={cell.day}
            isCurrentMonth={cell.isCurrentMonth}
            isSelected={cell.dateStr === selectedDate}
            dots={dotMap.get(cell.dateStr) ?? []}
            onClick={cell.isCurrentMonth ? onSelectDate : () => {}}
          />
        ))}
      </div>
    </div>
  )
}
