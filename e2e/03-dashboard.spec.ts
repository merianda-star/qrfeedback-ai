import { test, expect } from '@playwright/test'
import { login, dismissOverlays } from './helpers'

test.describe('Dashboard', () => {

  test('overview page loads with stat cards', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await expect(page.getByText('Total Responses', { exact: true })).toBeVisible()
    await expect(page.getByText('Average Rating', { exact: true })).toBeVisible()
    await expect(page.getByText('Google Redirects', { exact: true })).toBeVisible()
    await expect(page.getByText('Captured Privately', { exact: true })).toBeVisible()
  })

  test('sidebar shows Overview link', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('link', { name: '⊞ Overview' })).toBeVisible()
  })

  test('sidebar shows Responses link', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('link', { name: '◈ Responses' })).toBeVisible()
  })

  test('sidebar shows Analytics link', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('link', { name: '◉ Analytics' })).toBeVisible()
  })

  test('sidebar shows QR Codes link', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('link', { name: '⬛ QR Codes' })).toBeVisible()
  })

  test('sidebar shows My Forms link', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('link', { name: '▤ My Forms' })).toBeVisible()
  })

  test('sidebar shows Profile link', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('link', { name: '👤 Profile' })).toBeVisible()
  })

  test('sidebar shows Settings link', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('link', { name: '⚙ Settings' })).toBeVisible()
  })

  test('responses page loads', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/responses')
    await expect(page).toHaveURL(/responses/)
  })

  test('analytics page loads', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/analytics')
    await expect(page).toHaveURL(/analytics/)
  })

  test('analytics CSV export works', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/analytics')
    await dismissOverlays(page)
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '↓ Export CSV' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.csv')
  })

  test('weekly digest page loads', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/digest')
    await expect(page).toHaveURL(/digest/)
  })

  test('my forms page loads', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/forms')
    await expect(page).toHaveURL(/forms/)
  })

})