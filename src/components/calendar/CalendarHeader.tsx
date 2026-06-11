import { formatYearMonth } from '@/utils/date'

interface Props {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarHeader({ year, month, onPrev, onNext, onToday }: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          {formatYearMonth(year, month)}
        </h2>
        <button
          onClick={onToday}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 hover:text-violet-600 dark:hover:text-violet-400 transition"
        >
          오늘
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
          aria-label="이전 달"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onNext}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
          aria-label="다음 달"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
