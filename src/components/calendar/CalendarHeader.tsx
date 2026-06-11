import { formatYearMonth } from '@/utils/date'

interface Props {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  onCollapse: () => void
}

export function CalendarHeader({ year, month, onPrev, onNext, onCollapse }: Props) {
  return (
    <div className="grid grid-cols-[96px_1fr_96px] items-center">
      <div className="flex items-center gap-1">
        <button onClick={onPrev} className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200" aria-label="이전 달">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
          </svg>
        </button>
        <button onClick={onNext} className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200" aria-label="다음 달">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </div>

      <h2 className="m-0 text-center text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        {formatYearMonth(year, month)}
      </h2>

      <div className="flex justify-end">
        <button onClick={onCollapse} className="accent-hover rounded-lg p-2 text-zinc-400 transition" aria-label="캘린더 접기" title="캘린더 접기">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 5-7 7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
