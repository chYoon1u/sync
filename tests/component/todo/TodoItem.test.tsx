import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
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
  useTodoStore.setState({ todos: [mockTodo], filter: 'all' })
})

describe('TodoItem', () => {
  it('제목과 우선순위 배지 렌더링', () => {
    render(<TodoItem todo={mockTodo} />)
    expect(screen.getByText('테스트 할 일')).toBeInTheDocument()
    expect(screen.getByText('높음')).toBeInTheDocument()
  })

  it('완료 버튼 클릭 → 스토어에 반영', async () => {
    const user = userEvent.setup()
    render(<TodoItem todo={mockTodo} />)
    await user.click(screen.getByRole('button', { name: '완료로 표시' }))
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  it('수정 버튼 클릭 → 편집 모드 진입', async () => {
    const user = userEvent.setup()
    render(<TodoItem todo={mockTodo} />)
    await user.hover(screen.getByText('테스트 할 일'))
    await user.click(screen.getByRole('button', { name: '수정' }))
    expect(screen.getByDisplayValue('테스트 할 일')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('편집 후 저장 → 스토어 업데이트', async () => {
    const user = userEvent.setup()
    render(<TodoItem todo={mockTodo} />)
    await user.hover(screen.getByText('테스트 할 일'))
    await user.click(screen.getByRole('button', { name: '수정' }))
    const input = screen.getByDisplayValue('테스트 할 일')
    await user.clear(input)
    await user.type(input, '수정된 할 일')
    await user.click(screen.getByRole('button', { name: '저장' }))
    expect(useTodoStore.getState().todos[0].title).toBe('수정된 할 일')
  })

  it('삭제 버튼 클릭 → 스토어에서 제거', async () => {
    const user = userEvent.setup()
    render(<TodoItem todo={mockTodo} />)
    await user.hover(screen.getByText('테스트 할 일'))
    await user.click(screen.getByRole('button', { name: '삭제' }))
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })

  it('완료 항목에 취소선 적용', () => {
    const completedTodo = { ...mockTodo, completed: true }
    render(<TodoItem todo={completedTodo} />)
    const title = screen.getByText('테스트 할 일')
    expect(title.className).toContain('line-through')
  })
})
