import { test, expect, utils, testData } from './setup';

test.describe('Complete User Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await utils.navigateTo(page, '/');
  });

  test('should complete full QR code generation and customization workflow', async ({ page }) => {
    // Step 1: Generate initial QR code
    await page.fill('[data-testid="qr-data"]', testData.qrCodes.validUrl);
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="qr-preview"]');
    await expect(page.locator('[data-testid="qr-preview"]')).toBeVisible();

    // Step 2: Customize QR code size
    await page.fill('[data-testid="qr-size"]', '300');
    await page.click('[data-testid="generate-button"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="qr-preview"]')).toBeVisible();

    // Step 3: Change format
    await page.selectOption('[data-testid="qr-format"]', 'svg');
    await page.click('[data-testid="generate-button"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="qr-preview"]')).toBeVisible();

    // Step 4: Download QR code
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.svg$/);

    // Step 5: Save to history
    await page.click('[data-testid="save-to-history-button"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('QR code saved');

    // Step 6: Navigate to history
    await page.click('[data-testid="history-tab"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="history-page"]')).toBeVisible();

    // Step 7: Verify saved QR code in history
    await expect(page.locator('[data-testid="history-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]')).toContainText(
      testData.qrCodes.validUrl
    );

    // Step 8: Load saved QR code
    await page.click('[data-testid="load-history-item"]');
    await page.waitForTimeout(500);

    // Step 9: Verify loaded QR code
    await expect(page.locator('[data-testid="qr-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="qr-data"]')).toHaveValue(testData.qrCodes.validUrl);
    await expect(page.locator('[data-testid="qr-size"]')).toHaveValue('300');
    await expect(page.locator('[data-testid="qr-format"]')).toHaveValue('svg');
  });

  test('should complete theme customization and persistence workflow', async ({ page }) => {
    // Step 1: Check initial theme
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Step 2: Toggle to dark theme
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Step 3: Open preferences
    await page.click('[data-testid="user-preferences-button"]');
    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeVisible();

    // Step 4: Customize preferences
    await page.selectOption('[data-testid="theme-select"]', 'dark');
    await page.selectOption('[data-testid="default-format"]', 'png');
    await page.click('[data-testid="auto-save-toggle"]');
    await page.waitForTimeout(500);

    // Step 5: Save preferences
    await page.click('[data-testid="save-preferences-button"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeHidden();

    // Step 6: Generate QR code to test auto-save
    await page.fill('[data-testid="qr-data"]', testData.qrCodes.validText);
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="qr-preview"]');

    // Step 7: Check if auto-saved to history
    await page.click('[data-testid="history-tab"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="history-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]')).toContainText(
      testData.qrCodes.validText
    );

    // Step 8: Reload page to test persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Step 9: Verify theme persisted
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Step 10: Verify preferences persisted
    await page.click('[data-testid="user-preferences-button"]');
    await expect(page.locator('[data-testid="preferences-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="theme-select"]')).toHaveValue('dark');
    await expect(page.locator('[data-testid="default-format"]')).toHaveValue('png');
    await expect(page.locator('[data-testid="auto-save-toggle"]')).toBeChecked();
  });

  test('should complete template usage workflow', async ({ page }) => {
    // Step 1: Navigate to templates
    await page.click('[data-testid="templates-tab"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="templates-page"]')).toBeVisible();

    // Step 2: Select URL template
    await page.click('[data-testid="template-url"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="template-dialog"]')).toBeVisible();

    // Step 3: Fill template data
    await page.fill('[data-testid="template-url-input"]', 'https://mywebsite.com');
    await page.click('[data-testid="apply-template-button"]');
    await page.waitForTimeout(500);

    // Step 4: Verify template applied
    await expect(page.locator('[data-testid="qr-data"]')).toHaveValue('https://mywebsite.com');
    await expect(page.locator('[data-testid="qr-format"]')).toHaveValue('png');
    await expect(page.locator('[data-testid="qr-size"]')).toHaveValue('200');

    // Step 5: Generate QR code from template
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="qr-preview"]');
    await expect(page.locator('[data-testid="qr-preview"]')).toBeVisible();

    // Step 6: Customize template-generated QR code
    await page.fill('[data-testid="qr-size"]', '250');
    await page.selectOption('[data-testid="qr-format"]', 'jpg');
    await page.click('[data-testid="generate-button"]');
    await page.waitForTimeout(500);

    // Step 7: Download customized QR code
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.jpg$/);

    // Step 8: Save customized QR code
    await page.click('[data-testid="save-to-history-button"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should complete batch QR code generation workflow', async ({ page }) => {
    const testDataArray = [
      { data: 'https://site1.com', size: '200', format: 'png' },
      { data: 'https://site2.com', size: '300', format: 'svg' },
      { data: 'https://site3.com', size: '400', format: 'jpg' },
    ];

    for (let i = 0; i < testDataArray.length; i++) {
      const { data, size, format } = testDataArray[i];

      // Fill data
      await page.fill('[data-testid="qr-data"]', data);

      // Set size
      await page.fill('[data-testid="qr-size"]', size);

      // Set format
      await page.selectOption('[data-testid="qr-format"]', format);

      // Generate
      await page.click('[data-testid="generate-button"]');
      await page.waitForSelector('[data-testid="qr-preview"]');
      await expect(page.locator('[data-testid="qr-preview"]')).toBeVisible();

      // Download
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-button"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(new RegExp(`\\.${format}$`));

      // Save to history
      await page.click('[data-testid="save-to-history-button"]');
      await page.waitForTimeout(500);
      await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();

      // Clear for next iteration
      await page.click('[data-testid="clear-button"]');
      await page.waitForTimeout(500);
    }

    // Step 5: Verify all QR codes in history
    await page.click('[data-testid="history-tab"]');
    await page.waitForTimeout(500);

    const historyItems = await page.locator('[data-testid="history-item"]').count();
    expect(historyItems).toBe(testDataArray.length);

    // Verify each item
    for (let i = 0; i < testDataArray.length; i++) {
      const item = page.locator('[data-testid="history-item"]').nth(i);
      await expect(item).toContainText(testDataArray[i].data);
    }
  });

  test('should complete error handling and recovery workflow', async ({ page }) => {
    // Step 1: Try to generate QR code with empty data
    await page.fill('[data-testid="qr-data"]', '');
    await page.click('[data-testid="generate-button"]');

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Please enter data');

    // Step 2: Try with invalid URL
    await page.fill('[data-testid="qr-data"]', testData.qrCodes.invalidUrl);
    await page.click('[data-testid="generate-button"]');

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid URL');

    // Step 3: Recover with valid data
    await page.fill('[data-testid="qr-data"]', testData.qrCodes.validUrl);
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="qr-preview"]');
    await expect(page.locator('[data-testid="qr-preview"]')).toBeVisible();

    // Step 4: Try to download without generating
    await page.click('[data-testid="clear-button"]');
    await page.waitForTimeout(500);
    await page.click('[data-testid="download-button"]');

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Generate QR code first'
    );

    // Step 5: Recover and complete workflow
    await page.fill('[data-testid="qr-data"]', testData.qrCodes.validText);
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="qr-preview"]');

    // Download successfully
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.png$/);

    // Step 6: Test network error recovery
    await page.route('**/api/save', async route => {
      await route.abort('failed');
    });

    // Try to save to history
    await page.click('[data-testid="save-to-history-button"]');
    await page.waitForTimeout(500);

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to save');

    // Step 7: Recover and save successfully
    await page.unroute('**/api/save');
    await page.click('[data-testid="save-to-history-button"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should complete responsive design workflow across viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' },
    ];

    for (const viewport of viewports) {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Generate QR code
      await page.fill('[data-testid="qr-data"]', testData.qrCodes.validUrl);
      await page.click('[data-testid="generate-button"]');
      await page.waitForSelector('[data-testid="qr-preview"]');

      // Verify elements are visible and properly sized
      await expect(page.locator('[data-testid="qr-controls"]')).toBeVisible();
      await expect(page.locator('[data-testid="qr-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-preferences-button"]')).toBeVisible();

      // Test theme toggle
      await page.click('[data-testid="theme-toggle"]');
      await page.waitForTimeout(500);
      await expect(page.locator('html')).toHaveClass(/dark/);

      // Test preferences dialog
      await page.click('[data-testid="user-preferences-button"]');
      await expect(page.locator('[data-testid="preferences-dialog"]')).toBeVisible();
      await page.click('[data-testid="cancel-preferences-button"]');
      await page.waitForTimeout(500);

      // Test download
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-button"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.png$/);

      // Clear for next iteration
      await page.click('[data-testid="clear-button"]');
      await page.waitForTimeout(500);
    }
  });
});
