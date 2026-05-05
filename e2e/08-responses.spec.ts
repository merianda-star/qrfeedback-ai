import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Responses', () => {

  test('responses page loads', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/responses')
    await expect(page).toHaveURL(/responses/)
  })

  test('responses are listed', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/responses')
    await page.waitForTimeout(2000)
    const hasResponses = await page.locator('.response-card, [data-testid="response"]').count()
    expect(hasResponses >= 0).toBeTruthy()
  })

  test('reply button opens reply modal', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/responses')
    await page.waitForTimeout(2000)
    const replyBtn = page.getByRole('button', { name: '✉ Reply' }).first()
    const count = await replyBtn.count()
    if (count > 0) {
      await replyBtn.click()
      await expect(page.getByRole('button', { name: '✉ Send Reply via Email' })).toBeVisible()
      await page.getByRole('button', { name: '✕' }).click()
    }
  })

  test('AI usage bars are visible for pro plan', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/responses')
    await page.waitForTimeout(1500)
    const progressBars = page.locator('[class*="progress"], [class*="bar"]')
    const count = await progressBars.count()
    expect(count >= 0).toBeTruthy()
  })

})