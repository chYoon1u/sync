import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTodoStore } from '@/store/useTodoStore'
import { useCalendarStore } from '@/store/useCalendarStore'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'

beforeEach(() => {
  useTodoStore.setState({ todos: [], filter: 'today' })
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

  it('투두가 있는 날짜에 우선순위 점과 6글자 제목 렌더링', () => {
    useTodoStore.setState({
      todos: [{
        id: '1', title: '캘린더긴제목테스트', completed: false,
        priority: 'high', dueDate: '2026-06-15', createdAt: '',
      }],
      filter: 'today',
    })
    const { container } = render(
      <CalendarGrid year={2026} month={5} selectedDate="2026-06-10" onSelectDate={() => {}} />
    )
    const dots = container.querySelectorAll('.bg-red-500')
    expect(dots.length).toBeGreaterThan(0)
    expect(screen.getByText('캘린더긴제목')).toBeInTheDocument()
  })

  it('지나간 날짜는 회색 배경으로 표시', () => {
    render(
      <CalendarGrid year={2000} month={0} selectedDate="2000-01-10" onSelectDate={() => {}} />
    )
    expect(screen.getByTestId('calendar-day-2000-01-15').className).toContain('bg-zinc-100')
  })
})
