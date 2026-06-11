import { useState } from 'react'
import { useCalendarStore } from '@/store/useCalendarStore'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import { DayDetail } from './DayDetail'
import { toDateString } from '@/utils/date'

export function CalendarView() {
  const { selectedDate, setSelectedDate } = useCalendarStore()

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(selectedDate + 'T00:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const goPrev = () =>
    setViewDate(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )

  const goNext = () =>
    setViewDate(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )

  const goToday = () => {
    const today = new Date()
    setViewDate({ year: today.getFullYear(), month: today.getMonth() })
    setSelectedDate(toDateString(today))
  }

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <CalendarHeader
        year={viewDate.year}
        month={viewDate.month}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
      />

      <CalendarGrid
        year={viewDate.year}
        month={viewDate.month}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      {/* 구분선 */}
      <div className="border-t border-zinc-100 dark:border-zinc-700" />

      {/* 선택 날짜 투두 패널 */}
      <div className="flex-1 min-h-0">
        <DayDetail selectedDate={selectedDate} />
      </div>
    </div>
  )
}
