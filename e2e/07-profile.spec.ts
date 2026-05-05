import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Profile & Billing', () => {

  test('profile page loads', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/profile')
    await expect(page).toHaveURL(/profile/)
  })

  test('business name field is visible and editable', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/profile')
    const nameInput = page.getByRole('textbox', { name: 'e.g. The Golden Fork' })
    await expect(nameInput).toBeVisible()
    await nameInput.click()
  })

  test('location field is visible', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/profile')
    await expect(page.getByRole('textbox', { name: 'e.g. 123 MG Road, Mysuru' })).toBeVisible()
  })

  test('Google review URL field is visible', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/profile')
    await expect(page.getByRole('textbox', { name: 'https://g.page/r/yourbusiness' })).toBeVisible()
  })

  test('save business profile works', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/profile')
    await page.getByRole('button', { name: 'Save Business Profile' }).click()
    await expect(
      page.locator('text=Saved').or(page.locator('text=✓'))
    ).toBeVisible({ timeout: 5000 })
  })

  test('account section is visible', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/profile')
    await expect(page.getByRole('textbox', { name: 'Your name' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Current password' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'New password' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Confirm password' })).toBeVisible()
  })

  test('avatar change button is visible', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/profile')
    await expect(page.getByRole('button', { name: '↑ Change Photo' })).toBeVisible()
  })

  test('plan and billing section is visible', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/profile')
    await expect(page.getByRole('button', { name: '🔗 Manage Billing & Invoices' })).toBeVisible()
  })

})