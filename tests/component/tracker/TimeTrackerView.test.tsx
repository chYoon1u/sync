import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { TimeTrackerView } from '@/components/tracker/TimeTrackerView'
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore'

beforeEach(() => {
  useTimeTrackerStore.setState({ blocks: [], goals: [] })
})

describe('TimeTrackerView', () => {
  it('시간 셀을 두 번 선택하고 계획을 추가한다', async () => {
    const user = userEvent.setup()
    render(<TimeTrackerView compact />)

    const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/)
    const date = (dateInput as HTMLInputElement).value
    await user.click(screen.getByRole('button', { name: `${date} 09:00` }))
    await user.click(screen.getByRole('button', { name: `${date} 10:00` }))
    await user.type(screen.getByPlaceholderText('목표 또는 일정'), '보고서 작성')
    await user.click(screen.getByRole('button', { name: '추가' }))

    expect(useTimeTrackerStore.getState().blocks[0]).toMatchObject({
      title: '보고서 작성',
      startMinute: 540,
      endMinute: 610,
    })
  })

  it('큰 화면에서 Daily와 Weekly를 동시에 표시한다', () => {
    render(<TimeTrackerView />)

    expect(screen.getByText('Daily')).toBeInTheDocument()
    expect(screen.getByText('Weekly')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('오늘의 목표')).not.toBeInTheDocument()
  })

  it('Weekly 요일별 목표를 추가한다', async () => {
    const user = userEvent.setup()
    render(<TimeTrackerView />)

    const goalInputs = screen.getAllByPlaceholderText('목표')
    await user.type(goalInputs[0], '운동')
    const addButtons = screen.getAllByRole('button', { name: /목표 추가/ })
    await user.click(addButtons[0])

    expect(useTimeTrackerStore.getState().goals[0].title).toBe('운동')
  })
})
