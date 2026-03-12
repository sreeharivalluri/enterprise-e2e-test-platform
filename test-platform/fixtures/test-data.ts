/**
 * Test Fixtures - Reusable test data and utilities
 */

export const testUsers = {
  validUser: {
    email: 'user@test.com',
    password: 'password123'
  },
  invalidUser: {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  }
};

export const testOrders = [
  {
    product: 'Laptop',
    quantity: 1,
    price: 999.99
  },
  {
    product: 'Mouse',
    quantity: 2,
    price: 29.99
  },
  {
    product: 'Keyboard',
    quantity: 1,
    price: 79.99
  }
];

export const testEvents = {
  orderCreated: {
    orderId: 'order-123',
    userId: 'user-1',
    product: 'Test Product',
    quantity: 1,
    price: 99.99,
    status: 'pending'
  },
  orderUpdated: {
    orderId: 'order-123',
    status: 'shipped'
  },
  orderDeleted: {
    orderId: 'order-123'
  }
};

export const performanceThresholds = {
  loginResponseTime: 500,        // ms
  pageLoadTime: 1000,            // ms
  apiResponseTime: 500,          // ms
  errorRateThreshold: 0.1,       // 10%
  throughputMin: 100              // requests/second
};

export class TestDataGenerator {
  static generateOrderData(product?: string, quantity?: number, price?: number) {
    return {
      product: product || `Product-${Date.now()}`,
      quantity: quantity || Math.floor(Math.random() * 10) + 1,
      price: price || Math.random() * 500 + 10
    };
  }

  static generateUserId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
