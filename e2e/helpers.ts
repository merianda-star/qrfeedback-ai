import { Page, expect } from '@playwright/test'

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || 'playwright@qrfeedback.ai'
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD || 'PlaywrightTest123!'

export const FORM_ID = '21c11b65-0975-4b31-89a8-3063b61baffa'

export async function login(page: Page) {
  await page.goto('/auth/login')
  await page.getByRole('textbox', { name: 'your@email.com' }).fill(TEST_EMAIL)
  await page.getByRole('textbox', { name: 'Your password' }).fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
  await dismissOverlays(page)
}

export async function dismissOverlays(page: Page) {
  // Dismiss onboarding wizard if present
  const getStarted = page.getByRole('button', { name: 'Get Started →' })
  if (await getStarted.isVisible({ timeout: 2000 }).catch(() => false)) {
    await getStarted.click()
    const bizInput = page.getByRole('textbox', { name: "e.g. Alok's Cafe" })
    if (await bizInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bizInput.fill('Test Business')
    }
    const continueBtn = page.getByRole('button', { name: 'Continue →' })
    while (await continueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await continueBtn.click()
      await page.waitForTimeout(500)
    }
    const skipBtn = page.getByRole('button', { name: 'Skip for now →' })
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
    }
  }

  // Dismiss dashboard tour if present
  const startTour = page.getByRole('button', { name: 'Start Dashboard Tour →' })
  if (await startTour.isVisible({ timeout: 2000 }).catch(() => false)) {
    await startTour.click()
    const nextBtn = page.getByRole('button', { name: 'Next →' })
    while (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await nextBtn.click()
      await page.waitForTimeout(300)
    }
    const finishBtn = page.getByRole('button', { name: 'Finish ✓' })
    if (await finishBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await finishBtn.click()
    }
  }

  // Dismiss any remaining overlay
  const overlay = page.locator('.ob-overlay')
  if (await overlay.isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.keyboard.press('Escape')
    await overlay.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {})
  }

  await page.waitForTimeout(500)
}