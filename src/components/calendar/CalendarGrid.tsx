import { useMemo } from 'react'
import { buildCalendarGrid } from '@/utils/date'
import { CalendarDay } from './CalendarDay'
import { useTodoStore } from '@/store/useTodoStore'
import type { Todo } from '@/types/todo'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

interface Props {
  year: number
  month: number
  selectedDate: string
  onSelectDate: (dateStr: string) => void
}

export function CalendarGrid({ year, month, selectedDate, onSelectDate }: Props) {
  const todos = useTodoStore((state) => state.todos)
  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month])

  const todosByDate = useMemo(() => {
    const map = new Map<string, Todo[]>()
    for (const todo of todos) {
      if (!todo.dueDate) continue
      const dateTodos = map.get(todo.dueDate) ?? []
      dateTodos.push(todo)
      map.set(todo.dueDate, dateTodos)
    }
    return map
  }, [todos])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="grid shrink-0 grid-cols-7 gap-1">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`py-2 text-center text-xs font-semibold ${
              index === 0
                ? 'text-red-400'
                : index === 6
                  ? 'text-blue-400'
                  : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1">
        {cells.map((cell) => (
          <CalendarDay
            key={cell.dateStr}
            dateStr={cell.dateStr}
            day={cell.day}
            isCurrentMonth={cell.isCurrentMonth}
            isSelected={cell.dateStr === selectedDate}
            todos={todosByDate.get(cell.dateStr) ?? []}
            onClick={onSelectDate}
          />
        ))}
      </div>
    </div>
  )
}
