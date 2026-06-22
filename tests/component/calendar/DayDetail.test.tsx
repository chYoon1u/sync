import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { DayDetail } from '@/components/calendar/DayDetail'
import { useTodoStore } from '@/store/useTodoStore'

beforeEach(() => {
  useTodoStore.setState({ todos: [] })
})

describe('DayDetail', () => {
  it('플러스 아이콘 버튼으로 선택 날짜에 투두를 추가', async () => {
    const user = userEvent.setup()
    render(<DayDetail selectedDate="2026-06-22" />)

    await user.type(screen.getByPlaceholderText('이 날짜에 추가...'), '캘린더 투두')
    await user.click(screen.getByRole('button', { name: '이 날짜에 투두 추가' }))

    expect(useTodoStore.getState().todos[0]).toMatchObject({
      title: '캘린더 투두',
      dueDate: '2026-06-22',
    })
  })
})
