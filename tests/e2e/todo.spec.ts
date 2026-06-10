import { test, expect } from '@playwright/test'

// TODO: 컴포넌트 구현 후 selector 업데이트 필요

test.describe('투두리스트 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test.fixme('투두 추가 → 목록에 표시', async ({ page }) => {
    await page.getByPlaceholder('할 일을 입력하세요').fill('E2E 테스트 할 일')
    await page.getByRole('button', { name: '추가' }).click()
    await expect(page.getByText('E2E 테스트 할 일')).toBeVisible()
  })

  test.fixme('투두 완료 체크 → 스타일 변경', async ({ page }) => {
    await page.getByPlaceholder('할 일을 입력하세요').fill('완료 테스트')
    await page.getByRole('button', { name: '추가' }).click()
    await page.getByRole('checkbox').first().check()
    await expect(page.getByRole('checkbox').first()).toBeChecked()
  })

  test.fixme('투두 삭제 → 목록에서 제거', async ({ page }) => {
    await page.getByPlaceholder('할 일을 입력하세요').fill('삭제 테스트')
    await page.getByRole('button', { name: '추가' }).click()
    await page.getByRole('button', { name: '삭제' }).first().click()
    await expect(page.getByText('삭제 테스트')).not.toBeVisible()
  })

  test.fixme('새로고침 후 데이터 유지 (localStorage persist)', async ({ page }) => {
    await page.getByPlaceholder('할 일을 입력하세요').fill('영속성 테스트')
    await page.getByRole('button', { name: '추가' }).click()
    await page.reload()
    await expect(page.getByText('영속성 테스트')).toBeVisible()
  })
})
