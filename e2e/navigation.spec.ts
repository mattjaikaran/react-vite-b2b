import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    // Click sign in link
    await page.getByRole('link', { name: /Sign in/i }).click()

    // Should be on login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: /Sign in to your account/i })).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/')

    // Click get started link
    await page.getByRole('link', { name: /Get started/i }).click()

    // Should be on register page
    await expect(page).toHaveURL('/register')
  })

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/login')

    // Click create account link
    await page.getByRole('link', { name: /create a new account/i }).click()

    // Should be on register page
    await expect(page).toHaveURL('/register')
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without being logged in
    await page.goto('/dashboard')

    // Should be redirected to login
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: /Sign in to your account/i })).toBeVisible()
  })

  test('should redirect to login when accessing organizations page', async ({ page }) => {
    // Try to access organizations without being logged in
    await page.goto('/organizations')

    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })

  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/some-unknown-route')

    // Should show 404 page content
    await expect(page.getByText(/404|not found/i)).toBeVisible()
  })
})
