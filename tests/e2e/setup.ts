import { test as base, expect } from '@playwright/test';
import { chromium, type Browser, type Page } from '@playwright/test';

// Extend base test with fixtures
export const test = base.extend<{
  page: Page;
  browser: Browser;
}>({
  page: async ({ browser }, use) => {
    const page = await browser.newPage();
    await use(page);
    await page.close();
  },
  browser: async ({}, use) => {
    const browser = await chromium.launch();
    await use(browser);
    await browser.close();
  },
});

// Re-export expect for test files
export { expect };

// Common E2E test utilities
export const utils = {
  // Navigation helpers
  navigateTo: async (page: Page, path: string) => {
    await page.goto(`http://localhost:3001${path}`);
    await page.waitForLoadState('networkidle');
  },

  // Form helpers
  fillForm: async (page: Page, formData: Record<string, string>) => {
    for (const [field, value] of Object.entries(formData)) {
      await page.fill(`[data-testid="${field}"]`, value);
    }
  },

  clickButton: async (page: Page, buttonText: string) => {
    await page.click(`button:has-text("${buttonText}")`);
  },

  // Assertion helpers
  expectToast: async (page: Page, message: string) => {
    await expect(page.locator('[role="alert"]')).toContainText(message);
  },

  expectElementVisible: async (page: Page, selector: string) => {
    await expect(page.locator(selector)).toBeVisible();
  },

  expectElementHidden: async (page: Page, selector: string) => {
    await expect(page.locator(selector)).toBeHidden();
  },

  // QR Code specific helpers
  generateQRCode: async (page: Page, data: string) => {
    await utils.navigateTo(page, '/');
    await page.fill('[data-testid="qr-data"]', data);
    await utils.clickButton(page, 'Generate');
    await page.waitForSelector('[data-testid="qr-preview"]');
  },

  expectQRCodeGenerated: async (page: Page) => {
    await expect(page.locator('[data-testid="qr-preview"] canvas')).toBeVisible();
  },

  // Theme helpers
  toggleTheme: async (page: Page) => {
    await page.click('[data-testid="theme-toggle"]');
  },

  expectDarkTheme: async (page: Page) => {
    await expect(page.locator('html')).toHaveClass(/dark/);
  },

  expectLightTheme: async (page: Page) => {
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  },
};

// Export common test data
export const testData = {
  qrCodes: {
    validUrl: 'https://example.com',
    validText: 'Hello, World!',
    validEmail: 'test@example.com',
    validPhone: '+1234567890',
    invalidUrl: 'not-a-url',
    empty: '',
  },
  forms: {
    login: {
      username: 'testuser',
      password: 'password123',
    },
    register: {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    },
  },
  templates: {
    url: {
      name: 'URL Template',
      description: 'Quick URL QR code',
      category: 'url',
    },
    wifi: {
      name: 'WiFi Template',
      description: 'WiFi sharing',
      category: 'wifi',
    },
  },
};
