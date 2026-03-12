# Troubleshooting Guide

Common issues and solutions for the Enterprise E2E Test Platform.

## ❌ Service Startup Issues

### Services Won't Start

**Symptoms:** `Error: connect ECONNREFUSED` or `Port already in use`

**Solutions:**
```bash
# Option 1: Kill existing processes
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3003 | xargs kill -9

# Option 2: Use different ports
export FRONTEND_PORT=3100
export API_PORT=3101
export KAFKA_PORT=3103

# Option 3: Reset Docker
docker system prune -a
npm run docker:down
npm run docker:up
```

### Docker Compose Fails

**Symptoms:** `ERROR: Service 'frontend-ui' failed to build`

**Solutions:**
```bash
# Check Docker resources
docker system df

# Clear Docker cache
docker builder prune
docker system prune -a

# Rebuild images
docker-compose -f docker/docker-compose.yml build --no-cache

# Check logs
docker-compose -f docker/docker-compose.yml logs frontend-ui
```

### Service Health Check Fails

**Symptoms:** Service shows unhealthy in Docker

**Solutions:**
```bash
# Check service logs
npm run docker:logs

# Test health endpoint
curl http://localhost:3001/health
curl http://localhost:3003/health

# Verify port binding
netstat -an | grep 3001
```

## ⏱️ Timeout Issues

### Tests Timing Out

**Symptoms:** `Timeout of 30000ms exceeded`

**Solutions:**
```bash
# Increase timeout
export API_TIMEOUT=60000
npm test

# Or in specific tests
test.setTimeout(60000);
test('should complete', async () => {
  // Test code
});
```

### Playwright Browser Timeout

**Symptoms:** Browser won't connect

**Solutions:**
```bash
# Install browsers
npx playwright install

# Use headed mode to debug
npm run test:ui:debug

# Increase browser launch timeout
export PLAYWRIGHT_LAUNCH_TIMEOUT=60000
```

### PageLoader Timeout

**Symptoms:** Page won't load during tests

**Solutions:**
```bash
# Check if service is running
curl http://localhost:3000

# Verify network connectivity
ping localhost

# Check browser logs
# In browser: F12 > Console > Check for errors
```

## 🔌 Connectivity Issues

### Cannot Connect to API

**Symptoms:** `Error: connect ECONNREFUSED 127.0.0.1:3001`

**Solutions:**
```bash
# Verify service is running
curl http://localhost:3001/health

# Check firewall
sudo iptables -L | grep 3001  # Linux

# Try raw socket connection
telnet localhost 3001

# Check service logs
npm run docker:logs mock-api-service
```

### Cannot Connect to Kafka

**Symptoms:** Event publishing fails

**Solutions:**
```bash
# Verify Kafka service
curl http://localhost:3003/health

# Check event publishing
curl -X POST http://localhost:3003/events/publish \
  -H "Content-Type: application/json" \
  -d '{"topic":"test","event":{"test":true}}'

# View Kafka logs
npm run docker:logs kafka-service
```

### Cross-Origin (CORS) Error

**Symptoms:** `CORS error in browser console`

**Solutions:**
```javascript
// Check CORS configuration in apps/mock-api-service/server.js
app.use(cors());  // Already enabled

// For specific origins, modify:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 🧪 Test Execution Issues

### Tests Fail to Execute

**Symptoms:** Jest or Playwright won't run

**Solutions:**
```bash
# Reinstall dependencies
npm run clean
npm run install:all

# Clear Jest cache
npx jest --clearCache

# Verify TypeScript
npx tsc --noEmit

# Check file permissions
chmod +x test-platform/tests/**/*.spec.ts
```

### Tests Pass Locally But Fail in CI

**Symptoms:** Different behavior in GitHub Actions

**Solutions:**
```bash
# Run in CI mode locally
CI=true npm test

# Check environment variables
env | grep TEST_ENV

# Use same Node version
node --version  # Should be 18+

# Check for race conditions
npm test -- --detectOpenHandles
```

### Flaky Tests

**Symptoms:** Tests pass sometimes, fail other times

**Solutions:**
```typescript
// Add explicit waits
await page.waitForNavigation();
await page.waitForSelector(selector);

// Add retry logic
test.describe('flaky tests', () => {
  test.describe.configure({ 
    retries: 2,  // Retry failed tests
    timeout: 30000 
  });
  
  test('should not be flaky', async () => {
    // Implementation
  });
});

// Use fixtures for consistent data
test('should be stable', async ({ page }, info) => {
  if (info.retry) {
    // Reset state on retry
  }
});
```

## 📋 Data Issues

### Test Data Not Found

**Symptoms:** `AssertionError: Expected elements not visible`

**Solutions:**
```bash
# Verify database/mock state
curl http://localhost:3001/api/orders

# Check logs for errors
export LOG_LEVEL=debug
npm test

# Reset data
curl -X DELETE http://localhost:3003/events/clear
```

### Schema Validation Fails

**Symptoms:** `Response validation failed`

**Solutions:**
```typescript
// Debug validation errors
import * as joi from 'joi';

try {
  const { error, value } = schema.validate(response.data);
  if (error) {
    console.error('Validation details:', error.details);
  }
} catch (err) {
  console.error('Schema error:', err);
}

// Verify schema definition
export const schema = joi.object({
  id: joi.string().required(),
  // ... all required fields
});
```

## 🔐 Authentication Issues

### Login Tests Fail

**Symptoms:** Token not returned or invalid

**Solutions:**
```bash
# Verify credentials
echo "user@test.com / password123"

# Check JWT configuration
# In apps/mock-api-service/server.js
const SECRET_KEY = process.env.SECRET_KEY || 'test-secret-key-12345';

# Test login manually
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'
```

### Unauthorized Errors

**Symptoms:** `401 Unauthorized` responses

**Solutions:**
```typescript
// Verify token is being set
client.setToken(token);

// Check token format
const parts = token.split('.');
console.log('Token parts:', parts.length);  // Should be 3

// Verify authentication middleware
// In apps/mock-api-service/server.js
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Missing token' });
  // ... verification
};
```

## 📊 Performance Issues

### Tests Running Slowly

**Symptoms:** Execution time > 5 minutes

**Solutions:**
```bash
# Run in parallel
npm test -- --workers=8

# Profile test execution
npm test -- --logHeapUsage

# Identify slow tests
npm test -- --verbose

# Skip optional tests
npm run test:api  # API only
npm run test:ui   # UI only
```

### Memory Leaks

**Symptoms:** Process uses increasing memory

**Solutions:**
```bash
# Enable garbage collection logging
node --expose-gc test-platform/tests/api/api.spec.ts

# Check for unclosed connections
// In tests
afterEach(async () => {
  await client.close?.();  // Close connections
  await page.close();       // Close browser pages
});
```

## 📦 Dependency Issues

### npm install Fails

**Symptoms:** `npm ERR! code ERESOLVE`

**Solutions:**
```bash
# Clear cache
npm cache clean --force

# Use legacy dependency resolution
npm install --legacy-peer-deps

# Update npm itself
npm install -g npm@latest

# Check Node version
node --version  # Should be 18+
```

### Missing Module Errors

**Symptoms:** `Cannot find module 'playwright'`

**Solutions:**
```bash
# Reinstall specific packages
npm install @playwright/test --save-dev

# Install Playwright browsers
npx playwright install

# Verify installation
ls node_modules/.bin | grep playwright
```

## 🐳 Docker Issues

### Docker Desktop Won't Connect

**Symptoms:** `Cannot connect to Docker daemon`

**Solutions:**
```bash
# Check Docker status
docker ps

# Restart Docker Desktop
# macOS/Windows: Quit and reopen Docker Desktop
# Linux: systemctl restart docker

# Check socket permissions (Linux)
sudo usermod -aG docker $USER
```

### Image Build Fails

**Symptoms:** `failed to solve with frontend dockerfile.v0`

**Solutions:**
```bash
# Check Dockerfile syntax
docker build --help

# Use specific base image version
# Change: FROM node:18-alpine
# To: FROM node:18.20.0-alpine

# Increase Docker resources
# Docker Desktop: Preferences > Resources
```

### Volume Mount Issues

**Symptoms:** `Volume mount permission denied`

**Solutions:**
```bash
# Fix permissions (Linux/Mac)
sudo chown -R $(id -u):$(id -g) ./test-platform

# Windows: Run as administrator

# Alternative: Use named volumes
volumes:
  - test-data:/app/test-results
volumes:
  test-data:
```

## 💻 System-Specific Issues

### macOS Issues

```bash
# Permission denied errors
sudo chown -R $USER:staff ~/OneDrive/Documents/GithubProject

# Port conflicts
lsof -i :3000

# Docker resources
# Docker Desktop > Preferences > Resources > Increase Memory/CPU
```

### Windows Issues

```bash
# PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Path issues
# Use forward slashes: path/to/file
# Or escape backslashes: path\\to\\file

# Line ending issues
# git config core.autocrlf true
```

### Linux Issues

```bash
# Docker socket permissions
sudo usermod -aG docker $USER
newgrp docker

# Firewall blocks ports
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 3003/tcp

# Memory limits
free -h
```

## 🆘 Getting Help

1. **Check Logs:**
   ```bash
   npm run docker:logs
   tail -f logs/combined.log
   ```

2. **Search Documentation:**
   - Check README.md
   - Review CONTRIBUTING.md
   - Search GitHub issues

3. **Debug Mode:**
   ```bash
   export LOG_LEVEL=debug
   npm test
   ```

4. **Report Issues:**
   - Include error message
   - Share relevant logs
   - Describe reproduction steps
   - Include system information

---

**Contact:** Enterprise QA Team  
**Last Updated:** March 2026
