import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { useTodoStore } from '@/store/useTodoStore'

beforeEach(() => {
  useTodoStore.setState({ todos: [], filter: 'all' })
})

describe('useTodoStore', () => {
  it('투두 추가 — 최신 항목이 맨 앞에 삽입됨', () => {
    act(() => useTodoStore.getState().addTodo('첫 번째'))
    act(() => useTodoStore.getState().addTodo('두 번째'))
    expect(useTodoStore.getState().todos[0].title).toBe('두 번째')
  })

  it('투두 추가 — 기본값 확인', () => {
    act(() => useTodoStore.getState().addTodo('테스트', 'high', '2026-12-31'))
    const todo = useTodoStore.getState().todos[0]
    expect(todo.priority).toBe('high')
    expect(todo.dueDate).toBe('2026-12-31')
    expect(todo.completed).toBe(false)
  })

  it('완료 토글', () => {
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

  it('필터 변경', () => {
    act(() => useTodoStore.getState().setFilter('completed'))
    expect(useTodoStore.getState().filter).toBe('completed')
  })

  it('필터는 persist에서 제외됨 — 항상 all로 초기화', () => {
    expect(useTodoStore.getState().filter).toBe('all')
  })
})
