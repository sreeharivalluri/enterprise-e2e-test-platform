# Contributing Guide

This guide explains how to extend and customize the Enterprise E2E Test Platform.

## 📝 Coding Standards

### TypeScript
- Use strict typing
- Export interfaces and types
- Comment public APIs
- Use meaningful variable names

### Testing
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Tag tests with `@category` (e.g., `@ui`, `@api`, `@kafka`)
- Include positive and negative test cases

### Code Quality
```bash
npm run lint    # Check code style
npm run format  # Auto-format code
```

## 🧪 Adding New Tests

### UI Tests

1. **Create Page Object:**
```typescript
// test-platform/pages/new.page.ts
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class NewPage extends BasePage {
  private button = 'button[id="submit"]';
  
  async clickSubmit(): Promise<void> {
    await this.click(this.button);
  }
}
```

2. **Create Test:**
```typescript
// test-platform/tests/ui/new.spec.ts
import { test, expect } from '@playwright/test';
import { NewPage } from '../pages/new.page';

test.describe('@ui New Feature Tests', () => {
  test('should perform action', async ({ page }) => {
    const newPage = new NewPage(page);
    // Test implementation
  });
});
```

### API Tests

1. **Add Schema:**
```typescript
// test-platform/schemas/schemas.ts
export const newEndpointSchema = joi.object({
  id: joi.string().required(),
  name: joi.string().required()
});
```

2. **Create Test:**
```typescript
// test-platform/tests/api/api.spec.ts
test('should test new endpoint', async () => {
  const response = await client.get('/api/new-endpoint');
  expect(response.status).toBe(200);
  client.validateResponse(response, newEndpointSchema);
});
```

### Kafka Tests

```typescript
// test-platform/tests/kafka/kafka.spec.ts
test('should handle new event', async () => {
  const response = await kafkaClient.post('/events/publish', {
    topic: 'new.event',
    event: { /* event data */ }
  });
  
  expect(response.status).toBe(201);
});
```

## 🚀 Adding New API Endpoints

This repository is dedicated to test automation; the mock services have been moved to a separate repository. Use the service repo for endpoint development. In this project you can focus on writing tests and expanding the framework.

## 📊 Debugging Tests

### Debug UI Tests
```bash
npm run test:ui:debug
```

### View Test Logs
```bash
export LOG_LEVEL=debug
npm test
```

### Run Single Test
```bash
npx jest tests/api/api.spec.ts -t "login"
```

(remaining sections such as deployment, service creation, and environment customization have been removed to keep this repo focused on testing.)

1. Never commit secrets or credentials
2. Use environment variables for sensitive data
3. Validate all inputs with Joi schemas
4. Sanitize all outputs
5. Use HTTPS in production
6. Rotate JWT secrets regularly
7. Implement rate limiting
8. Use CORS appropriately

## 📈 Performance Optimization

1. Use parallel test execution:
   ```bash
   npm test -- --workers=8
   ```

2. Implement test sharding for CI
3. Cache dependencies in Docker
4. Use production builds for lighthouse
5. Monitor test execution time

## 🐛 Common Issues

### Tests Timing Out
- Increase timeout: `export API_TIMEOUT=60000`
- Check service health: `curl http://localhost:3001/health`
- View logs: `npm run docker:logs`

### Port Already in Use
```bash
# Kill process
lsof -ti:3000 | xargs kill -9
```


## 📝 Git Workflow

1. Create feature branch: `git checkout -b feature/test-feature`
2. Make changes and commit
3. Run tests: `npm test`
4. Push: `git push origin feature/test-feature`
5. Create Pull Request with test results

## 📚 Resources

- [Playwright Docs](https://playwright.dev)
- [Jest Docs](https://jestjs.io)
- [Joi Schema](https://joi.dev)
- [k6 Performance](https://k6.io)
- [Docker Docs](https://docs.docker.com)

## 🤝 Support

For issues:
1. Check existing GitHub issues
2. Search documentation
3. Review code examples
4. Create new issue with details

---

Happy testing! 🎉
