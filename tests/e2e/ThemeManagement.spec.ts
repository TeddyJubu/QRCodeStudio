import { test, expect, utils } from './setup';

test.describe('Theme Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await utils.navigateTo(page, '/');
  });

  test('should display theme toggle button', async ({ page }) => {
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeEnabled();
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    // Check initial theme (should be light)
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Toggle to dark theme
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500); // Wait for theme transition

    // Check dark theme is applied
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Toggle back to light theme
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);

    // Check light theme is applied
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should persist theme preference in local storage', async ({ page }) => {
    // Toggle to dark theme
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);

    // Check local storage
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if dark theme is maintained
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should open user preferences dialog', async ({ page }) => {
    await page.click('[data-testid="user-preferences-button"]');

    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="preferences-title"]')).toContainText(
      'User Preferences'
    );
  });

  test('should change theme from preferences dialog', async ({ page }) => {
    // Open preferences
    await page.click('[data-testid="user-preferences-button"]');
    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeVisible();

    // Change theme to dark
    await page.selectOption('[data-testid="theme-select"]', 'dark');
    await page.waitForTimeout(500);

    // Check dark theme is applied
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    await page.waitForTimeout(500);

    // Check dialog is closed
    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeHidden();
  });

  test('should save theme preference to server', async ({ page }) => {
    // Mock API call
    await page.route('**/api/preferences', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Open preferences
    await page.click('[data-testid="user-preferences-button"]');
    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeVisible();

    // Change theme
    await page.selectOption('[data-testid="theme-select"]', 'dark');
    await page.waitForTimeout(500);

    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    await page.waitForTimeout(500);

    // Check if API call was made
    const requests = await page.request.all();
    const preferenceRequest = requests.find(req => req.url().includes('/api/preferences'));
    expect(preferenceRequest).toBeTruthy();
  });

  test('should load theme preference from server', async ({ page }) => {
    // Mock API response with dark theme
    await page.route('**/api/preferences', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          theme: 'dark',
          autoSave: true,
          defaultDownloadFormat: 'png',
        }),
      });
    });

    // Reload page to trigger preferences load
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if dark theme is applied
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should handle theme preference sync between local and server', async ({ page }) => {
    // Mock API response
    await page.route('**/api/preferences', async route => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            theme: 'light',
            autoSave: true,
            defaultDownloadFormat: 'png',
          }),
        });
      } else if (request.method() === 'POST') {
        const postData = JSON.parse(request.postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, ...postData }),
        });
      }
    });

    // Change theme locally
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);

    // Open preferences and save
    await page.click('[data-testid="user-preferences-button"]');
    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeVisible();

    await page.click('[data-testid="save-preferences-button"]');
    await page.waitForTimeout(500);

    // Check if theme is still dark
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should show loading state when fetching preferences', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/preferences', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          theme: 'light',
          autoSave: true,
          defaultDownloadFormat: 'png',
        }),
      });
    });

    // Open preferences
    await page.click('[data-testid="user-preferences-button"]');

    // Check loading state
    await expect(page.locator('[data-testid="preferences-loading"]')).toBeVisible();

    // Wait for loading to complete
    await page.waitForSelector('[data-testid="theme-select"]', { state: 'visible' });
    await expect(page.locator('[data-testid="preferences-loading"]')).toBeHidden();
  });

  test('should handle API errors when saving preferences', async ({ page }) => {
    // Mock API error
    await page.route('**/api/preferences', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    // Open preferences
    await page.click('[data-testid="user-preferences-button"]');
    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeVisible();

    // Try to save preferences
    await page.click('[data-testid="save-preferences-button"]');
    await page.waitForTimeout(500);

    // Check error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Failed to save preferences'
    );
  });

  test('should close preferences dialog when cancel is clicked', async ({ page }) => {
    // Open preferences
    await page.click('[data-testid="user-preferences-button"]');
    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeVisible();

    // Cancel without saving
    await page.click('[data-testid="cancel-preferences-button"]');

    // Check dialog is closed
    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeHidden();
  });

  test('should maintain theme across page navigation', async ({ page }) => {
    // Switch to dark theme
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);

    // Navigate to different page (if available)
    await page.click('[data-testid="history-tab"]');
    await page.waitForTimeout(500);

    // Check theme is maintained
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Navigate back to main page
    await page.click('[data-testid="generator-tab"]');
    await page.waitForTimeout(500);

    // Check theme is still dark
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
