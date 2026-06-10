import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { useCalendarStore } from '@/store/useCalendarStore'

beforeEach(() => {
  useCalendarStore.setState({ events: [], selectedDate: '2026-06-10' })
})

describe('useCalendarStore', () => {
  it('이벤트 추가', () => {
    act(() =>
      useCalendarStore.getState().addEvent({
        title: '회의',
        date: '2026-06-15',
        startTime: '10:00',
        endTime: '11:00',
      })
    )
    const { events } = useCalendarStore.getState()
    expect(events).toHaveLength(1)
    expect(events[0].title).toBe('회의')
    expect(events[0].id).toBeTruthy()
  })

  it('선택 날짜 변경', () => {
    act(() => useCalendarStore.getState().setSelectedDate('2026-07-01'))
    expect(useCalendarStore.getState().selectedDate).toBe('2026-07-01')
  })

  it('이벤트 삭제', () => {
    act(() => useCalendarStore.getState().addEvent({ title: '삭제용', date: '2026-06-10' }))
    const id = useCalendarStore.getState().events[0].id
    act(() => useCalendarStore.getState().deleteEvent(id))
    expect(useCalendarStore.getState().events).toHaveLength(0)
  })
})
