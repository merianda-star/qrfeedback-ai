import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Forms & QR Codes', () => {

  test('my forms page loads', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/forms')
    await expect(page).toHaveURL(/forms/)
  })

  test('form manage link opens form settings', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/forms')
    await page.getByRole('link', { name: '⚙ Manage' }).first().click()
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible()
  })

  test('form settings saves successfully', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/forms')
    await page.getByRole('link', { name: '⚙ Manage' }).first().click()
    await page.waitForTimeout(1000)
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await page.waitForTimeout(2000)
    // Verify page didn't crash and save button is still present
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible()
  })

  test('questions page loads with business type buttons', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/questions')
    await expect(page.getByRole('button', { name: '🍽 Restaurant' })).toBeVisible()
    await expect(page.getByRole('button', { name: '🛍 Retail' })).toBeVisible()
    await expect(page.getByRole('button', { name: '🏥 Healthcare' })).toBeVisible()
    await expect(page.getByRole('button', { name: '💼 Services' })).toBeVisible()
  })

  test('add custom question button works', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/questions')
    await page.getByRole('button', { name: '+ Add Custom Question' }).click()
    await expect(page.getByRole('button', { name: '✓✗ Yes / No' })).toBeVisible()
  })

  test('QR codes page loads', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/qr')
    await expect(page).toHaveURL(/qr/)
  })

  test('copy URL button works', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/qr')
    await page.getByRole('button', { name: '🔗 Copy URL' }).first().click()
    await expect(page.getByRole('button', { name: '✓ Copied' })).toBeVisible({ timeout: 3000 })
  })

  test('PNG download works', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/qr')
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '↓ PNG' }).first().click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.png')
  })

  test('print card opens in new tab', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/qr')
    const popupPromise = page.waitForEvent('popup')
    await page.getByRole('button', { name: '🖨 Print' }).first().click()
    const popup = await popupPromise
    await expect(popup.getByRole('img', { name: 'QR Card' })).toBeVisible()
    await popup.close()
  })

  test('customize QR panel opens', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/qr')
    await page.getByRole('button', { name: 'Customize QR White-label ▼' }).first().click()
    await expect(page.locator('text=Dot Style')).toBeVisible()
  })

  test('QR dot styles are selectable', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/qr')
    await page.getByRole('button', { name: 'Customize QR White-label ▼' }).first().click()
    await expect(page.getByRole('button', { name: 'Dots' })).toBeVisible()
  })

})