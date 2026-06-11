import { useState } from 'react'
import { useCalendarStore } from '@/store/useCalendarStore'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import { DayDetail } from './DayDetail'

export function CalendarView() {
  const { selectedDate, setSelectedDate, isCollapsed, setCollapsed } = useCalendarStore()
  const [isDetailOpen, setDetailOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    const date = new Date(`${selectedDate}T00:00:00`)
    return { year: date.getFullYear(), month: date.getMonth() }
  })

  const goPrev = () =>
    setViewDate(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )

  const goNext = () =>
    setViewDate(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setDetailOpen(true)
  }

  if (isCollapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="accent-hover flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl text-zinc-400 transition"
        aria-label="캘린더 펼치기"
        title="캘린더 펼치기"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6M9 9h6m-6 4h4m-7 8h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
        </svg>
        <span className="[writing-mode:vertical-rl] text-xs font-semibold tracking-widest">캘린더 펼치기</span>
      </button>
    )
  }

  return (
    <div className="relative flex h-full min-w-0 flex-col gap-3">
      <CalendarHeader
        year={viewDate.year}
        month={viewDate.month}
        onPrev={goPrev}
        onNext={goNext}
        onCollapse={() => setCollapsed(true)}
      />
      <CalendarGrid
        year={viewDate.year}
        month={viewDate.month}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      {isDetailOpen && (
        <div className="absolute bottom-3 right-3 z-30 flex h-[360px] w-[310px] flex-col rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-2xl dark:border-zinc-700 dark:bg-zinc-800">
          <button
            onClick={() => setDetailOpen(false)}
            className="absolute right-3 top-3 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700"
            aria-label="날짜 상세 닫기"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <DayDetail selectedDate={selectedDate} />
        </div>
      )}
    </div>
  )
}
