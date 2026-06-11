import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { useTodoStore } from '@/store/useTodoStore'

beforeEach(() => {
  useTodoStore.setState({
    todos: [],
    filter: 'today',
    isCompact: false,
    isAlwaysOnTop: false,
  })
})

describe('useTodoStore', () => {
  it('투두 추가 — 최신 항목이 맨 앞에 삽입됨', () => {
    act(() => useTodoStore.getState().addTodo('첫 번째'))
    act(() => useTodoStore.getState().addTodo('두 번째'))
    expect(useTodoStore.getState().todos[0].title).toBe('두 번째')
  })

  it('투두 추가 — 기본값 확인', () => {
    act(() => useTodoStore.getState().addTodo('테스트', 'high', '2026-12-31', undefined, '18:30'))
    const todo = useTodoStore.getState().todos[0]
    expect(todo.priority).toBe('high')
    expect(todo.dueDate).toBe('2026-12-31')
    expect(todo.dueTime).toBe('18:30')
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
    act(() => useTodoStore.getState().setFilter('allDates'))
    expect(useTodoStore.getState().filter).toBe('allDates')
  })

  it('필터는 persist에서 제외됨 — 오늘이 기본값', () => {
    expect(useTodoStore.getState().filter).toBe('today')
  })

  it('메모 수정', () => {
    act(() => useTodoStore.getState().addTodo('메모 테스트'))
    const id = useTodoStore.getState().todos[0].id
    act(() => useTodoStore.getState().updateTodo(id, { memo: '상세 메모' }))
    expect(useTodoStore.getState().todos[0].memo).toBe('상세 메모')
  })

  it('드래그 순서 변경', () => {
    act(() => {
      useTodoStore.getState().addTodo('첫 번째')
      useTodoStore.getState().addTodo('두 번째')
      useTodoStore.getState().addTodo('세 번째')
    })
    const [third, second] = useTodoStore.getState().todos
    act(() => useTodoStore.getState().reorderTodo(third.id, second.id))
    expect(useTodoStore.getState().todos.map((todo) => todo.title)).toEqual([
      '두 번째',
      '세 번째',
      '첫 번째',
    ])
  })

  it('축소 해제 시 항상 위 설정도 해제', () => {
    act(() => {
      useTodoStore.getState().setCompact(true)
      useTodoStore.getState().setAlwaysOnTop(true)
      useTodoStore.getState().setCompact(false)
    })
    expect(useTodoStore.getState().isCompact).toBe(false)
    expect(useTodoStore.getState().isAlwaysOnTop).toBe(false)
  })
})
