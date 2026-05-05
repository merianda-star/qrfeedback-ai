import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Security & Edge Cases', () => {

  test('admin panel requires admin login when unauthenticated', async ({ page }) => {
    // Clear all cookies to simulate unauthenticated visit
    await page.context().clearCookies()
    await page.goto('/qrf-admin')
    // Should redirect to admin login page, not the main admin panel
    await expect(page).toHaveURL(/admin-login|login/, { timeout: 8000 })
  })

  test('invalid feedback form ID shows not found', async ({ page }) => {
    await page.goto('https://www.qrfeedback.ai/feedback/invalid-id-999')
    await expect(page.locator('text=Form not found')).toBeVisible({ timeout: 8000 })
  })

  test('site is served over HTTPS', async ({ page }) => {
    await page.goto('https://www.qrfeedback.ai/')
    expect(page.url()).toMatch(/^https:\/\//)
  })

  test('unauthenticated dashboard access redirects to login', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/, { timeout: 8000 })
  })

  test('mobile viewport - landing page renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('https://www.qrfeedback.ai/')
    // Use exact nav logo link to avoid strict mode violation
    await expect(page.getByRole('link', { name: 'QRFeedback.ai' }).first()).toBeVisible()
  })

  test('mobile viewport - feedback form renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`https://www.qrfeedback.ai/feedback/21c11b65-0975-4b31-89a8-3063b61baffa`)
    await expect(page.locator('text=How would you rate')).toBeVisible()
  })

  test('mobile viewport - dashboard renders correctly', async ({ page }) => {
    await login(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/dashboard/)
  })

  test('security headers are present on live site', async ({ page }) => {
    const response = await page.goto('https://www.qrfeedback.ai/')
    const headers = response?.headers() || {}
    expect(
      headers['x-frame-options'] ||
      headers['strict-transport-security'] ||
      headers['x-content-type-options']
    ).toBeTruthy()
  })

})