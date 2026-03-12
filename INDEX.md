# 📚 Documentation Index

This repository focuses solely on **test automation resources**. Browse the guides below to understand and extend the framework.

## 🎯 Start Here

- **[README.md](README.md)** – Overview of the test automation framework
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** – Common commands and scenarios

---

## 📖 Core Test Documentation

- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** – Writing tests, architecture, debugging
- **[TESTING_PATTERNS.md](TESTING_PATTERNS.md)** – Design patterns & best practices
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** – API contract references
- **[PERFORMANCE_TESTING_GUIDE.md](PERFORMANCE_TESTING_GUIDE.md)** – Load testing and performance profiling
- **[SETUP_VERIFICATION.md](SETUP_VERIFICATION.md)** – Verification checklist for the framework
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** – Common issues and solutions
- **[CONTRIBUTING.md](CONTRIBUTING.md)** – How to extend the framework

---

## 🔎 Quick Links

- **Run all tests:** 
npm test
- **Run UI tests:** 
npm run test:ui
- **Run API tests:** 
npm run test:api
- **View HTML report:** 
npm run report:html
- **View Allure report:** 
npm run report:allure

---

## 🗺️ Documentation Map

### By Topic

#### Getting Started
1. [README.md](README.md) - Project overview
2. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Cheat sheet
3. [SETUP_VERIFICATION.md](SETUP_VERIFICATION.md) - Verify installation

#### Writing Tests
1. [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Create tests
2. [TESTING_PATTERNS.md](TESTING_PATTERNS.md) - Advanced patterns
3. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference

#### Debugging & Troubleshooting
1. [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Debugging techniques
2. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
3. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick fixes

#### Performance & Optimization
1. [PERFORMANCE_TESTING_GUIDE.md](PERFORMANCE_TESTING_GUIDE.md) - Load testing and profiling
2. [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Performance monitoring
3. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Performance endpoints

#### Contribution
1. [CONTRIBUTING.md](CONTRIBUTING.md) - Extending the framework
2. [SETUP_VERIFICATION.md](SETUP_VERIFICATION.md) - Checklist

---

## 🔍 Finding Answers

###  How do I...?
- **Start the framework?** → [README.md - Quick Start](README.md#-quick-start)
- **Write a new test?** → [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md#1-create-a-new-test)
- **Create a page object?** → [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md#2-create-a-new-page-object)
- **Run specific tests?** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md#-test-selection-quick-guide)
- **Debug a failing test?** → [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md#-debugging)
- **Run load tests?** → [PERFORMANCE_TESTING_GUIDE.md](PERFORMANCE_TESTING_GUIDE.md#-load-testing-with-k6)
- **Optimize performance?** → [PERFORMANCE_TESTING_GUIDE.md](PERFORMANCE_TESTING_GUIDE.md#-performance-optimization)
- **Troubleshoot issues?** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md#common-issues)
- **See all commands?** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md#-useful-commands)

---

## 🎓 Learning Path

### QA/Test Automation (5 days)

**Day 1: Foundation**
- [README.md](README.md) (15 min)
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) (5 min)
- `npm run docker:up && npm test` (10 min)

**Day 2: Test Writing**
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md#-development-workflow) (20 min)
- Create your first test (30 min)

**Day 3: Advanced Testing**
- [TESTING_PATTERNS.md](TESTING_PATTERNS.md) (15 min)
- Learn page objects (15 min)

**Day 4: API & Integration**
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) (15 min)
- Write API tests (20 min)

**Day 5: Debugging & Performance**
- [DEVELOPMENT_GUIDE.md - Debugging](DEVELOPMENT_GUIDE.md#-debugging) (10 min)
- [PERFORMANCE_TESTING_GUIDE.md](PERFORMANCE_TESTING_GUIDE.md) (20 min)

---

## 🔗 Quick Commands

```bash
npm run docs              # Show all documentation
npm run setup             # View setup guide
npm test                  # Run all tests
npm run docker:up         # Start services
```

### Service URLs (after 
npm run docker:up)
- UI: http://localhost:3000
- API: http://localhost:3001
- Kafka: http://localhost:3003

### Important Files
- Main config: [package.json](package.json)
- Docker: [docker/docker-compose.yml](docker/docker-compose.yml)
- Tests: [test-platform/tests/](test-platform/tests/)
- Page Objects: [test-platform/pages/](test-platform/pages/)

---

## 📊 Documentation Statistics

| Metric | Value |
|--------|-------|
| Total Documents | 10 |
| Total Pages | 100+ |
| Code Examples | 100+ |
