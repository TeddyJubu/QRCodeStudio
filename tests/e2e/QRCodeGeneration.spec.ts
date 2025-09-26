import { test, expect, utils, testData } from './setup';

test.describe('QR Code Generation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await utils.navigateTo(page, '/');
  });

  test('should load QR Code Studio homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/QR Code Studio/);
    await expect(page.locator('h1')).toContainText('QR Code Studio');
  });

  test('should generate QR code for valid URL', async ({ page }) => {
    await utils.generateQRCode(page, testData.qrCodes.validUrl);
    await utils.expectQRCodeGenerated(page);
  });

  test('should generate QR code for text input', async ({ page }) => {
    await utils.generateQRCode(page, testData.qrCodes.validText);
    await utils.expectQRCodeGenerated(page);
  });

  test('should show error for empty input', async ({ page }) => {
    await page.fill('[data-testid="qr-data"]', testData.qrCodes.empty);
    await page.click('[data-testid="generate-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Please enter data');
  });

  test('should download QR code as PNG', async ({ page }) => {
    // Generate QR code first
    await utils.generateQRCode(page, testData.qrCodes.validUrl);

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    await page.click('[data-testid="download-button"]');

    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });

  test('should clear QR code when clear button is clicked', async ({ page }) => {
    // Generate QR code first
    await utils.generateQRCode(page, testData.qrCodes.validUrl);

    // Clear form
    await page.click('[data-testid="clear-button"]');

    await expect(page.locator('[data-testid="qr-data"]')).toHaveValue('');
    await expect(page.locator('[data-testid="qr-preview"]')).toBeHidden();
  });
});
