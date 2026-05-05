import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Settings', () => {

  test('settings page loads', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/settings')
    await expect(page).toHaveURL(/settings/)
  })

  test('Review Centre section is visible', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/settings')
    await expect(page.locator('text=Review Centre Status')).toBeVisible()
    await expect(page.locator('text=Smart Routing')).toBeVisible()
    await expect(page.locator('text=AI Email Alerts')).toBeVisible()
    await expect(page.locator('text=Weekly AI Digest')).toBeVisible()
  })

  test('Notifications section is visible', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/settings')
    await expect(page.locator('text=Notify on Negative Reviews')).toBeVisible()
    await expect(page.locator('text=Notify on Positive')).toBeVisible()
  })

  test('toggling Review Centre Status and back', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/settings')
    await page.locator('.vic-toggle-track').first().click()
    await page.locator('.vic-toggle-track').first().click()
  })

  test('toggling Smart Routing and back', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/settings')
    await page.locator('div:nth-child(3) > .vic-toggle > .vic-toggle-track').click()
    await page.locator('div:nth-child(3) > .vic-toggle > .vic-toggle-track').click()
  })

  test('Save Changes shows saved confirmation', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/settings')
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(
      page.locator('text=✓ Saved').or(page.locator('text=Saved'))
    ).toBeVisible({ timeout: 5000 })
  })

  test('2FA section is visible', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/settings')
    // Use exact class selector to avoid strict mode violation from duplicate text
    await expect(page.locator('.s-card-title', { hasText: '🔐 Two-Step Verification' })).toBeVisible()
    await expect(page.locator('text=Email Verification Code')).toBeVisible()
  })

})