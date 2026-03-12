import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { Logger } from '../utils/logger';

test.beforeAll(() => {
  Logger.initialize();
});

test.describe('@ui Login Tests', () => {
  test('should successfully login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    
    await loginPage.login('user@test.com', 'password123');
    
    expect(await loginPage.isLoginSuccessful()).toBe(true);
  });

  test('should display dashboard after successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.navigateToLogin();
    await loginPage.login('user@test.com', 'password123');
    
    expect(await dashboardPage.isDashboardDisplayed()).toBe(true);
  });

  test('should logout successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.navigateToLogin();
    await loginPage.login('user@test.com', 'password123');
    
    await dashboardPage.logout();
    
    expect(page.url()).toBe('http://localhost:3000/');
  });

  test('should navigate to orders page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.navigateToLogin();
    await loginPage.login('user@test.com', 'password123');
    
    await dashboardPage.goToOrders();
    
    expect(page.url()).toContain('/orders');
  });
});
