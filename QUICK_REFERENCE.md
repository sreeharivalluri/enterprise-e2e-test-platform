# Quick Reference Guide

Concise commands for working with the test automation framework.

## 🚀 Setup

```bash
npm install           # install dependencies
cp .env.example .env # create environment file
```

## 🧪 Running Tests

```bash
npm test               # run full suite
npm run test:ui        # Playwright UI tests
npm run test:api       # API Jest tests
npm run test:kafka     # Kafka event tests
npm run test:security  # Security tests
npm run test:observability # Observability tests
npm run test:contracts # Contract validation tests
npm run test:chaos     # Chaos engineering tests
npm run test:kubernetes# Kubernetes manifest tests
npm run test:feature-flag # Feature flag tests
npm run test:tracing   # Distributed tracing tests
npm run test:performance # Performance (k6) tests
npm run test:integration  # Integration tests
```

### Debug & Watch

```bash
npm run test:ui:debug     # UI tests with browser open
npm run test:api:watch    # API tests in watch mode
```

## 📊 Reports

```bash
npm run report:html    # Playwright HTML report
npm run report:allure  # Allure combined report
```

## 🧹 Cleanup

```bash
npm run clean          # remove logs, reports, coverage
npm run reset          # clean + reinstall dependencies
```

## 🛠️ Code Quality

```bash
npm run lint           # run ESLint checks
npm run lint:fix       # fix lint issues
npm run format         # format code with Prettier
npm run format:check   # verify formatting
```

## 🆘 Help
- See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for test writing and patterns
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
