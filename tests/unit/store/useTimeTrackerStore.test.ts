import { act } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore'

beforeEach(() => {
  useTimeTrackerStore.setState({ blocks: [], goals: [] })
})

describe('useTimeTrackerStore', () => {
  it('10분 단위 시간 계획을 저장한다', () => {
    act(() =>
      useTimeTrackerStore.getState().addBlock('2026-06-22', '보고서', 545, 605)
    )
    expect(useTimeTrackerStore.getState().blocks[0]).toMatchObject({
      date: '2026-06-22',
      title: '보고서',
      startMinute: 550,
      endMinute: 610,
    })
  })

  it('날짜별 목표를 추가하고 완료 처리한다', () => {
    act(() => useTimeTrackerStore.getState().addGoal('2026-06-22', '운동'))
    const goal = useTimeTrackerStore.getState().goals[0]
    act(() => useTimeTrackerStore.getState().toggleGoal(goal.id))
    expect(useTimeTrackerStore.getState().goals[0].completed).toBe(true)
  })
})
