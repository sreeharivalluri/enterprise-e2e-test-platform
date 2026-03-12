# Testing Patterns & Best Practices

Advanced testing patterns, architectural principles, and best practices for the Enterprise E2E Test Platform.

## 📋 Table of Contents

1. [Design Patterns](#design-patterns)
2. [Page Object Model](#page-object-model)
3. [API Testing Patterns](#api-testing-patterns)
4. [Event Testing Patterns](#event-testing-patterns)
5. [Security Testing Patterns](#security-testing-patterns)
6. [Test Data Management](#test-data-management)
7. [Error Handling & Assertions](#error-handling--assertions)
8. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## 🏗️ Design Patterns

### 1. Builder Pattern for Test Data

```typescript
// ✅ Good: Fluent test data creation
class OrderBuilder {
  private order: any = {
    product: 'Default Product',
    quantity: 1,
    price: 100
  };

  withProduct(product: string): OrderBuilder {
    this.order.product = product;
    return this;
  }

  withQuantity(quantity: number): OrderBuilder {
    this.order.quantity = quantity;
    return this;
  }

  build(): any {
    return this.order;
  }
}

// Usage
const order = new OrderBuilder()
  .withProduct('Laptop')
  .withQuantity(2)
  .build();
```

### 2. Factory Pattern for Test Objects

```typescript
// ✅ Good: Centralized object creation
class TestDataFactory {
  static createValidUser() {
    return {
      email: `user${Date.now()}@test.com`,
      password: 'TestPass123!',
      name: 'Test User'
    };
  }

  static createAdminUser() {
    const user = this.createValidUser();
    user.role = 'admin';
    return user;
  }

  static createOrder(userId?: string) {
    return {
      userId: userId || 'user-123',
      product: 'Test Product',
      quantity: 1,
      price: 99.99
    };
  }
}

// Usage
const user = TestDataFactory.createValidUser();
const order = TestDataFactory.createOrder(user.id);
```

### 3. Decorator Pattern for Test Enhancement

```typescript
// ✅ Good: Retry decorator for flaky tests
const WithRetry = (attempts: number = 3) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      for (let i = 0; i < attempts; i++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          if (i === attempts - 1) throw error;
          console.log(`Retry attempt ${i + 1}/${attempts}`);
        }
      }
    };

    return descriptor;
  };
};

// Usage
class APITests {
  @WithRetry(3)
  async testFlakeyNetworkRequest() {
    // Automatically retried up to 3 times
  }
}
```

---

## 📄 Page Object Model

### Base Page Class

```typescript
// ✅ Good: Reusable base class
import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly url: string = '/';

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
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

  async waitForSelector(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }
}
```

### Specific Page Classes

```typescript
// ✅ Good: Domain-specific page objects
export class LoginPage extends BasePage {
  private readonly emailInput = 'input[id="email"]';
  private readonly passwordInput = 'input[id="password"]';
  private readonly submitButton = 'button[type="submit"]';
  private readonly errorMessage = '.error-message';

  async login(email: string, password: string): Promise<void> {
    await this.fillInput(this.emailInput, email);
    await this.fillInput(this.passwordInput, password);
    await this.click(this.submitButton);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForSelector(this.errorMessage);
    return await this.getText(this.errorMessage);
  }

  async isErrorVisible(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }
}

export class DashboardPage extends BasePage {
  readonly url = '/dashboard';
  private readonly welcomeText = 'h1';
  private readonly logoutButton = 'button[id="logout"]';

  async getWelcomeText(): Promise<string> {
    return await this.getText(this.welcomeText);
  }

  async logout(): Promise<void> {
    await this.click(this.logoutButton);
  }
}
```

### Using Page Objects

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('@ui Login Flow', () => {
  test('successful login', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    
    // Act
    await loginPage.goto();
    await loginPage.login('user@test.com', 'password123');
    
    // Assert
    const dashboardPage = new DashboardPage(page);
    const welcome = await dashboardPage.getWelcomeText();
    expect(welcome).toContain('Welcome');
  });

  test('show error on invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login('user@test.com', 'wrongpassword');
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });
});
```

---

## 🔌 API Testing Patterns

### Fluent API Client

```typescript
// ✅ Good: Chainable API client
export class APIClientBuilder {
  private client: APIClient;

  constructor(baseURL: string) {
    this.client = new APIClient(baseURL);
  }

  withAuth(token: string): APIClientBuilder {
    this.client.setToken(token);
    return this;
  }

  withHeaders(headers: Record<string, string>): APIClientBuilder {
    this.client.setHeaders(headers);
    return this;
  }

  build(): APIClient {
    return this.client;
  }
}

// Usage
const client = new APIClientBuilder('http://localhost:3001')
  .withAuth(token)
  .withHeaders({ 'X-Custom': 'value' })
  .build();
```

### Request/Response Wrapper

```typescript
// ✅ Good: Consistent request handling
interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

interface APIResponse {
  status: number;
  headers: Record<string, string>;
  data: any;
  duration: number;
}

class APIClient {
  private baseURL: string;

  async request(req: APIRequest): Promise<APIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await axios({
        method: req.method,
        url: `${this.baseURL}${req.url}`,
        data: req.data,
        headers: req.headers,
        timeout: req.timeout || 5000,
        validateStatus: () => true // Don't throw on any status
      });

      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
}
```

### Parameterized Tests

```typescript
// ✅ Good: Test multiple scenarios
describe.each([
  { email: 'valid@test.com', password: 'Pass123!', expectedStatus: 200 },
  { email: 'invalid@test.com', password: 'wrong', expectedStatus: 401 },
  { email: '', password: 'Pass123!', expectedStatus: 400 },
  { email: 'valid@test.com', password: '', expectedStatus: 400 }
])('@api Login with various inputs', (testCase) => {
  test(`login with ${JSON.stringify(testCase)}`, async () => {
    const response = await client.post('/api/login', testCase);
    expect(response.status).toBe(testCase.expectedStatus);
  });
});
```

---

## 📬 Event Testing Patterns

### Event Publisher Pattern

```typescript
// ✅ Good: Centralized event publishing
class EventPublisher {
  private kafka: KafkaClient;

  constructor(kafkaUrl: string) {
    this.kafka = new KafkaClient(kafkaUrl);
  }

  async publishOrderCreated(order: Order): Promise<void> {
    await this.kafka.publish('order.created', {
      id: order.id,
      timestamp: new Date(),
      data: order
    });
  }

  async publishOrderUpdated(order: Order): Promise<void> {
    await this.kafka.publish('order.updated', {
      id: order.id,
      timestamp: new Date(),
      data: order
    });
  }
}
```

### Event Subscriber with Timeout

```typescript
// ✅ Good: Wait for expected events
async function waitForEvent(
  topic: string,
  timeout: number = 5000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Event timeout on topic: ${topic}`));
    }, timeout);

    eventBus.on(topic, (event) => {
      clearTimeout(timer);
      resolve(event);
    });
  });
}

// Usage
test('should publish order.created event', async () => {
  const responsePromise = waitForEvent('order.created');
  
  await client.post('/api/orders', orderData);
  
  const event = await responsePromise;
  expect(event.data.product).toBe(orderData.product);
});
```

---

## 🔒 Security Testing Patterns

### Injection Prevention Testing

```typescript
// ✅ Good: Test for SQL/NoSQL injection
describe('@security Injection Prevention', () => {
  const injectionPayloads = [
    "'; DROP TABLE users; --",
    "admin' or '1'='1",
    "<script>alert('xss')</script>",
    "${process.env.SECRET}",
    "$(rm -rf /)"
  ];

  injectionPayloads.forEach((payload) => {
    test(`should prevent injection with: ${payload}`, async () => {
      const response = await client.post('/api/login', {
        email: payload,
        password: payload
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Invalid');
    });
  });
});
```

### JWT Validation Testing

```typescript
// ✅ Good: Test token validation
describe('@security JWT Validation', () => {
  test('should reject expired token', async () => {
    const expiredToken = createExpiredToken();
    
    const response = await client.get('/api/protected', {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });

    expect(response.status).toBe(401);
  });

  test('should reject tampered token', async () => {
    const token = createValidToken();
    const tamperedToken = token.slice(0, -10) + 'tampered!!';
    
    const response = await client.get('/api/protected', {
      headers: { Authorization: `Bearer ${tamperedToken}` }
    });

    expect(response.status).toBe(401);
  });

  test('should reject missing token', async () => {
    const response = await client.get('/api/protected');
    expect(response.status).toBe(401);
  });
});
```

---

## 📊 Test Data Management

### Fixture Manager

```typescript
// ✅ Good: Centralized fixture management
export class FixtureManager {
  private fixtures: Map<string, any> = new Map();

  register(key: string, data: any): void {
    this.fixtures.set(key, data);
  }

  get(key: string): any {
    if (!this.fixtures.has(key)) {
      throw new Error(`Fixture not found: ${key}`);
    }
    return this.fixtures.get(key);
  }

  clear(): void {
    this.fixtures.clear();
  }

  async setup(): Promise<void> {
    this.register('validUser', {
      email: 'user@test.com',
      password: 'Password123!'
    });
    this.register('adminUser', {
      email: 'admin@test.com',
      password: 'Password123!',
      role: 'admin'
    });
  }
}

// Usage
beforeAll(async () => {
  await fixureManager.setup();
});

test('test with fixture', async () => {
  const user = fixureManager.get('validUser');
  await client.login(user.email, user.password);
});

afterAll(() => {
  fixureManager.clear();
});
```

### Cleanup Pattern

```typescript
// ✅ Good: Proper cleanup
describe('@api Order Management', () => {
  let createdOrderIds: string[] = [];

  afterEach(async () => {
    // Cleanup created resources
    for (const orderId of createdOrderIds) {
      await client.delete(`/api/orders/${orderId}`);
    }
    createdOrderIds = [];
  });

  test('create and verify order', async () => {
    const response = await client.post('/api/orders', orderData);
    createdOrderIds.push(response.data.id);
    
    expect(response.status).toBe(201);
  });
});
```

---

## ✅ Error Handling & Assertions

### Custom Assertions

```typescript
// ✅ Good: Domain-specific assertions
class OrderAssertions {
  static assertValidOrder(order: any): void {
    expect(order).toHaveProperty('id');
    expect(order).toHaveProperty('product');
    expect(order).toHaveProperty('quantity');
    expect(order).toHaveProperty('price');
    expect(order.quantity).toBeGreaterThan(0);
    expect(order.price).toBeGreaterThan(0);
  }

  static assertOrderCreatedEvent(event: any): void {
    expect(event.topic).toBe('order.created');
    expect(event.data).toBeDefined();
    this.assertValidOrder(event.data);
  }
}

// Usage
test('should create valid order', async () => {
  const response = await client.post('/api/orders', orderData);
  OrderAssertions.assertValidOrder(response.data);
});
```

### Error Case Testing

```typescript
// ✅ Good: Comprehensive error testing
describe('@api Error Handling', () => {
  test('should handle missing required fields', async () => {
    const response = await client.post('/api/orders', {
      product: 'Laptop'
      // Missing quantity and price
    });

    expect(response.status).toBe(400);
    expect(response.data.errors).toContain('quantity');
    expect(response.data.errors).toContain('price');
  });

  test('should handle invalid data types', async () => {
    const response = await client.post('/api/orders', {
      product: 'Laptop',
      quantity: 'invalid', // Should be number
      price: -100 // Should be positive
    });

    expect(response.status).toBe(400);
  });

  test('should handle not found', async () => {
    const response = await client.get('/api/orders/nonexistent-id');
    expect(response.status).toBe(404);
  });
});
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ Hard-coded Waits

```typescript
// ❌ BAD
await page.waitForTimeout(5000);
await expect(element).toBeVisible();

// ✅ GOOD
await expect(element).toBeVisible({ timeout: 5000 });
```

### ❌ Global Test State

```typescript
// ❌ BAD
let globalToken: string;

describe('Tests', () => {
  beforeAll(() => {
    globalToken = createToken(); // Shared state
  });

  test('test 1', () => {
    const response = client.get(url, { token: globalToken });
  });
});

// ✅ GOOD
describe('Tests', () => {
  test('test 1', async () => {
    const token = createToken(); // Test-specific
    const response = client.get(url, { token });
  });
});
```

### ❌ Test Interdependencies

```typescript
// ❌ BAD
describe('Tests', () => {
  test('create order', () => {
    // Creates data used by next test
  });

  test('update order', () => {
    // Depends on previous test
  });
});

// ✅ GOOD
describe('Tests', () => {
  test('create and update order', async () => {
    // Complete scenario in single test
  });

  test('update existing order', async () => {
    // setup own data
  });
});
```

### ❌ Assertions in Loops

```typescript
// ❌ BAD
for (const item of items) {
  expect(item.valid).toBe(true);
}

// ✅ GOOD
expect(items.every(item => item.valid)).toBe(true);
```

### ❌ Ignoring Errors

```typescript
// ❌ BAD
try {
  await client.get('/api/endpoint');
} catch (e) {
  // Silently ignored
}

// ✅ GOOD
expect(async () => {
  await client.get('/api/endpoint');
}).rejects.toThrow('Expected error');
```

---

## 📚 Summary Table

| Pattern | Use Case | Benefit |
|---------|----------|---------|
| Builder | Complex test data | Readable, maintainable |
| Factory | Object creation | DRY, centralized |
| Page Object | UI testing | Maintainability, reusability |
| Fluent API | Client configuration | Readability, chaining |
| Parameterized | Multiple scenarios | Comprehensive coverage |
| Event Waiter | Async events | Reliable event testing |
| Fixture Manager | Test setup | Consistency, cleanup |

---

**Happy testing!** 🎉

For more info, see [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) and [TESTING_PATTERNS.md](TESTING_PATTERNS.md)
