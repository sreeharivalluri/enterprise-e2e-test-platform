import { Logger } from './logger';
import { config } from '../config/config';

export class RetryHelper {
  static async retry<T>(
    fn: () => Promise<T>,
    retries: number = config.RETRY_COUNT,
    delay: number = config.RETRY_DELAY,
    context: string = 'Operation'
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        Logger.debug(`${context} - Attempt ${attempt}/${retries}`);
        return await fn();
      } catch (error: any) {
        lastError = error;
        Logger.warn(`${context} - Attempt ${attempt} failed: ${error.message}`);

        if (attempt < retries) {
          await this.sleep(delay);
        }
      }
    }

    Logger.error(`${context} - All ${retries} attempts failed`, lastError);
    throw lastError;
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class DataHelper {
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static generateRandomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  static generateRandomNumber(min: number = 1, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class AssertHelper {
  static assertEquals<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, but got ${actual}`);
    }
  }

  static assertNotNull<T>(value: T | null | undefined, message?: string): void {
    if (value === null || value === undefined) {
      throw new Error(message || 'Expected value to not be null or undefined');
    }
  }

  static assertTrue(condition: boolean, message?: string): void {
    if (!condition) {
      throw new Error(message || 'Expected condition to be true');
    }
  }

  static assertFalse(condition: boolean, message?: string): void {
    if (condition) {
      throw new Error(message || 'Expected condition to be false');
    }
  }

  static assertContains(text: string, substring: string, message?: string): void {
    if (!text.includes(substring)) {
      throw new Error(message || `Expected "${text}" to contain "${substring}"`);
    }
  }
}
