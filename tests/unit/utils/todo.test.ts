import { describe, expect, it } from 'vitest'
import { addDays, dateRange, isTodoOverdue } from '@/utils/todo'
import type { Todo } from '@/types/todo'

const todo: Todo = {
  id: 'todo',
  title: '마감 테스트',
  completed: false,
  priority: 'medium',
  dueDate: '2026-06-22',
  createdAt: '2026-06-22T00:00:00.000Z',
}

describe('todo utils', () => {
  it('월 경계를 넘어 날짜를 더함', () => {
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01')
  })

  it('양끝을 포함한 날짜 범위를 생성', () => {
    expect(dateRange('2026-06-22', '2026-06-24')).toEqual([
      '2026-06-22',
      '2026-06-23',
      '2026-06-24',
    ])
  })

  it('시간이 있으면 지정 시간 이후에 이월 가능', () => {
    expect(
      isTodoOverdue({ ...todo, dueTime: '14:00' }, new Date('2026-06-22T13:59:59'))
    ).toBe(false)
    expect(
      isTodoOverdue({ ...todo, dueTime: '14:00' }, new Date('2026-06-22T14:00:00'))
    ).toBe(true)
  })

  it('시간이 없으면 다음 날 자정부터 이월 가능', () => {
    expect(isTodoOverdue(todo, new Date('2026-06-22T23:59:59'))).toBe(false)
    expect(isTodoOverdue(todo, new Date('2026-06-23T00:00:00'))).toBe(true)
  })

  it('완료된 투두는 기한이 지나도 이월 대상이 아님', () => {
    expect(
      isTodoOverdue({ ...todo, completed: true }, new Date('2026-06-23T00:00:00'))
    ).toBe(false)
  })
})
