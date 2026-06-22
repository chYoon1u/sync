import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { useTodoStore } from '@/store/useTodoStore'

beforeEach(() => {
  useTodoStore.setState({
    todos: [],
    routines: [],
    dismissedRoutineOccurrences: [],
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

  it('기간 설정 시 시작일부터 종료일까지 매일 투두 생성', () => {
    act(() =>
      useTodoStore
        .getState()
        .addTodo('기간 투두', 'medium', '2026-06-22', undefined, '09:00', '2026-06-24')
    )
    expect(useTodoStore.getState().todos.map((todo) => todo.dueDate)).toEqual([
      '2026-06-22',
      '2026-06-23',
      '2026-06-24',
    ])
    expect(new Set(useTodoStore.getState().todos.map((todo) => todo.seriesId)).size).toBe(1)
  })

  it('미완료 투두를 다음 날로 이월', () => {
    act(() => useTodoStore.getState().addTodo('이월', 'medium', '2026-06-22'))
    const id = useTodoStore.getState().todos[0].id
    act(() => useTodoStore.getState().moveTodoToNextDay(id))
    expect(useTodoStore.getState().todos[0].dueDate).toBe('2026-06-23')
  })

  it('요일 루틴을 생성하고 같은 날짜 중복 생성을 막음', () => {
    act(() =>
      useTodoStore.getState().addRoutine({
        title: '월요일 루틴',
        priority: 'low',
        weekdays: [1],
      })
    )
    const routine = useTodoStore.getState().routines[0]
    act(() => useTodoStore.getState().materializeRoutines('2026-06-22', 7))
    act(() => useTodoStore.getState().materializeRoutines('2026-06-22', 7))
    const occurrences = useTodoStore
      .getState()
      .todos.filter((todo) => todo.routineId === routine.id && todo.dueDate === '2026-06-22')
    expect(occurrences).toHaveLength(1)
  })

  it('삭제한 루틴 발생 항목은 다시 생성하지 않음', () => {
    act(() =>
      useTodoStore.getState().addRoutine({
        title: '삭제할 루틴',
        priority: 'medium',
        scheduledDate: '2026-06-22',
        weekdays: [],
      })
    )
    const todo = useTodoStore.getState().todos.find((item) => item.dueDate === '2026-06-22')
    expect(todo).toBeDefined()
    act(() => useTodoStore.getState().deleteTodo(todo!.id))
    act(() => useTodoStore.getState().materializeRoutines('2026-06-22', 1))
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })
})
