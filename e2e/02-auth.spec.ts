import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || 'playwright@qrfeedback.ai'
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD || 'PlaywrightTest123!'

test.describe('Authentication', () => {

  test('login page loads correctly', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('textbox', { name: 'your@email.com' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Your password' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('textbox', { name: 'your@email.com' }).fill(TEST_EMAIL)
    await page.getByRole('textbox', { name: 'Your password' }).fill('WrongPassword999!')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(
      page.locator('text=Invalid').or(page.locator('text=incorrect')).or(page.locator('text=wrong'))
    ).toBeVisible({ timeout: 8000 })
  })

  test('login with correct credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('textbox', { name: 'your@email.com' }).fill(TEST_EMAIL)
    await page.getByRole('textbox', { name: 'Your password' }).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()
    // Handle OTP if 2FA is enabled — skip if OTP prompt appears
    const otpInput = page.getByRole('textbox', { name: '000000' })
    const hasOtp = await otpInput.isVisible({ timeout: 3000 }).catch(() => false)
    if (hasOtp) {
      test.skip()
      return
    }
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
  })

  test('register page loads correctly', async ({ page }) => {
    await page.goto('/auth/register')
    await expect(page.getByRole('textbox', { name: 'Your full name' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'your@email.com' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'At least 6 characters' })).toBeVisible()
  })

  test('register with existing email redirects to verify page silently', async ({ page }) => {
    // Supabase intentionally does NOT show an error for existing emails
    // This is email enumeration protection — it silently redirects to verify-email
    // No duplicate account is created, the existing account is untouched
    await page.goto('/auth/register')
    await page.getByRole('textbox', { name: 'Your full name' }).fill('Test User')
    await page.getByRole('textbox', { name: 'your@email.com' }).fill(TEST_EMAIL)
    await page.getByRole('textbox', { name: 'At least 6 characters' }).fill('SomePassword123!')
    await page.getByRole('button', { name: 'Start Free Trial →' }).click()
    await expect(page).toHaveURL(/verify-email/, { timeout: 8000 })
  })

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/, { timeout: 8000 })
  })

})