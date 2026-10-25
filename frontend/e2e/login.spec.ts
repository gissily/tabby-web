import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('renders login view with correct muted text color', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('.no-providers')).toBeVisible()

    const mutedColor = await page.evaluate(() => {
      const el = document.querySelector('.no-providers .text-muted')
      return el ? getComputedStyle(el).color : null
    })
    expect(mutedColor).toBe('rgb(108, 117, 125)')

    const bodyText = await page.evaluate(() => document.body.innerText)
    expect(bodyText).toContain('No authentication providers configured')
  })
})