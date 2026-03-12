import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private emailInput = 'input[id="email"]';
  private passwordInput = 'input[id="password"]';
  private submitButton = 'button[type="submit"]';
  private errorMessage = '#message .error';
  private successMessage = '#message .success';

  async navigateToLogin(): Promise<void> {
    await this.goto('/');
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillInput(this.emailInput, email);
    await this.fillInput(this.passwordInput, password);
    await this.click(this.submitButton);
    
    // Wait for either success or error
    await Promise.race([
      this.page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {}),
      this.waitForSelector(this.errorMessage).catch(() => {})
    ]);
  }

  async getErrorMessage(): Promise<string> {
    try {
      return await this.getText(this.errorMessage);
    } catch {
      return '';
    }
  }

  async isLoginSuccessful(): Promise<boolean> {
    return await this.page.url().includes('dashboard');
  }
}
