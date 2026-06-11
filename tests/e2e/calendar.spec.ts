import { test, expect } from '@playwright/test'

test.describe('캘린더 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test.fixme('현재 월 캘린더 표시', async ({ page }) => {
    const now = new Date()
    const monthLabel = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
    await expect(page.getByText(monthLabel)).toBeVisible()
  })

  test.fixme('날짜 클릭 → 이벤트 추가 모달 오픈', async ({ page }) => {
    await page.getByTestId('calendar-day-2026-06-15').click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test.fixme('이벤트 추가 → 캘린더에 표시', async ({ page }) => {
    await page.getByTestId('calendar-day-2026-06-15').click()
    await page.getByPlaceholder('이벤트 제목').fill('팀 미팅')
    await page.getByRole('button', { name: '저장' }).click()
    await expect(page.getByText('팀 미팅')).toBeVisible()
  })
})
