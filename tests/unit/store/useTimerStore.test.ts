import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTimerStore } from '@/store/useTimerStore'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-06-22T09:00:00'))
  useTimerStore.setState({
    routines: [],
    status: 'idle',
    label: '타이머',
    remainingSeconds: 0,
    endsAt: null,
    activeRoutineId: null,
    stepIndex: 0,
    completionSerial: 0,
  })
})

describe('useTimerStore', () => {
  it('타이머를 시작하고 일시정지/재개한다', () => {
    act(() => useTimerStore.getState().start(60, '집중'))
    expect(useTimerStore.getState()).toMatchObject({
      status: 'running',
      label: '집중',
      remainingSeconds: 60,
    })

    vi.advanceTimersByTime(10_000)
    act(() => useTimerStore.getState().pause())
    expect(useTimerStore.getState().remainingSeconds).toBe(50)

    act(() => useTimerStore.getState().resume())
    expect(useTimerStore.getState().status).toBe('running')
  })

  it('루틴의 다음 단계로 자동 전환한다', () => {
    act(() =>
      useTimerStore.getState().addRoutine(
        '뽀모도로',
        [
          { label: '집중', durationSeconds: 2 },
          { label: '휴식', durationSeconds: 3 },
        ],
        false
      )
    )
    const routine = useTimerStore.getState().routines[0]
    act(() => useTimerStore.getState().startRoutine(routine.id))
    act(() => useTimerStore.getState().tick(Date.now() + 2_000))

    expect(useTimerStore.getState()).toMatchObject({
      status: 'running',
      label: '휴식',
      stepIndex: 1,
      remainingSeconds: 3,
    })
  })

  it('반복 루틴은 마지막 단계 뒤 첫 단계로 돌아간다', () => {
    act(() =>
      useTimerStore.getState().addRoutine(
        '반복',
        [{ label: '집중', durationSeconds: 1 }],
        true
      )
    )
    const routine = useTimerStore.getState().routines[0]
    act(() => useTimerStore.getState().startRoutine(routine.id))
    act(() => useTimerStore.getState().tick(Date.now() + 1_000))

    expect(useTimerStore.getState()).toMatchObject({
      status: 'running',
      label: '집중',
      stepIndex: 0,
    })
  })
})
