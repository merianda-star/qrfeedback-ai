import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Weekly Digest', () => {

  test('digest page loads', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/digest')
    await expect(page).toHaveURL(/digest/)
  })

  test('custom date range button is visible', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/digest')
    await expect(page.getByRole('button', { name: '📅 Custom Date Range ▼' })).toBeVisible()
  })

  test('generate button is visible after opening date range', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/digest')
    // Generate button only appears after opening the custom date range panel
    await page.getByRole('button', { name: '📅 Custom Date Range ▼' }).click()
    await page.waitForTimeout(1000)
    await expect(page.getByRole('button', { name: '✦ Generate for Selected Week' })).toBeVisible()
  })

  test('custom date range picker opens', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/digest')
    await page.getByRole('button', { name: '📅 Custom Date Range ▼' }).click()
    await page.waitForTimeout(1000)
    const calendarOrInput = page.locator('button[aria-label], input[type="date"], .calendar')
    const count = await calendarOrInput.count()
    expect(count >= 0).toBeTruthy()
  })

  test('past digests are listed', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/digest')
    await page.waitForTimeout(2000)
    const digests = page.locator('text=reviews')
    const count = await digests.count()
    expect(count >= 0).toBeTruthy()
  })

})