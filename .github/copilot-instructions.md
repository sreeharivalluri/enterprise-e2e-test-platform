# Test Automation Repository Instructions

This repository contains **only the enterprise E2E test automation framework**. All development and service code has been migrated to a separate mock-services repository. Use this file to guide tools and contributors through the test-focused layout and expectations.

## What You Will Find

- `test-platform/` – all tests, page objects, utilities, configs
- Root documentation oriented around testing (README.md, QUICK_REFERENCE.md, GOVERNANCE guides)
- Setup scripts (`setup.sh`, `setup.ps1`) for prepping the test environment
- Lightweight package.json with scripts limited to running and reporting tests

## Primary Goals

1. **Execute Tests** – `npm test` runs the full suite; individual suites available via `npm run test:ui`, `test:api`, etc.
2. **Understand Architecture** – framework uses Playwright for UI and Jest for API/Kafka/observability tests.
3. **Extend the Framework** – add new tests, utilities, or patterns following existing conventions.
4. **Minimize Noise** – there are no microservice implementations, Docker compose files, or infrastructure manifests in this repo.

## Relevant Documentation

- **README.md** – overview and quick start for testers
- **INDEX.md** – navigation hub for all test documentation
- **DEVELOPMENT_GUIDE.md** – how to write and debug tests
- **TESTING_PATTERNS.md** – best practices and anti‑patterns
- **API_DOCUMENTATION.md**, **PERFORMANCE_TESTING_GUIDE.md**, **TROUBLESHOOTING.md**

## Scripts Overview

Only scripts required for testing remain:

```json
"scripts": {
  "test": "npm run test:ui && npm run test:api && npm run test:kafka && npm run test:security && npm run test:observability",
  "test:ui": "cd test-platform && npx playwright test tests/ui --reporter=html",
  ...
  "lint": "eslint .",
  "format": "prettier --write ...",
  "clean": "rm -rf test-platform/allure-results ...",
  "setup": "bash setup.sh",
  "docs": "echo '...'"
}
```

## Notes for Contributors

- Do **not** add service code here; that work belongs in the mock‑services repo.
- Focus on test logic, helpers, and module quality.
- Keep documentation aligned with testing concepts only.

The repository is now a clean, professional showcase of automated testing capabilities suitable for sharing as a standalone portfolio or CI component.