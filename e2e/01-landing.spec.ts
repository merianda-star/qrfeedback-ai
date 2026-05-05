import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {

  test('loads correctly', async ({ page }) => {
    await page.goto('https://www.qrfeedback.ai/')
    await expect(page).toHaveURL('https://www.qrfeedback.ai/')
  })

  test('Buy Now Pro button is visible', async ({ page }) => {
    await page.goto('https://www.qrfeedback.ai/')
    await expect(page.getByRole('button', { name: 'Buy Now — $19/mo' })).toBeVisible()
  })

  test('Buy Now Business button is visible', async ({ page }) => {
    await page.goto('https://www.qrfeedback.ai/')
    await expect(page.getByRole('button', { name: 'Buy Now — $49/mo' })).toBeVisible()
  })

  test('Contact for Business trial button opens modal', async ({ page }) => {
    await page.goto('https://www.qrfeedback.ai/')
    await page.getByRole('button', { name: 'Contact for Business trial' }).click()
    await expect(page.getByRole('textbox', { name: 'Jane Smith' })).toBeVisible()
  })

  test('Business enquiry modal submits and closes', async ({ page }) => {
    await page.goto('https://www.qrfeedback.ai/')
    await page.getByRole('button', { name: 'Contact for Business trial' }).click()
    await page.getByRole('textbox', { name: 'Jane Smith' }).fill('Test User')
    await page.getByRole('textbox', { name: 'The Golden Fork' }).fill('Test Business')
    await page.getByRole('textbox', { name: 'jane@yourbusiness.com' }).fill('test@example.com')
    await page.getByRole('combobox').selectOption('services')
    await page.getByRole('textbox', { name: 'Tell us about your business' }).fill('Automated test')
    await page.getByRole('button', { name: 'Send Enquiry →' }).click()
    await page.getByRole('button', { name: 'Close' }).click()
  })

  test('Sign in link goes to login page', async ({ page }) => {
    await page.goto('https://www.qrfeedback.ai/')
    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/login/)
  })

  test('Buy Now Pro redirects to register or login', async ({ page }) => {
    await page.goto('https://www.qrfeedback.ai/')
    await page.getByRole('button', { name: 'Buy Now — $19/mo' }).click()
    await expect(page).toHaveURL(/register|login|stripe/)
  })

})