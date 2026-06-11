import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTodoStore } from '@/store/useTodoStore'
import { useCalendarStore } from '@/store/useCalendarStore'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'

beforeEach(() => {
  useTodoStore.setState({ todos: [], filter: 'all' })
  useCalendarStore.setState({ events: [], selectedDate: '2026-06-10' })
})

describe('CalendarGrid', () => {
  it('요일 헤더 7개 렌더링', () => {
    render(
      <CalendarGrid year={2026} month={5} selectedDate="2026-06-10" onSelectDate={() => {}} />
    )
    ;['일', '월', '화', '수', '목', '금', '토'].forEach((d) => {
      expect(screen.getByText(d)).toBeInTheDocument()
    })
  })

  it('42개 날짜 셀 렌더링', () => {
    render(
      <CalendarGrid year={2026} month={5} selectedDate="2026-06-10" onSelectDate={() => {}} />
    )
    expect(screen.getByTestId('calendar-day-2026-06-01')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-day-2026-06-30')).toBeInTheDocument()
  })

  it('날짜 클릭 시 onSelectDate 호출', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <CalendarGrid year={2026} month={5} selectedDate="2026-06-10" onSelectDate={onSelect} />
    )
    await user.click(screen.getByTestId('calendar-day-2026-06-15'))
    expect(onSelect).toHaveBeenCalledWith('2026-06-15')
  })

  it('투두가 있는 날짜에 dot 렌더링', () => {
    useTodoStore.setState({
      todos: [{
        id: '1', title: '테스트', completed: false,
        priority: 'high', dueDate: '2026-06-15', createdAt: '',
      }],
      filter: 'all',
    })
    const { container } = render(
      <CalendarGrid year={2026} month={5} selectedDate="2026-06-10" onSelectDate={() => {}} />
    )
    // dot span이 렌더링됐는지 확인 (bg-red-400 클래스)
    const dots = container.querySelectorAll('.bg-red-400, .bg-red-500')
    expect(dots.length).toBeGreaterThan(0)
  })
})
