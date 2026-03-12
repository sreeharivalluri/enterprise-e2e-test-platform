# Development Guide

Complete guide for developing and extending the Enterprise E2E Test Platform.

## 🎯 Development Objectives

This guide covers:
- Setting up the development environment
- Understanding project architecture
- Writing and maintaining tests
- Debugging and troubleshooting
- Best practices and patterns

---

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **Docker** & Docker Compose ([Download](https://www.docker.com/products/docker-desktop))
- **Git** for version control
- **VS Code** (optional but recommended)

---

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone repository
git clone <repo-url>
cd enterprise-e2e-test-platform

# Run setup (Linux/Mac)
bash setup.sh

# Or setup (Windows)
powershell -ExecutionPolicy Bypass -File setup.ps1

# Or manual setup
npm run install:all
cp .env.example .env
```

### 2. Start Services

**Option A: Docker (Recommended)**
```bash
npm run docker:up
# Wait for services to be healthy
npm run health
```

**Option B: Local Development**
```bash
# Terminal 1
npm run start:api

# Terminal 2
npm run start:kafka

# Terminal 3
npm run start:ui
```

### 3. Run Tests

```bash
# All tests
npm test

# Specific suite
npm run test:api
npm run test:ui
npm run test:security

# Watch mode (API tests)
npm run test:api:watch

# Debug UI tests
npm run test:ui:debug

# Integration tests
npm run test:integration
```

### 4. View Reports

```bash
# Playwright HTML report
npm run report:html

# Allure report
npm run report:allure
```

---

## 📁 Project Structure

```
enterprise-e2e-test-platform/
├── apps/                    # Application services
│   ├── frontend-ui/
│   │   ├── server.js       # Express + HTML UI
│   │   ├── Dockerfile
│   │   └── package.json
│   └── mock-api-service/
│       ├── server.js       # REST API
│       ├── Dockerfile
│       └── package.json
├── services/
│   └── kafka/
│       ├── server.js       # Event service
│       ├── Dockerfile
│       └── package.json
├── test-platform/          # Test automation
│   ├── tests/
│   │   ├── ui/            # Playwright tests
│   │   ├── api/           # Jest + Axios tests
│   │   ├── kafka/         # Event tests
│   │   ├── security/      # Security tests
│   │   ├── observability/ # Monitoring tests
│   │   └── performance/   # k6 load tests
│   ├── pages/             # Page Object Model
│   ├── api-clients/       # API client wrapper
│   ├── fixtures/          # Test data
│   ├── schemas/           # Joi validation
│   ├── utils/             # Helpers & utilities
│   ├── config/            # Configuration
│   ├── jest.config.json
│   ├── playwright.config.ts
│   └── package.json
├── docker/
│   └── docker-compose.yml
├── k8s/                   # Kubernetes manifests
├── .github/workflows/     # GitHub Actions
├── CONFIG_FILES:
│   ├── .eslintrc.json    # Linting rules
│   ├── .prettierrc.json  # Code formatting
│   ├── .allurerc         # Allure config
│   ├── .env.example      # Environment template
│   ├── tsconfig.json     # TypeScript config
│   └── package.json      # Root monorepo
└── DOCUMENTATION:
    ├── README.md
    ├── CONTRIBUTING.md
    ├── TROUBLESHOOTING.md
    ├── API_DOCUMENTATION.md
    └── DEVELOPMENT_GUIDE.md
```

---

## 🏗️ Architecture Overview

### Service Communication

```
┌─────────────────────────────────────────┐
│         Frontend UI (3000)              │
│    ├─ Login Page                        │
│    ├─ Dashboard                         │
│    └─ Orders Management                 │
└────────────────┬────────────────────────┘
                 │ HTTP
┌────────────────▼────────────────────────┐
│       Mock API Service (3001)           │
│    ├─ POST /api/login                   │
│    ├─ GET /api/orders                   │
│    ├─ POST /api/orders                  │
│    └─ DELETE /api/orders/:id            │
└────────────────┬────────────────────────┘
                 │ HTTP (Events)
┌────────────────▼────────────────────────┐
│       Kafka Service (3003)              │
│    ├─ order.created                     │
│    ├─ order.updated                     │
│    └─ order.deleted                     │
└─────────────────────────────────────────┘
```

### Test Execution Flow

```
Test Framework (Jest, Playwright, k6)
    │
    ├─ UI Tests (Playwright)
    │   └─ Page Objects
    │       └─ Base Page + Specific Pages
    │
    ├─ API Tests (Jest + Axios)
    │   └─ API Client
    │       └─ Schema Validation
    │
    ├─ Event Tests (Jest)
    │   └─ Kafka Client
    │       └─ Event Validation
    │
    ├─ Security Tests (Jest)
    │   └─ Exploit Prevention
    │       └─ Auth Validation
    │
    ├─ Observability Tests (Jest)
    │   └─ Metrics Validation
    │       └─ Health Checks
    │
    └─ Performance Tests (k6)
        └─ Load Testing
            └─ Thresholds
```

---

## 💻 Development Workflow

### 1. Create a New Test

**UI Test Example:**

```typescript
// test-platform/tests/ui/new-feature.spec.ts
import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/base.page';

test.describe('@ui New Feature Tests', () => {
  test('should perform action', async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.goto('/');
    await basePage.fillInput('input[id="email"]', 'user@test.com');
    const text = await basePage.getText('h1');
    expect(text).toContain('Expected Text');
  });
});
```

**Run it:**
```bash
npm run test:ui
```

### 2. Create a New Page Object

```typescript
// test-platform/pages/new-feature.page.ts
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class NewFeaturePage extends BasePage {
  private button = 'button[id="action"]';
  private result = '#result';

  async clickAction(): Promise<void> {
    await this.click(this.button);
  }

  async getResult(): Promise<string> {
    return await this.getText(this.result);
  }
}
```

**Use in test:**
```typescript
import { NewFeaturePage } from '../pages/new-feature.page';

test('should use new page object', async ({ page }) => {
  const newPage = new NewFeaturePage(page);
  await newPage.navigateTo();
  await newPage.clickAction();
  const result = await newPage.getResult();
  expect(result).toBe('Success');
});
```

### 3. Add API Test

```typescript
// test-platform/tests/api/new-endpoint.spec.ts
import { ApiClient } from '../../api-clients/api-client';
import * as joi from 'joi';

describe('@api New Endpoint Tests', () => {
  let client: ApiClient;

  beforeAll(async () => {
    client = new ApiClient();
    await client.login('user@test.com', 'password123');
  });

  test('should get new endpoint', async () => {
    const response = await client.get('/api/new-endpoint');
    expect(response.status).toBe(200);
    
    const schema = joi.object({
      id: joi.string().required(),
      name: joi.string().required()
    });
    
    client.validateResponse(response, schema);
  });
});
```

### 4. Add Integration Test

```typescript
import { testUsers } from '../../fixtures/test-data';
import { AsyncHelper } from '../../utils/advanced-helpers';

test('should handle async operations', async () => {
  await AsyncHelper.waitFor(
    () => checkCondition(),
    'Condition should be true',
    5000  // timeout
  );
});
```
### 4. Contract Tests

Contract tests ensure each service adheres to a shared agreement. Schemas live under `test-platform/contracts`.

```typescript
// Example contract test
import { loginResponseSchema } from '../contracts/api/login.schema';

test('login response conforms', async () => {
  const res = await client.post('/api/login', validCredentials);
  client.validateResponse(res, loginResponseSchema);
});
```

### 5. Chaos Engineering Tests

Chaos scenarios are located in `test-platform/tests/chaos`. A simple toggle endpoint is available in the API service (`/admin/chaos/enable`).

```typescript
// Toggle chaos on / off
test('simulate api failure', async () => {
  await axios.post('http://localhost:3001/admin/chaos/enable');
  await expect(axios.get('http://localhost:3001/health')).rejects.toThrow();
  await axios.post('http://localhost:3001/admin/chaos/disable');
});
```

### 6. Kubernetes Validation Tests

Ensure manifests are syntactically correct and cluster is healthy using `kubectl` from tests. See `test-platform/tests/kubernetes`.

```typescript
test('validate manifest syntax', async () => {
  await exec('kubectl apply --dry-run=client -f infrastructure/kubernetes/frontend-ui-deployment.yaml');
});
```

### 7. Feature Flag Tests

The feature‑flag service runs on port 3004. Tests can toggle flags at runtime.

```typescript
await axios.post('http://localhost:3004/flags/newDashboard', { enabled: true });
```

### 8. Distributed Tracing

Each request carries an `x-trace-id` header. Services propagate the header and include it in events. Check contract schemas for `traceId`.

---

## 🔧 Code Quality

### Linting

```bash
# Check code style
npm run lint

# Fix automatically
npm run lint:fix

# Check specific file
npx eslint test-platform/tests/api/api.spec.ts --fix
```

### Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Format specific file
npx prettier --write test-platform/tests/api/api.spec.ts
```

### TypeScript Compilation

```bash
# Check types
npx tsc --noEmit

# Compile TypeScript
npx tsc
```

---

## 🧪 Testing Best Practices

### 1. Use Descriptive Names

```typescript
// ❌ Bad
test('test1', async () => {
  // ...
});

// ✅ Good
test('should successfully create order with valid data', async () => {
  // ...
});
```

### 2. Follow AAA Pattern

```typescript
// ✅ Arrange-Act-Assert
test('should create order', async () => {
  // Arrange
  const orderData = { product: 'Laptop', quantity: 1, price: 999 };
  
  // Act
  const response = await client.post('/api/orders', orderData);
  
  // Assert
  expect(response.status).toBe(201);
  expect(response.data.product).toBe('Laptop');
});
```

### 3. Use Test Fixtures

```typescript
import { testUsers, testOrders } from '../../fixtures/test-data';

test('should use fixtures', async () => {
  const user = testUsers.validUser;
  const order = testOrders[0];
  
  const response = await client.login(user.email, user.password);
  expect(response.status).toBe(200);
});
```

### 4. Add Retry Logic for Flaky Tests

```typescript
test('flaky network test', async () => {
  await AsyncHelper.retryWithBackoff(async () => {
    const response = await fetch('/api/endpoint');
    expect(response.ok).toBe(true);
  }, 3, 1000, 2);
});
```

### 5. Tag Tests for Selective Execution

```typescript
test.describe('@ui @smoke User Tests', () => {
  test('should login', async ({ page }) => {
    // Test code
  });
});

// Run only smoke tests
// npm run test:ui -- --grep @smoke
```

---

## 🐛 Debugging

### Debug UI Tests

```bash
# Open browser for debugging
npm run test:ui:debug

# Slow down execution
test.slow()
```

### Debug with Logs

```typescript
import { Logger } from '../../utils/logger';

test('test with logging', async () => {
  Logger.initialize();
  Logger.info('Starting test');
  Logger.debug('Debug information', { data: 'value' });
  Logger.warn('Warning message');
  Logger.error('Error message', error);
});

// Set log level
export LOG_LEVEL=debug npm test
```

### Enable Verbose Output

```bash
# Verbose Jest output
npm run test:api -- --verbose

# Verbose Playwright
npm run test:ui -- --verbose
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## 📊 Performance & Monitoring

### Monitor Test Performance

```typescript
import { PerformanceMonitor } from '../../utils/advanced-helpers';

test('monitor performance', async () => {
  const { result, duration } = await PerformanceMonitor.measureTime(
    'API Call',
    () => client.get('/api/orders')
  );
  
  expect(duration).toBeLessThan(500);
});
```

### Check Memory Usage

```typescript
test('monitor memory', () => {
  const memory = PerformanceMonitor.getMemoryUsage();
  console.log(`Heap Used: ${memory.heapUsed}MB`);
  console.log(`Heap Total: ${memory.heapTotal}MB`);
});
```

### Response Time Analysis

```typescript
const responseTimes = [100, 150, 120, 200, 110];
const metrics = PerformanceMonitor.getResponseTimeMetrics(responseTimes);
// { min: 100, max: 200, avg: 136, p50: 120, p95: 200, p99: 200 }
```

---

## 🚀 Continuous Integration

### GitHub Actions Setup

Tests run automatically on:
- Push to main/develop
- Pull requests
- Daily schedule (2 AM UTC)

View workflows: `.github/workflows/e2e-tests.yml`

### Local CI Simulation

```bash
# Run all tests like CI
CI=true npm test
```

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Jest Testing Framework](https://jestjs.io)
- [Joi Schema Validation](https://joi.dev)
- [k6 Load Testing](https://k6.io)
- [Express.js API](https://expressjs.com)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following style guide
3. Run tests: `npm test`
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

---

## ✅ Checklist for New Tests

- [ ] Test has descriptive name
- [ ] Follows AAA (Arrange-Act-Assert) pattern
- [ ] Uses appropriate fixtures
- [ ] Has proper error handling
- [ ] Includes logging where helpful
- [ ] Uses appropriate assertions
- [ ] Tests are tagged (@ui, @api, etc.)
- [ ] No hard-coded wait times
- [ ] No console.log (use Logger instead)
- [ ] Code formatted and linted

---

**Happy coding!** 🎉

For questions, check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or [CONTRIBUTING.md](CONTRIBUTING.md)
