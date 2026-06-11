import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoItem } from '@/components/todo/TodoItem'
import { useTodoStore } from '@/store/useTodoStore'
import type { Todo } from '@/types/todo'

const mockTodo: Todo = {
  id: 'test-id-1',
  title: '테스트 할 일',
  completed: false,
  priority: 'high',
  dueDate: '2099-12-31',
  createdAt: new Date().toISOString(),
}

beforeEach(() => {
  useTodoStore.setState({ todos: [mockTodo], filter: 'allDates' })
})

describe('TodoItem', () => {
  const renderItem = () => render(
    <TodoItem todo={mockTodo} onOpen={vi.fn()} onDragStart={vi.fn()} onDrop={vi.fn()} />
  )

  it('제목과 우선순위 배지 렌더링', () => {
    renderItem()
    expect(screen.getByText('테스트 할 일')).toBeInTheDocument()
    expect(screen.getByText('높음')).toBeInTheDocument()
  })

  it('완료 버튼 클릭 → 스토어에 반영', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.click(screen.getByRole('button', { name: '완료로 표시' }))
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  it('항목 클릭 → 상세 열기 요청', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<TodoItem todo={mockTodo} onOpen={onOpen} onDragStart={vi.fn()} onDrop={vi.fn()} />)
    await user.click(screen.getByText('테스트 할 일'))
    expect(onOpen).toHaveBeenCalledWith(mockTodo)
  })

  it('삭제 버튼 클릭 → 스토어에서 제거', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.hover(screen.getByText('테스트 할 일'))
    await user.click(screen.getByRole('button', { name: '삭제' }))
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })

  it('완료 항목에 취소선 적용', () => {
    const completedTodo = { ...mockTodo, completed: true }
    render(<TodoItem todo={completedTodo} onOpen={vi.fn()} onDragStart={vi.fn()} onDrop={vi.fn()} />)
    const title = screen.getByText('테스트 할 일')
    expect(title.className).toContain('line-through')
  })
})
