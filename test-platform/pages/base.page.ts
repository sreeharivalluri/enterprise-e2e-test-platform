import { Page } from '@playwright/test';
import { config } from '../config/config';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = ''): Promise<void> {
    await this.page.goto(config.UI_URL + path);
  }

  async fillInput(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  async click(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  async getText(selector: string): Promise<string> {
    return await this.page.textContent(selector) || '';
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  async waitForSelector(selector: string): Promise<void> {
    await this.page.waitForSelector(selector);
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
