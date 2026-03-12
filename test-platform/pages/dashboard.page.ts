import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  private usernameLabel = '#username';
  private logoutButton = '.logout';
  private ordersButton = 'button:has-text("Manage Orders")';

  async navigateToDashboard(): Promise<void> {
    await this.goto('/dashboard');
  }

  async getWelcomeText(): Promise<string> {
    return await this.getText(this.usernameLabel);
  }

  async logout(): Promise<void> {
    await this.click(this.logoutButton);
    await this.page.waitForURL('**/');
  }

  async goToOrders(): Promise<void> {
    await this.click(this.ordersButton);
    await this.page.waitForURL('**/orders');
  }

  async isDashboardDisplayed(): Promise<boolean> {
    return await this.isVisible(this.usernameLabel);
  }
}
