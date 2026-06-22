import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TodoFilter } from '@/components/todo/TodoFilter'
import { useTodoStore } from '@/store/useTodoStore'
import { localDateKey } from '@/utils/todo'

describe('TodoFilter', () => {
  it('오늘과 전체 완료 개수를 완료/전체 형식으로 표시', () => {
    const today = localDateKey()
    useTodoStore.setState({
      filter: 'today',
      todos: [
        {
          id: 'today-complete',
          title: '오늘 완료',
          completed: true,
          priority: 'medium',
          dueDate: today,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'today-open',
          title: '오늘 미완료',
          completed: false,
          priority: 'medium',
          dueDate: today,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'other',
          title: '다른 날',
          completed: true,
          priority: 'low',
          dueDate: '2099-01-01',
          createdAt: new Date().toISOString(),
        },
      ],
    })

    render(<TodoFilter />)

    expect(screen.getByText('1/2')).toBeInTheDocument()
    expect(screen.getByText('2/3')).toBeInTheDocument()
  })
})
