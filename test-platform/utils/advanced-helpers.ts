/**
 * Advanced Test Utilities
 * Includes async handlers, performance monitoring, and data validation
 */

import axios, { AxiosError } from 'axios';

export class AsyncHelper {
  /**
   * Wait for a condition to be true with timeout
   */
  static async waitFor(
    condition: () => Promise<boolean> | boolean,
    message: string = 'Condition not met',
    timeout: number = 30000,
    interval: number = 500
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await Promise.resolve(condition());
        if (result) {
          return;
        }
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`${message} (timeout: ${timeout}ms)`);
  }

  /**
   * Retry async operation with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000,
    backoffMultiplier: number = 2
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= backoffMultiplier;
        }
      }
    }

    throw lastError;
  }

  /**
   * Race multiple promises with timeout
   */
  static async raceWithTimeout<T>(
    promises: Promise<T>[],
    timeout: number = 30000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), timeout)
    );

    return Promise.race([...promises, timeoutPromise]);
  }

  /**
   * Parallel execution with concurrency limit
   */
  static async parallelWithLimit<T>(
    tasks: (() => Promise<T>)[],
    limit: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const task of tasks) {
      const promise = Promise.resolve().then(task).then(result => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }
}

export class PerformanceMonitor {
  /**
   * Measure execution time of a function
   */
  static async measureTime<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await fn();
    const duration = performance.now() - startTime;

    console.log(`⏱️  ${name} completed in ${duration.toFixed(2)}ms`);

    return { result, duration };
  }

  /**
   * Monitor memory usage
   */
  static getMemoryUsage(): {
    heapUsed: number;
    heapTotal: number;
    external: number;
  } {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024)
    };
  }

  /**
   * Get response time metrics
   */
  static getResponseTimeMetrics(responseTimes: number[]): {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const sorted = responseTimes.sort((a, b) => a - b);
    const len = sorted.length;

    const getPercentile = (p: number) => sorted[Math.ceil((len * p) / 100) - 1];

    return {
      min: sorted[0],
      max: sorted[len - 1],
      avg: sorted.reduce((a, b) => a + b) / len,
      p50: getPercentile(50),
      p95: getPercentile(95),
      p99: getPercentile(99)
    };
  }
}

export class DataValidator {
  /**
   * Validate response structure
   */
  static validateStructure(data: any, expectedKeys: string[]): void {
    const keys = Object.keys(data);
    const missing = expectedKeys.filter(key => !keys.includes(key));

    if (missing.length > 0) {
      throw new Error(`Missing required keys: ${missing.join(', ')}`);
    }
  }

  /**
   * Validate data types
   */
  static validateTypes(
    data: any,
    schema: Record<string, string>
  ): void {
    Object.entries(schema).forEach(([key, expectedType]) => {
      const actualType = typeof data[key];

      if (actualType !== expectedType) {
        throw new Error(
          `Type mismatch for key '${key}': expected ${expectedType}, got ${actualType}`
        );
      }
    });
  }

  /**
   * Validate array contains expected items
   */
  static validateArrayContains(array: any[], expectedItems: any[]): void {
    expectedItems.forEach(expected => {
      if (!array.some(item => JSON.stringify(item) === JSON.stringify(expected))) {
        throw new Error(`Array does not contain expected item: ${JSON.stringify(expected)}`);
      }
    });
  }

  /**
   * Deep clone object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Compare objects deeply
   */
  static deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}

export class ErrorHandler {
  /**
   * Handle API errors with specific logic
   */
  static async handleApiError(error: AxiosError, context?: string): Promise<void> {
    const message = context ? `${context}: ` : '';

    if (error.response) {
      console.error(
        `${message}API Error - Status: ${error.response.status}, ` +
        `Data: ${JSON.stringify(error.response.data)}`
      );
    } else if (error.request) {
      console.error(`${message}Network Error - No response received`);
    } else {
      console.error(`${message}Error: ${error.message}`);
    }

    throw error;
  }

  /**
   * Extract error message from response
   */
  static extractErrorMessage(error: AxiosError): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    return error.message || 'Unknown error';
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: AxiosError): boolean {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.response?.status || 0);
  }
}

export class TestDataBuilder {
  private data: any = {};

  /**
   * Add or update data
   */
  with(key: string, value: any): TestDataBuilder {
    this.data[key] = value;
    return this;
  }

  /**
   * Add multiple data points
   */
  withMultiple(updates: Record<string, any>): TestDataBuilder {
    this.data = { ...this.data, ...updates };
    return this;
  }

  /**
   * Build and return data
   */
  build(): any {
    return DataValidator.deepClone(this.data);
  }
}
