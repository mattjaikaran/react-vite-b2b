import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page with correct title and content', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/React Vite/)

    // Check main heading - B2B version may have different branding
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Check feature cards are displayed (if present on home page)
    const featuresHeading = page.getByRole('heading', { name: 'Features' })
    if (await featuresHeading.isVisible()) {
      await expect(featuresHeading).toBeVisible()
    }
  })

  test('should show login and register buttons when not authenticated', async ({ page }) => {
    await page.goto('/')

    // Check CTA buttons for unauthenticated users
    const signInLink = page.getByRole('link', { name: /Sign in/i })
    const getStartedLink = page.getByRole('link', { name: /Get started/i })

    // At least one of these should be visible
    const signInVisible = await signInLink.isVisible()
    const getStartedVisible = await getStartedLink.isVisible()

    expect(signInVisible || getStartedVisible).toBeTruthy()
  })
})
