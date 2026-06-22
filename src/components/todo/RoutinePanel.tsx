import { useState } from 'react'
import { useTodoStore } from '@/store/useTodoStore'
import type { Priority } from '@/types/todo'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function RoutinePanel() {
  const { routines, addRoutine, deleteRoutine } = useTodoStore()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueTime, setDueTime] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [weekdays, setWeekdays] = useState<number[]>([])

  const saveRoutine = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || (!scheduledDate && weekdays.length === 0)) return
    addRoutine({
      title: trimmed,
      priority,
      dueTime: dueTime || undefined,
      scheduledDate: scheduledDate || undefined,
      weekdays: scheduledDate ? [] : weekdays,
    })
    setTitle('')
    setPriority('medium')
    setDueTime('')
    setScheduledDate('')
    setWeekdays([])
  }

  const toggleWeekday = (day: number) => {
    setScheduledDate('')
    setWeekdays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    )
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/70">
      <p className="mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">루틴 템플릿</p>
      <form onSubmit={saveRoutine} className="space-y-2">
        <div className="flex gap-1.5">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="반복할 일"
            className="accent-focus min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            aria-label="루틴 우선순위"
            className="rounded-lg border border-zinc-200 bg-white px-2 text-[11px] dark:border-zinc-600 dark:bg-zinc-800"
          >
            <option value="high">높음</option>
            <option value="medium">중간</option>
            <option value="low">낮음</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <input
            type="date"
            value={scheduledDate}
            onChange={(event) => {
              setScheduledDate(event.target.value)
              if (event.target.value) setWeekdays([])
            }}
            aria-label="루틴 적용 날짜"
            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] dark:border-zinc-600 dark:bg-zinc-800"
          />
          <input
            type="time"
            value={dueTime}
            onChange={(event) => setDueTime(event.target.value)}
            aria-label="루틴 완료 시간"
            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((label, day) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleWeekday(day)}
              className={`rounded-md py-1 text-[10px] ${
                weekdays.includes(day)
                  ? 'accent-bg text-white'
                  : 'bg-white text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={!title.trim() || (!scheduledDate && weekdays.length === 0)}
          className="accent-bg accent-bg-hover w-full rounded-lg py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          템플릿 저장 및 적용
        </button>
      </form>

      {routines.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-zinc-200 pt-2 dark:border-zinc-700">
          {routines.map((routine) => (
            <li key={routine.id} className="flex items-center gap-2 text-[11px]">
              <span className="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-300">
                {routine.title} ·{' '}
                {routine.scheduledDate
                  ? routine.scheduledDate
                  : routine.weekdays.map((day) => WEEKDAYS[day]).join('·')}
              </span>
              <button
                type="button"
                onClick={() => deleteRoutine(routine.id)}
                className="text-zinc-400 hover:text-red-500"
                aria-label={`${routine.title} 루틴 삭제`}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
