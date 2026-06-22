import { useEffect, useRef, useState } from 'react'
import { useTimerStore } from '@/store/useTimerStore'
import { localDateKey } from '@/utils/todo'

function formatClock(seconds: number): string {
  const safe = Math.max(0, seconds)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

function notifyTimer(message: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Sync 타이머', { body: message, icon: '/Timer.svg' })
  }
}

export function TimerView() {
  const {
    routines,
    status,
    label,
    remainingSeconds,
    completionSerial,
    start,
    pause,
    resume,
    reset,
    tick,
    addRoutine,
    deleteRoutine,
    startRoutine,
  } = useTimerStore()
  const [minutes, setMinutes] = useState(25)
  const [alarmAt, setAlarmAt] = useState('')
  const [routineName, setRoutineName] = useState('')
  const [stepsText, setStepsText] = useState('25, 10, 25')
  const [scheduledTime, setScheduledTime] = useState('')
  const [repeat, setRepeat] = useState(false)
  const previousSerial = useRef(completionSerial)

  useEffect(() => {
    const interval = window.setInterval(() => {
      tick()
      const now = new Date()
      const dateKey = localDateKey(now)
      const timeKey = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const state = useTimerStore.getState()
      if (state.status !== 'idle') return
      const scheduled = state.routines.find(
        (routine) =>
          routine.scheduledTime === timeKey && routine.lastAutoStartDate !== dateKey
      )
      if (scheduled) {
        void requestNotificationPermission()
        state.startRoutine(scheduled.id, dateKey)
      }
    }, 500)
    return () => window.clearInterval(interval)
  }, [tick])

  useEffect(() => {
    if (completionSerial === previousSerial.current) return
    previousSerial.current = completionSerial
    notifyTimer(`${label} 단계가 완료되었습니다.`)
  }, [completionSerial, label])

  const startMinutes = async (value = minutes) => {
    await requestNotificationPermission()
    start(value * 60, `${value}분 타이머`)
  }

  const startAlarm = async () => {
    if (!alarmAt) return
    const target = new Date(alarmAt).getTime()
    const seconds = Math.ceil((target - Date.now()) / 1000)
    if (seconds <= 0) return
    await requestNotificationPermission()
    start(seconds, '알림 시계')
  }

  const saveRoutine = (event: React.FormEvent) => {
    event.preventDefault()
    const steps = stepsText
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0)
      .map((value, index) => ({
        label: `${index + 1}단계 · ${value}분`,
        durationSeconds: value * 60,
      }))
    addRoutine(routineName, steps, repeat, scheduledTime)
    setRoutineName('')
  }

  return (
    <div className="scrollbar-hidden flex h-full min-h-0 flex-col gap-3 overflow-y-auto text-left">
      <div>
        <h2 className="compact-section-title font-semibold text-zinc-800 dark:text-zinc-100">TIMER</h2>
        <p className="mt-1 text-[10px] text-zinc-400">알림 시계, 뽀모도로, 반복 루틴</p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-xs font-semibold text-zinc-500">{label}</p>
        <p className="my-4 text-5xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100">
          {formatClock(remainingSeconds)}
        </p>
        <div className="flex justify-center gap-2">
          {status === 'running' ? (
            <button onClick={pause} className="rounded-xl bg-zinc-200 px-5 py-2 text-xs font-semibold dark:bg-zinc-700">
              일시정지
            </button>
          ) : status === 'paused' ? (
            <button onClick={resume} className="accent-bg rounded-xl px-5 py-2 text-xs font-semibold text-white">
              계속
            </button>
          ) : null}
          <button onClick={reset} className="rounded-xl bg-zinc-100 px-5 py-2 text-xs text-zinc-500 dark:bg-zinc-800">
            초기화
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="mb-2 text-xs font-semibold">빠른 타이머</p>
          <div className="flex gap-1">
            {[10, 25, 50].map((value) => (
              <button key={value} onClick={() => void startMinutes(value)} className="flex-1 rounded-lg bg-zinc-100 py-2 text-xs dark:bg-zinc-800">
                {value}분
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              aria-label="타이머 분"
              className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-2 text-xs dark:border-zinc-700 dark:bg-zinc-800"
            />
            <button onClick={() => void startMinutes()} className="accent-bg rounded-lg px-3 py-2 text-xs text-white">시작</button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="mb-2 text-xs font-semibold">알림 시계</p>
          <input
            type="datetime-local"
            value={alarmAt}
            onChange={(event) => setAlarmAt(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-2 py-2 text-[10px] dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button onClick={() => void startAlarm()} className="accent-bg mt-2 w-full rounded-lg py-2 text-xs text-white">
            알림 설정
          </button>
        </section>
      </div>

      <form onSubmit={saveRoutine} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="mb-2 text-xs font-semibold">타이머 루틴 만들기</p>
        <div className="grid grid-cols-2 gap-2">
          <input value={routineName} onChange={(event) => setRoutineName(event.target.value)} placeholder="루틴 이름" className="rounded-lg border border-zinc-200 px-2 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-800" />
          <input value={stepsText} onChange={(event) => setStepsText(event.target.value)} placeholder="분 단위: 25, 10, 25" className="rounded-lg border border-zinc-200 px-2 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-800" />
          <input type="time" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} aria-label="루틴 자동 시작 시간" className="rounded-lg border border-zinc-200 px-2 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-800" />
          <label className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 text-xs dark:bg-zinc-800">
            <input type="checkbox" checked={repeat} onChange={(event) => setRepeat(event.target.checked)} />
            전체 루틴 반복
          </label>
        </div>
        <button type="submit" disabled={!routineName.trim()} className="accent-bg mt-2 w-full rounded-lg py-2 text-xs font-semibold text-white disabled:opacity-40">
          루틴 저장
        </button>
      </form>

      {routines.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <ul className="space-y-1">
            {routines.map((routine) => (
              <li key={routine.id} className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{routine.name}</p>
                  <p className="text-[10px] text-zinc-400">
                    {routine.steps.map((step) => `${step.durationSeconds / 60}분`).join(' → ')}
                    {routine.repeat ? ' · 반복' : ''}
                    {routine.scheduledTime ? ` · ${routine.scheduledTime}` : ''}
                  </p>
                </div>
                <button onClick={() => { void requestNotificationPermission(); startRoutine(routine.id) }} className="accent-bg rounded-lg px-3 py-1.5 text-[10px] text-white">
                  실행
                </button>
                <button onClick={() => deleteRoutine(routine.id)} className="text-[10px] text-zinc-400 hover:text-red-500">삭제</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
