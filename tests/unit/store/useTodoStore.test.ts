import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { useTodoStore } from '@/store/useTodoStore'

beforeEach(() => {
  useTodoStore.setState({ todos: [] })
})

describe('useTodoStore', () => {
  it('투두 추가', () => {
    act(() => useTodoStore.getState().addTodo('테스트 할 일', 'high'))
    const { todos } = useTodoStore.getState()
    expect(todos).toHaveLength(1)
    expect(todos[0].title).toBe('테스트 할 일')
    expect(todos[0].priority).toBe('high')
    expect(todos[0].completed).toBe(false)
  })

  it('투두 완료 토글', () => {
    act(() => useTodoStore.getState().addTodo('토글 테스트'))
    const id = useTodoStore.getState().todos[0].id
    act(() => useTodoStore.getState().toggleTodo(id))
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
    act(() => useTodoStore.getState().toggleTodo(id))
    expect(useTodoStore.getState().todos[0].completed).toBe(false)
  })

  it('투두 삭제', () => {
    act(() => useTodoStore.getState().addTodo('삭제 테스트'))
    const id = useTodoStore.getState().todos[0].id
    act(() => useTodoStore.getState().deleteTodo(id))
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })

  it('투두 수정', () => {
    act(() => useTodoStore.getState().addTodo('수정 전'))
    const id = useTodoStore.getState().todos[0].id
    act(() => useTodoStore.getState().updateTodo(id, { title: '수정 후', priority: 'low' }))
    const todo = useTodoStore.getState().todos[0]
    expect(todo.title).toBe('수정 후')
    expect(todo.priority).toBe('low')
  })
})
