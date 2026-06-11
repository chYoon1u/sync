import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoDetailModal } from '@/components/todo/TodoDetailModal'
import { useTodoStore } from '@/store/useTodoStore'
import type { Todo } from '@/types/todo'

const todo: Todo = {
  id: 'detail-test',
  title: '상세 테스트',
  memo: '기존 메모',
  completed: false,
  priority: 'medium',
  dueDate: '2026-06-11',
  dueTime: '14:00',
  createdAt: '2026-06-11T00:00:00.000Z',
}

describe('TodoDetailModal', () => {
  it('제목과 메모를 수정해 저장', async () => {
    useTodoStore.setState({ todos: [todo] })
    const user = userEvent.setup()
    render(<TodoDetailModal todo={todo} onClose={() => undefined} />)

    const title = screen.getByDisplayValue('상세 테스트')
    const memo = screen.getByDisplayValue('기존 메모')
    const dueTime = screen.getByDisplayValue('14:00')
    await user.clear(title)
    await user.type(title, '수정된 상세')
    await user.clear(memo)
    await user.type(memo, '수정된 메모')
    await user.clear(dueTime)
    await user.type(dueTime, '16:30')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(useTodoStore.getState().todos[0]).toMatchObject({
      title: '수정된 상세',
      memo: '수정된 메모',
      dueTime: '16:30',
    })
  })
})
