import { test, expect } from '@playwright/test'
import { FORM_ID } from './helpers'

const FEEDBACK_URL = `https://www.qrfeedback.ai/feedback/${FORM_ID}`

test.describe('Feedback Form', () => {

  test('feedback form loads correctly', async ({ page }) => {
    await page.goto(FEEDBACK_URL)
    await expect(page.locator('text=How would you rate your overall experience?')).toBeVisible()
  })

  test('5 star rating shows Amazing label', async ({ page }) => {
    await page.goto(FEEDBACK_URL)
    await page.getByRole('button', { name: '★' }).nth(4).click()
    await expect(page.locator('text=Amazing')).toBeVisible()
  })

  test('4 star rating shows Great label', async ({ page }) => {
    await page.goto(FEEDBACK_URL)
    await page.getByRole('button', { name: '★' }).nth(3).click()
    await expect(page.locator('text=Great')).toBeVisible()
  })

  test('2 star rating shows Poor label', async ({ page }) => {
    await page.goto(FEEDBACK_URL)
    await page.getByRole('button', { name: '★' }).nth(1).click()
    await expect(page.locator('text=Poor')).toBeVisible()
  })

  test('positive rating shows Start Survey button', async ({ page }) => {
    await page.goto(FEEDBACK_URL)
    await page.getByRole('button', { name: '★' }).nth(4).click()
    await expect(page.getByRole('button', { name: 'Start Survey →' })).toBeVisible()
  })

  test('negative rating shows Continue to Survey button', async ({ page }) => {
    await page.goto(FEEDBACK_URL)
    await page.getByRole('button', { name: '★' }).nth(1).click()
    await expect(page.getByRole('button', { name: 'Continue to Survey →' })).toBeVisible()
  })

  test('positive survey flow completes successfully', async ({ page }) => {
    await page.goto(FEEDBACK_URL)
    await page.getByRole('button', { name: '★' }).nth(4).click()
    await page.getByRole('button', { name: 'Start Survey →' }).click()

    // Answer all star rating questions
    const starQuestions = page.locator('.q-stars')
    const count = await starQuestions.count()
    for (let i = 0; i < count; i++) {
      await starQuestions.nth(i).locator('span').nth(4).click()
    }

    await page.getByRole('button', { name: 'Submit Survey →' }).click()

    // Smart routing may be ON or OFF — either consent screen or thank you is correct
    await expect(
      page.locator('text=Would you like to').or(page.locator('text=Thank you'))
    ).toBeVisible({ timeout: 8000 })
  })

  test('negative survey flow shows email capture screen', async ({ page }) => {
    await page.goto(FEEDBACK_URL)
    await page.getByRole('button', { name: '★' }).nth(1).click() // 2 stars
    await page.getByRole('button', { name: 'Continue to Survey →' }).click()

    // Answer first star question
    await page.getByText('★').nth(1).click()
    // Answer second star question
    await page.locator('div:nth-child(2) > .q-stars > span:nth-child(2)').click()
    // Select issue option
    await page.getByText('✓Food quality').nth(1).click()

    await page.getByRole('button', { name: 'Submit Survey →' }).click()
    await expect(page.locator('text=Would you like us')).toBeVisible({ timeout: 8000 })
  })

  test('email capture skip button works', async ({ page }) => {
    await page.goto(FEEDBACK_URL)
    await page.getByRole('button', { name: '★' }).nth(1).click() // 2 stars
    await page.getByRole('button', { name: 'Continue to Survey →' }).click()

    // Answer first star question
    await page.getByText('★').nth(1).click()
    // Answer second star question
    await page.locator('div:nth-child(2) > .q-stars > span:nth-child(2)').click()
    // Select issue option
    await page.getByText('✓Food quality').nth(1).click()

    await page.getByRole('button', { name: 'Submit Survey →' }).click()
    await expect(page.locator('text=Would you like us')).toBeVisible({ timeout: 8000 })
    await page.getByRole('button', { name: 'No thanks, skip this step' }).click()
    await expect(page.locator('text=Thank you for your')).toBeVisible({ timeout: 8000 })
  })

  test('invalid form ID shows not found screen', async ({ page }) => {
    await page.goto('https://www.qrfeedback.ai/feedback/invalid-id-000')
    await expect(page.locator('text=Form not found')).toBeVisible({ timeout: 8000 })
  })

})