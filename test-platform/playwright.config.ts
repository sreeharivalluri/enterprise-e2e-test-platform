import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

export const baseConfig = {
  baseURL: process.env.UI_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0
};

test.beforeEach(async ({ page }) => {
  // Clear local storage and cookies before each test
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
});

export default baseConfig;
