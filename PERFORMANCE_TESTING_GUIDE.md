# Performance Testing Guide

Complete guide for performance testing, analysis, and optimization of the Enterprise E2E Test Platform.

## 📋 Table of Contents

1. [Performance Testing Overview](#performance-testing-overview)
2. [Load Testing with k6](#load-testing-with-k6)
3. [Browser Performance Testing](#browser-performance-testing)
4. [API Performance Testing](#api-performance-testing)
5. [Memory and CPU Profiling](#memory-and-cpu-profiling)
6. [Performance Optimization](#performance-optimization)
7. [Benchmarking](#benchmarking)
8. [CI/CD Integration](#cicd-integration)

---

## 🎯 Performance Testing Overview

### Key Metrics

| Metric | Target | Tool |
|--------|--------|------|
| API Response Time (p95) | < 500ms | k6, Jest |
| Page Load Time | < 2s | Playwright, Lighthouse |
| Memory Usage | < 512MB | Node --inspect |
| CPU Usage | < 80% | Container stats |
| Concurrent Users | 1000+ | k6 |
| Error Rate | < 0.1% | k6, Jest |
| Throughput | 500+ req/s | k6 |

### Types of Testing

1. **Load Testing**: Baseline performance under normal load
2. **Stress Testing**: Performance under extreme conditions
3. **Spike Testing**: Sudden traffic increases
4. **Endurance Testing**: Performance over extended periods
5. **Soak Testing**: System stability over time

---

## ⚡ Load Testing with k6

### Running Load Tests

```bash
# Basic load test
npm run test:performance

# Or directly with k6
k6 run test-platform/tests/performance/load-test.js

# With environment variables
k6 run -e BASE_URL=http://localhost:3001 \
        -e VIRTUAL_USERS=100 \
        -e DURATION=60s \
        test-platform/tests/performance/load-test.js
```

### Load Test Configuration

Current thresholds in `load-test.js`:

```javascript
// API response time
http_req_duration: ['p(95)<500', 'p(99)<1000'],

// Error rate
http_req_failed: ['rate<0.1'],

// Success rate
http_req_success: ['rate>0.9'],

// Group-specific thresholds
checks: ['rate>0.9']
```

### Customizing Load Tests

Modify `test-platform/tests/performance/load-test.js`:

```javascript
export const options = {
  vus: 50,              // Virtual users
  duration: '30s',      // Test duration
  rampUp: '10s',        // Ramp-up time
  rampDown: '10s',      // Ramp-down time
  
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  }
};
```

### Load Test Scenarios

**Example: Create Orders Under Load**

```javascript
export default function() {
  // Setup
  const user = {
    email: `user${__VU}@test.com`,
    password: 'password123'
  };

  // Login
  const loginRes = http.post(
    `${BASE_URL}/api/login`,
    JSON.stringify(user),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const token = loginRes.json('token');
  
  // Create Multiple Orders
  for (let i = 0; i < 5; i++) {
    const order = {
      product: `Product ${i}`,
      quantity: Math.floor(Math.random() * 10) + 1,
      price: Math.random() * 1000
    };

    http.post(
      `${BASE_URL}/api/orders`,
      JSON.stringify(order),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    sleep(0.5);
  }
}
```

### Analyzing Load Test Results

```bash
# Run test with JSON output
k6 run test-platform/tests/performance/load-test.js \
  --out json=results.json

# Generate summary
k6 run test-platform/tests/performance/load-test.js \
  --summary-export=summary.json
```

Parse results:

```javascript
// Read results.json
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('results.json', 'utf8'));

// Analyze
console.log('Total Requests:', results.length);
console.log('Errors:', results.filter(r => r.type === 'http' && r.data.error).length);
```

---

## 🌐 Browser Performance Testing

### Lighthouse Integration

```bash
# Install Lighthouse
npm install --save-dev @lighthouse-ci/cli

# Run audit
lighthouse http://localhost:3000 --view

# CI mode
npm install --save-dev @lighthouse-ci/cli
lighthouse-ci autorun
```

### Playwright Performance API

```typescript
// test-platform/tests/ui/performance.spec.ts
import { test } from '@playwright/test';

test('measure page load performance', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Get navigation timing
  const timing = await page.evaluate(() => {
    const t = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: t.domContentLoadedEventEnd - t.domContentLoadedEventStart,
      loadComplete: t.loadEventEnd - t.loadEventStart,
      domInteractive: t.domInteractive - t.fetchStart
    };
  });

  console.log('Timing:', timing);
  
  // Assert performance
  expect(timing.domContentLoaded).toBeLessThan(1000);
  expect(timing.loadComplete).toBeLessThan(2000);
});
```

### Core Web Vitals Measurement

```typescript
test('measure core web vitals', async ({ page }) => {
  const webVitals = {};

  // Collect Core Web Vitals
  page.on('console', msg => {
    if (msg.type() === 'log') {
      const text = msg.text();
      if (text.startsWith('CWV:')) {
        const [key, value] = text.replace('CWV:', '').trim().split(':');
        webVitals[key] = parseFloat(value);
      }
    }
  });

  // Inject Core Web Vitals script
  await page.addScriptTag({
    url: 'https://web-vitals.vercel.app/web-vitals.iife.js'
  });

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);

  console.log('Core Web Vitals:', webVitals);
});
```

---

## 🔌 API Performance Testing

### Response Time Analysis

```typescript
import { PerformanceMonitor } from '../../utils/advanced-helpers';

describe('@api Performance Tests', () => {
  test('API response time should be < 500ms', async () => {
    const times: number[] = [];

    for (let i = 0; i < 10; i++) {
      const { duration } = await PerformanceMonitor.measureTime(
        'API Call',
        () => client.get('/api/orders')
      );
      times.push(duration);
    }

    const metrics = PerformanceMonitor.getResponseTimeMetrics(times);
    
    expect(metrics.avg).toBeLessThan(500);
    expect(metrics.p95).toBeLessThan(800);
    expect(metrics.p99).toBeLessThan(1000);
  });
});
```

### Concurrent Request Testing

```typescript
import { AsyncHelper } from '../../utils/advanced-helpers';

test('should handle concurrent requests', async () => {
  const requests = Array(50).fill(null).map((_, i) =>
    client.get(`/api/orders`)
  );

  const results = await AsyncHelper.parallelWithLimit(
    requests,
    10  // Run 10 concurrent requests at a time
  );

  expect(results.every(r => r.status === 200)).toBe(true);
});
```

### Memory Leak Detection

```typescript
test('detect memory leaks', async () => {
  const initialMemory = PerformanceMonitor.getMemoryUsage();

  // Run operation 1000 times
  for (let i = 0; i < 1000; i++) {
    await client.get('/api/orders');
  }

  const finalMemory = PerformanceMonitor.getMemoryUsage();
  const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

  // Memory increase should be minimal
  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
});
```

---

## 💾 Memory and CPU Profiling

### Enable Node Profiling

```bash
# Start with inspector
node --inspect apps/mock-api-service/server.js

# In Chrome DevTools: chrome://inspect
```

### CPU Profiling

```typescript
// Create CPU profile
import v8 from 'v8';
import fs from 'fs';

const profiler = v8.startProfiling('test');

// Run code under test
for (let i = 0; i < 1000000; i++) {
  // Expensive operation
}

const profile = profiler.stopProfiling();
fs.writeFileSync('profile.cpuprofile', JSON.stringify(profile));
```

### Memory Profiling

```bash
# Take heap snapshot
node --heap-prof apps/mock-api-service/server.js

# Analyze snapshot
node --prof-process isolate-*.log > analysis.txt
```

### Memory Usage Monitoring

```typescript
test('monitor memory usage', () => {
  const before = PerformanceMonitor.getMemoryUsage();
  
  // Operation
  const large = new Array(1000000).fill('x');
  
  const after = PerformanceMonitor.getMemoryUsage();
  
  console.log('Memory delta:', {
    heapUsed: (after.heapUsed - before.heapUsed) / 1024 / 1024,
    heapTotal: (after.heapTotal - before.heapTotal) / 1024 / 1024
  });
});
```

---

## ⚙️ Performance Optimization

### 1. API Response Optimization

**Current (slow):**

```javascript
app.get('/api/orders', (req, res) => {
  const allOrders = orders; // All orders
  res.json(allOrders); // Return all
});
```

**Optimized:**

```javascript
app.get('/api/orders', (req, res) => {
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 10);
  
  const start = (page - 1) * limit;
  const paginatedOrders = orders.slice(start, start + limit);
  
  res.json({
    data: paginatedOrders,
    total: orders.length,
    page,
    limit
  });
});
```

### 2. Caching Implementation

```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

app.get('/api/orders', (req, res) => {
  const key = `orders:${req.query.page}`;
  
  // Check cache
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < CACHE_TTL) {
      return res.json(data);
    }
    cache.delete(key);
  }

  // Fetch and cache
  const data = orders.slice(0, 10);
  cache.set(key, { data, timestamp: Date.now() });
  
  res.json(data);
});
```

### 3. Connection Pooling

```javascript
// Reuse HTTP agent
const http = require('http');
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 60000,
  keepAliveMsecs: 30000
});

// Use in requests
const options = { agent };
http.request(url, options, callback);
```

### 4. Event Loop Optimization

```javascript
// Avoid blocking operations
const fs = require('fs').promises;

// Bad: Synchronous
const data = fs.readFileSync('file.json');

// Good: Asynchronous
const data = await fs.readFile('file.json');
```

### 5. Database Query Optimization

```javascript
// Bad: N+1 queries
orders.forEach(order => {
  const user = db.users.find({ id: order.userId });
});

// Good: Single query with join
const ordersWithUsers = db.query(`
  SELECT o.*, u.*
  FROM orders o
  JOIN users u ON o.user_id = u.id
`);
```

---

## 📊 Benchmarking

### Create Benchmark Suite

```javascript
// test-platform/benchmarks/api-benchmark.js
import { performance } from 'perf_hooks';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

class APIBenchmark {
  async benchmarkLogin() {
    const iterations = 100;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      await axios.post(`${BASE_URL}/api/login`, {
        email: 'user@test.com',
        password: 'password123'
      });

      const end = performance.now();
      times.push(end - start);
    }

    return this.calculateStats(times);
  }

  calculateStats(times) {
    const sorted = times.sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: times.reduce((a, b) => a + b) / times.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
}

// Run benchmark
const benchmark = new APIBenchmark();
const results = await benchmark.benchmarkLogin();
console.table(results);
```

Run:

```bash
node test-platform/benchmarks/api-benchmark.js
```

---

## 🔄 CI/CD Integration

### GitHub Actions Performance Check

```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Start services
        run: |
          docker-compose -f docker/docker-compose.yml up -d
          sleep 10
      
      - name: Run load tests
        run: npm run test:performance
        env:
          BASE_URL: http://localhost:3001
      
      - name: Run UI performance
        run: npm run test:ui
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: |
            results.json
            playwright-report/
```

---

## 📈 Performance Reporting

### Generate Performance Report

```bash
# Run full performance suite
npm run test:performance > perf-report.txt

# Parse and visualize
node -e "
const results = JSON.parse(require('fs').readFileSync('results.json'));
console.log('Performance Summary:');
console.log('- Total Requests:', results.length);
console.log('- Duration:', results.duration);
console.log('- Avg Response Time:', results.avgRequestDuration);
console.log('- Error Count:', results.errors);
"
```

### Comparison Report

```typescript
// Compare with baseline
const baseline = require('./baseline.json');
const current = require('./current.json');

const comparison = {
  responseTimeChange: ((current.avg - baseline.avg) / baseline.avg) * 100,
  throughputChange: ((current.throughput - baseline.throughput) / baseline.throughput) * 100,
  errorRateChange: current.errorRate - baseline.errorRate
};

console.log('Performance Change:', comparison);
```

---

## ✅ Performance Checklist

- [ ] Load test passes with SLAs met
- [ ] Memory usage within limits
- [ ] CPU usage under 80%
- [ ] No memory leaks detected
- [ ] Response times meet targets
- [ ] Error rate < 0.1%
- [ ] Database queries optimized
- [ ] Caching implemented
- [ ] Connection pooling configured
- [ ] Performance logged
- [ ] Baseline established
- [ ] CI/CD includes performance tests

---

## 📚 Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [Lighthouse Guide](https://developers.google.com/web/tools/lighthouse)
- [Node.js Performance Guide](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Web Vitals](https://web.dev/vitals/)
- [Playwright Performance API](https://playwright.dev/docs/api/class-page/#page-metrics)

---

**Happy optimizing!** 🚀

For issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
