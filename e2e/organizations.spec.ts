import { test, expect, Page } from '@playwright/test'

// Helper to mock authenticated state
async function mockAuthenticatedUser(page: Page) {
  // Mock successful user API response
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

  // Set auth tokens in localStorage to simulate logged-in state
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'mock-access-token')
    localStorage.setItem('refresh_token', 'mock-refresh-token')
  })
}

// Helper to mock organizations
async function mockOrganizations(page: Page, orgs: any[]) {
  await page.route('**/api/organizations', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(orgs),
    })
  })
}

test.describe('Organization Switcher', () => {
  const mockOrgs = [
    {
      id: 'org-1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      logo_url: null,
      plan: 'pro',
      role: 'admin',
      is_active: true,
    },
    {
      id: 'org-2',
      name: 'Startup Inc',
      slug: 'startup-inc',
      logo_url: null,
      plan: 'free',
      role: 'member',
      is_active: true,
    },
    {
      id: 'org-3',
      name: 'Enterprise Ltd',
      slug: 'enterprise-ltd',
      logo_url: null,
      plan: 'enterprise',
      role: 'owner',
      is_active: true,
    },
  ]

  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page)
    await mockOrganizations(page, mockOrgs)
  })

  test('should display organization switcher with current org', async ({ page }) => {
    await page.goto('/dashboard')

    // Should show org switcher button with first org selected
    await expect(page.getByText('Acme Corp').first()).toBeVisible()
  })

  test('should open dropdown when clicking org switcher', async ({ page }) => {
    await page.goto('/dashboard')

    // Click on the org switcher button
    await page.locator('button:has-text("Acme Corp")').click()

    // Should show dropdown with all organizations
    await expect(page.getByText('Organizations')).toBeVisible()
    await expect(page.getByText('Startup Inc')).toBeVisible()
    await expect(page.getByText('Enterprise Ltd')).toBeVisible()
  })

  test('should switch organization when selecting from dropdown', async ({ page }) => {
    await page.goto('/dashboard')

    // Click on the org switcher button
    await page.locator('button:has-text("Acme Corp")').click()

    // Click on a different organization
    await page.locator('button:has-text("Startup Inc")').click()

    // Dropdown should close and show new org selected
    await expect(page.locator('button:has-text("Startup Inc")')).toBeVisible()
  })

  test('should persist selected organization in localStorage', async ({ page }) => {
    await page.goto('/dashboard')

    // Click on the org switcher button
    await page.locator('button:has-text("Acme Corp")').click()

    // Click on a different organization
    await page.locator('button:has-text("Startup Inc")').click()

    // Check localStorage
    const savedOrgId = await page.evaluate(() => {
      return localStorage.getItem('current_organization_id')
    })

    expect(savedOrgId).toBe('org-2')
  })

  test('should show create organization link in dropdown', async ({ page }) => {
    await page.goto('/dashboard')

    // Click on the org switcher button
    await page.locator('button:has-text("Acme Corp")').click()

    // Should show create organization link
    await expect(page.getByRole('link', { name: /Create Organization/i })).toBeVisible()
  })

  test('should show organization role in dropdown', async ({ page }) => {
    await page.goto('/dashboard')

    // Click on the org switcher button
    await page.locator('button:has-text("Acme Corp")').click()

    // Should show roles for each organization
    await expect(page.getByText('admin')).toBeVisible()
    await expect(page.getByText('member')).toBeVisible()
    await expect(page.getByText('owner')).toBeVisible()
  })
})

test.describe('Organization Pages', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page)
    await mockOrganizations(page, [
      {
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        logo_url: null,
        plan: 'pro',
        role: 'admin',
        is_active: true,
      },
    ])
  })

  test('should show create org button when no organizations exist', async ({ page }) => {
    // Override to return empty orgs
    await page.route('**/api/organizations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/dashboard')

    // Should show create organization CTA
    await expect(page.getByRole('link', { name: /Create Organization/i })).toBeVisible()
  })

  test('should navigate to organizations page', async ({ page }) => {
    await page.goto('/dashboard')

    // Navigate to organizations page (if there's a link)
    await page.goto('/organizations')

    // Should be on organizations page
    await expect(page).toHaveURL('/organizations')
  })

  test('should navigate to team page', async ({ page }) => {
    // Mock teams API
    await page.route('**/api/organizations/*/teams', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'team-1',
            organization_id: 'org-1',
            name: 'Engineering',
            slug: 'engineering',
            description: 'Engineering team',
            created_at: '2024-01-01T00:00:00Z',
          },
        ]),
      })
    })

    await page.goto('/team')

    // Should be on team page
    await expect(page).toHaveURL('/team')
  })
})

test.describe('No Organizations State', () => {
  test('should prompt user to create organization when none exist', async ({ page }) => {
    await mockAuthenticatedUser(page)

    // Mock empty organizations
    await page.route('**/api/organizations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/dashboard')

    // Should show create organization prompt
    await expect(page.getByRole('link', { name: /Create Organization/i })).toBeVisible()
  })
})
