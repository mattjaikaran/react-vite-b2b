import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login form with required fields', async ({ page }) => {
    await page.goto('/login')

    // Check form elements
    await expect(page.getByLabel(/Email address/i)).toBeVisible()
    await expect(page.getByLabel(/Password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible()
  })

  test('should require email and password fields', async ({ page }) => {
    await page.goto('/login')

    // Try to submit empty form
    await page.getByRole('button', { name: /Sign in/i }).click()

    // Form should not submit (HTML5 validation)
    await expect(page).toHaveURL('/login')
  })

  test('should show loading state when submitting', async ({ page }) => {
    // Mock the API to delay response
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid credentials' }),
      })
    })

    await page.goto('/login')

    // Fill in credentials
    await page.getByLabel(/Email address/i).fill('test@example.com')
    await page.getByLabel(/Password/i).fill('password123')

    // Click submit
    await page.getByRole('button', { name: /Sign in/i }).click()

    // Should show loading state
    await expect(page.getByRole('button', { name: /Signing in/i })).toBeVisible()
  })

  test('should show error message on failed login', async ({ page }) => {
    // Mock failed login API response
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid email or password' }),
      })
    })

    await page.goto('/login')

    // Fill in credentials
    await page.getByLabel(/Email address/i).fill('wrong@example.com')
    await page.getByLabel(/Password/i).fill('wrongpassword')

    // Submit form
    await page.getByRole('button', { name: /Sign in/i }).click()

    // Should show error message
    await expect(page.getByText(/Invalid|error|failed/i)).toBeVisible()
  })

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Mock successful login API response
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        }),
      })
    })

    // Mock user API response
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          avatar_url: null,
          bio: '',
          is_active: true,
          date_joined: '2024-01-01T00:00:00Z',
        }),
      })
    })

    // Mock organizations API response (B2B specific)
    await page.route('**/api/organizations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'org-1',
            name: 'Test Organization',
            slug: 'test-org',
            logo_url: null,
            plan: 'free',
            role: 'admin',
            is_active: true,
          },
        ]),
      })
    })

    await page.goto('/login')

    // Fill in credentials
    await page.getByLabel(/Email address/i).fill('test@example.com')
    await page.getByLabel(/Password/i).fill('password123')

    // Submit form
    await page.getByRole('button', { name: /Sign in/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })
})
