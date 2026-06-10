import { test, expect } from '@playwright/test'

test.describe('앱 기본 동작', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('앱 로드 확인', async ({ page }) => {
    await expect(page).toHaveTitle(/Sync|Vite/)
  })
})
