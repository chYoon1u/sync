import { useMemo, useState } from 'react'
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore'
import { addDays, localDateKey } from '@/utils/todo'

const START_HOUR = 6
const HOURS = 23
const SLOTS_PER_HOUR = 6
const SLOT_MINUTES = 10
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']

interface Selection {
  date: string
  startMinute: number
  endMinute?: number
}

function chronologicalMinute(hourIndex: number, slotIndex: number): number {
  return START_HOUR * 60 + hourIndex * 60 + slotIndex * SLOT_MINUTES
}

function formatMinute(minute: number): string {
  const normalized = minute % 1440
  const hour = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function formatHour(minute: number): string {
  return String(Math.floor((minute % 1440) / 60))
}

function weekStartFor(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`)
  return addDays(dateKey, date.getDay() === 0 ? -6 : 1 - date.getDay())
}

export function TimeTrackerView({ compact = false }: { compact?: boolean }) {
  const { blocks, goals, addBlock, deleteBlock, addGoal, toggleGoal, deleteGoal } =
    useTimeTrackerStore()
  const [selectedDate, setSelectedDate] = useState(localDateKey)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [blockTitle, setBlockTitle] = useState('')
  const [weeklyGoalDrafts, setWeeklyGoalDrafts] = useState<Record<string, string>>({})

  const weekStart = useMemo(() => weekStartFor(selectedDate), [selectedDate])
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  )

  const selectSlot = (date: string, minute: number) => {
    if (!selection || selection.date !== date || selection.endMinute !== undefined) {
      setSelection({ date, startMinute: minute })
      setBlockTitle('')
      return
    }
    const start = Math.min(selection.startMinute, minute)
    const end = Math.max(selection.startMinute, minute) + SLOT_MINUTES
    setSelection({ date, startMinute: start, endMinute: Math.min(end, 1740) })
  }

  const saveBlock = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selection || selection.endMinute === undefined || !blockTitle.trim()) return
    addBlock(selection.date, blockTitle, selection.startMinute, selection.endMinute)
    setSelection(null)
    setBlockTitle('')
  }

  const saveWeeklyGoal = (event: React.FormEvent, date: string) => {
    event.preventDefault()
    const title = weeklyGoalDrafts[date] ?? ''
    if (!title.trim()) return
    addGoal(date, title)
    setWeeklyGoalDrafts((current) => ({ ...current, [date]: '' }))
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 text-left">
      <header className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="compact-section-title font-semibold text-zinc-800 dark:text-zinc-100">
            TIME PLANNER
          </h2>
          <p className="mt-0.5 text-[10px] text-zinc-400">
            한 칸 10분 · 시작과 종료 칸을 차례로 선택
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value)
            setSelection(null)
          }}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] dark:border-zinc-700 dark:bg-zinc-900"
        />
      </header>

      {selection?.endMinute !== undefined && (
        <form onSubmit={saveBlock} className="accent-soft flex items-center gap-2 rounded-lg border p-2">
          <span className="shrink-0 text-[10px] font-semibold accent-text">
            {selection.date} · {formatMinute(selection.startMinute)}–
            {formatMinute(selection.endMinute)}
          </span>
          <input
            autoFocus
            value={blockTitle}
            onChange={(event) => setBlockTitle(event.target.value)}
            placeholder="목표 또는 일정"
            className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800"
          />
          <button className="accent-bg rounded-md px-3 py-1 text-[10px] text-white">추가</button>
          <button type="button" onClick={() => setSelection(null)} className="text-[10px] text-zinc-400">
            취소
          </button>
        </form>
      )}

      <div className={`grid min-h-0 flex-1 gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-[minmax(260px,0.72fr)_minmax(0,1.8fr)]'}`}>
        <PlannerPanel title="Daily" subtitle={selectedDate}>
          <DayGrid
            date={selectedDate}
            blocks={blocks}
            selection={selection}
            onSelectSlot={selectSlot}
            onDeleteBlock={deleteBlock}
          />
        </PlannerPanel>

        {!compact && (
          <PlannerPanel title="Weekly" subtitle={`${weekDates[0]} – ${weekDates[6]}`}>
            <WeeklyGoals
              dates={weekDates}
              goals={goals}
              drafts={weeklyGoalDrafts}
              setDrafts={setWeeklyGoalDrafts}
              saveGoal={saveWeeklyGoal}
              toggleGoal={toggleGoal}
              deleteGoal={deleteGoal}
            />
            <WeekGrid
              dates={weekDates}
              blocks={blocks}
              selection={selection}
              onSelectSlot={selectSlot}
              onDeleteBlock={deleteBlock}
            />
          </PlannerPanel>
        )}
      </div>
    </div>
  )
}

function PlannerPanel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{title}</p>
        <p className="text-[9px] text-zinc-400">{subtitle}</p>
      </header>
      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col overflow-auto">
        {children}
      </div>
    </section>
  )
}

function WeeklyGoals({
  dates,
  goals,
  drafts,
  setDrafts,
  saveGoal,
  toggleGoal,
  deleteGoal,
}: {
  dates: string[]
  goals: ReturnType<typeof useTimeTrackerStore.getState>['goals']
  drafts: Record<string, string>
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  saveGoal: (event: React.FormEvent, date: string) => void
  toggleGoal: (id: string) => void
  deleteGoal: (id: string) => void
}) {
  return (
    <div
      className="grid min-h-24 min-w-[700px] flex-1 border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
      style={{ gridTemplateColumns: '42px repeat(42, minmax(14px, 1fr))' }}
    >
      <div
        className="flex items-center justify-center text-[8px] font-semibold text-zinc-400"
        style={{ gridColumn: 1 }}
      >
        목표
      </div>
      {dates.map((date, index) => (
        <div
          key={date}
          className="border-l border-zinc-200 px-1 py-1 dark:border-zinc-700"
          style={{ gridColumn: `${2 + index * SLOTS_PER_HOUR} / span ${SLOTS_PER_HOUR}` }}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[9px] font-semibold text-zinc-500">{WEEKDAYS[index]}</span>
            <span className="text-[8px] text-zinc-400">{date.slice(5)}</span>
          </div>
          <form onSubmit={(event) => saveGoal(event, date)} className="flex gap-0.5">
            <input
              value={drafts[date] ?? ''}
              onChange={(event) =>
                setDrafts((current) => ({ ...current, [date]: event.target.value }))
              }
              placeholder="목표"
              aria-label={`${date} 목표`}
              className="min-w-0 flex-1 border-b border-zinc-200 bg-transparent px-0.5 text-[9px] outline-none dark:border-zinc-700"
            />
            <button className="text-[10px] accent-text" aria-label={`${date} 목표 추가`}>+</button>
          </form>
          <ul className="mt-1 space-y-0.5">
            {goals.filter((goal) => goal.date === date).slice(0, 3).map((goal) => (
              <li key={goal.id} className="group flex min-w-0 items-center gap-1">
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className={`h-2.5 w-2.5 shrink-0 rounded-sm border ${
                    goal.completed ? 'accent-bg accent-border' : 'border-zinc-300'
                  }`}
                  aria-label={goal.completed ? '목표 완료 취소' : '목표 완료'}
                />
                <span className={`min-w-0 flex-1 truncate text-[8px] ${goal.completed ? 'line-through text-zinc-400' : ''}`}>
                  {goal.title}
                </span>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-[8px] text-zinc-300 opacity-0 group-hover:opacity-100"
                  aria-label={`${goal.title} 목표 삭제`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function DayGrid({
  date,
  blocks,
  selection,
  onSelectSlot,
  onDeleteBlock,
}: GridProps & { date: string }) {
  return (
    <div className="flex min-h-0 min-w-[250px] flex-1 justify-center overflow-hidden">
      <div
        className="grid h-full w-[34px] shrink-0"
        style={{ gridTemplateRows: `repeat(${HOURS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: HOURS }, (_, hourIndex) => (
          <div
            key={hourIndex}
            className="flex min-h-0 items-center justify-end border-t border-zinc-300 bg-white pr-1 text-[8px] leading-none tabular-nums text-zinc-400 dark:border-zinc-600 dark:bg-zinc-900"
          >
            {formatHour(chronologicalMinute(hourIndex, 0))}
          </div>
        ))}
      </div>
      <div
        className="grid h-full shrink-0"
        style={{
          aspectRatio: `${SLOTS_PER_HOUR} / ${HOURS}`,
          gridTemplateColumns: `repeat(${SLOTS_PER_HOUR}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${HOURS}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: HOURS }, (_, hourIndex) =>
          Array.from({ length: SLOTS_PER_HOUR }, (_, slotIndex) => {
            const minute = chronologicalMinute(hourIndex, slotIndex)
            const selected =
              selection?.date === date &&
              minute >= selection.startMinute &&
              minute < (selection.endMinute ?? selection.startMinute + SLOT_MINUTES)
            const block = blocks.find(
              (item) =>
                item.date === date &&
                minute >= item.startMinute &&
                minute < item.endMinute
            )
            const isBlockStart = block?.startMinute === minute

            return (
              <button
                key={`${date}-${minute}`}
                onClick={() => block ? onDeleteBlock(block.id) : onSelectSlot(date, minute)}
                aria-label={`${date} ${formatMinute(minute)}${block ? ` ${block.title}` : ''}`}
                title={block ? `${block.title} · 클릭하여 삭제` : formatMinute(minute)}
                className={`relative block aspect-square h-full min-h-0 w-full border-l border-t p-0 text-left leading-none transition ${
                  slotIndex === 0
                    ? 'border-l-zinc-300 dark:border-l-zinc-600'
                    : 'border-l-zinc-100 dark:border-l-zinc-800'
                } border-t-zinc-300 dark:border-t-zinc-600 ${
                  block
                    ? 'accent-bg text-white'
                    : selected
                      ? 'accent-soft'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {isBlockStart && (
                  <span className="absolute left-0.5 top-0 max-w-20 truncate text-[7px] font-semibold">
                    {block.title}
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

function WeekGrid({ dates, blocks, selection, onSelectSlot, onDeleteBlock }: GridProps & { dates: string[] }) {
  return (
    <div className="min-w-[700px] shrink-0">
      <div
        className="grid"
        style={{
          gridTemplateColumns: '42px repeat(42, minmax(14px, 1fr))',
          gridTemplateRows: `repeat(${HOURS}, 16px)`,
        }}
      >
        {Array.from({ length: HOURS }, (_, hourIndex) => (
          <HourRow
            key={hourIndex}
            dates={dates}
            hourIndex={hourIndex}
            blocks={blocks}
            selection={selection}
            onSelectSlot={onSelectSlot}
            onDeleteBlock={onDeleteBlock}
          />
        ))}
      </div>
    </div>
  )
}

interface GridProps {
  blocks: ReturnType<typeof useTimeTrackerStore.getState>['blocks']
  selection: Selection | null
  onSelectSlot: (date: string, minute: number) => void
  onDeleteBlock: (id: string) => void
}

function HourRow({
  date,
  dates,
  hourIndex,
  blocks,
  selection,
  onSelectSlot,
  onDeleteBlock,
  daily = false,
}: GridProps & {
  date?: string
  dates?: string[]
  hourIndex: number
  daily?: boolean
}) {
  const rowDates = date ? [date] : dates ?? []
  const hourStart = chronologicalMinute(hourIndex, 0)
  return (
    <>
      <div
        className="sticky left-0 z-20 flex min-h-0 items-center justify-end border-t border-zinc-300 bg-white pr-1 text-[8px] leading-none tabular-nums text-zinc-400 dark:border-zinc-600 dark:bg-zinc-900"
        style={{ gridRow: hourIndex + 1, gridColumn: 1 }}
      >
        {formatHour(hourStart)}
      </div>
      {rowDates.flatMap((rowDate, dateIndex) =>
        Array.from({ length: SLOTS_PER_HOUR }, (_, slotIndex) => {
          const minute = chronologicalMinute(hourIndex, slotIndex)
          const selected =
            selection?.date === rowDate &&
            minute >= selection.startMinute &&
            minute < (selection.endMinute ?? selection.startMinute + SLOT_MINUTES)
          const column = 2 + dateIndex * SLOTS_PER_HOUR + slotIndex
          const block = blocks.find(
            (item) =>
              item.date === rowDate &&
              minute >= item.startMinute &&
              minute < item.endMinute
          )
          const isBlockStart = block?.startMinute === minute
          return (
            <button
              key={`${rowDate}-${minute}`}
              onClick={() => block ? onDeleteBlock(block.id) : onSelectSlot(rowDate, minute)}
              aria-label={`${rowDate} ${formatMinute(minute)}${block ? ` ${block.title}` : ''}`}
              title={block ? `${block.title} · 클릭하여 삭제` : `${formatMinute(minute)}`}
              className={`relative block h-full min-h-0 w-full border-l border-t p-0 text-left leading-none transition ${
                slotIndex === 0 ? 'border-l-zinc-300 dark:border-l-zinc-600' : 'border-l-zinc-100 dark:border-l-zinc-800'
              } border-t-zinc-300 dark:border-t-zinc-600 ${
                block
                  ? 'accent-bg text-white'
                  : selected
                    ? 'accent-soft'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
              style={{ gridRow: hourIndex + 1, gridColumn: column }}
            >
              {isBlockStart && (
                <span className={`absolute left-0.5 top-0 truncate text-[7px] font-semibold ${daily ? 'max-w-20' : 'max-w-10'}`}>
                  {block.title}
                </span>
              )}
            </button>
          )
        })
      )}
    </>
  )
}
