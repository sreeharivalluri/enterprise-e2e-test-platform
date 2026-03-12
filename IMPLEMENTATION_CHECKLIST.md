# 🎯 Repo Separation Implementation Checklist

## Phase 1: Prepare Mock Services Repository

### Step 1: Create New GitHub Repository
- [ ] Create new repo: `e2e-mock-services` on GitHub
- [ ] Clone it locally: `git clone https://github.com/yourusername/e2e-mock-services`
- [ ] Copy `MOCK_SERVICES_README_TEMPLATE.md` from this repo as `README.md` in new repo

### Step 2: Copy Backend Code
From current repo, copy these folders to new repo:
- [ ] `apps/` folder (frontend-ui + mock-api-service)
- [ ] `services/` folder (kafka service)
- [ ] `docker/` folder (docker-compose.yml for services only)

### Step 3: Copy Configuration Files
- [ ] `.env.example` (modify to remove test configs, keep service configs only)
- [ ] `tsconfig.json`
- [ ] `package.json` (see Step 4 below)

### Step 4: Update package.json for Mock Services Repo
Replace `package.json` with:
```json
{
  "name": "e2e-mock-services",
  "version": "1.0.0",
  "description": "Mock microservices for E2E testing",
  "scripts": {
    "start:ui": "npm start --prefix apps/frontend-ui",
    "start:api": "npm start --prefix apps/mock-api-service",
    "start:kafka": "npm start --prefix services/kafka",
    "install:all": "npm install && npm install --prefix apps/frontend-ui && npm install --prefix apps/mock-api-service && npm install --prefix services/kafka",
    "docker:up": "docker-compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker-compose -f docker/docker-compose.yml down",
    "docker:logs": "docker-compose -f docker/docker-compose.yml logs -f",
    "health": "curl http://localhost:3001/health && curl http://localhost:3003/health"
  },
  "dependencies": {}
}
```

### Step 5: Create .gitignore
```
node_modules/
.env
.DS_Store
logs/
*.log
```

### Step 6: Push to GitHub
```bash
cd ../e2e-mock-services
git add .
git commit -m "Initial commit: mock services for E2E testing"
git push -u origin main
```

---

## Phase 2: Update Test Automation Repository

### Step 1: Remove Backend Code
From current repo (`enterprise-e2e-test-platform`):
- [ ] Delete `apps/` folder (backup first if needed)
- [ ] Delete `services/` folder (backup first if needed)
- [ ] Delete `docker/docker-compose.yml` or update it

### Step 2: Verify Test Platform Remains
- [ ] ✅ `test-platform/` folder intact
- [ ] ✅ `docs/` folder intact
- [ ] ✅ `.github/workflows/` intact
- [ ] ✅ All documentation files intact

### Step 3: Update Current README
Before editing current README.md:
- [ ] Save `README.md` as backup: `README_old.md`
- [ ] Replace with content from `README_TEST_FOCUSED.md`
- [ ] Update GitHub URLs: replace `yourusername` with your actual username

### Step 4: Update package.json (This Repo)
Keep only test-related scripts. Remove:
- ❌ `npm run start:ui`
- ❌ `npm run start:api`
- ❌ `npm run start:kafka`
- ❌ `npm run install:all` (services prefix parts)

New minimal package.json:
```json
{
  "name": "enterprise-e2e-test-platform",
  "version": "1.0.0",
  "description": "Advanced QA test automation framework",
  "scripts": {
    "install:all": "npm install",
    "test": "npm run test:ui && npm run test:api && npm run test:kafka",
    "test:ui": "cd test-platform && npx playwright test tests/ui --reporter=html",
    "test:api": "cd test-platform && npx jest tests/api --coverage",
    "test:kafka": "cd test-platform && npx jest tests/kafka",
    "test:security": "cd test-platform && npx jest tests/security",
    "test:observability": "cd test-platform && npx jest tests/observability",
    "test:contracts": "cd test-platform && npx jest tests/contracts",
    "test:chaos": "cd test-platform && npx jest tests/chaos",
    "test:kubernetes": "cd test-platform && npx jest tests/kubernetes",
    "test:feature-flag": "cd test-platform && npx jest tests/feature-flag",
    "test:tracing": "cd test-platform && npx jest tests/tracing",
    "test:performance": "cd test-platform && k6 run tests/performance/load-test.js",
    "test:integration": "cd test-platform && npx jest tests/api/integration.spec.ts",
    "lint": "eslint . --ext .ts,.js",
    "lint:fix": "eslint . --ext .ts,.js --fix",
    "format": "prettier --write \"**/*.{ts,js,json,md}\"",
    "report:html": "cd test-platform && npx playwright show-report",
    "report:allure": "cd test-platform && allure generate allure-results -o allure-report --clean"
  }
}
```

### Step 5: Add Cross-Repository References

Create/Update `MOCK_SERVICES.md`:
```markdown
# Using Mock Services

This test automation framework requires mock services to run tests.

## 📦 Mock Services Repository

Mock services are maintained separately:
👉 [e2e-mock-services](https://github.com/yourusername/e2e-mock-services)

## 🚀 Two-Repo Setup

### Option 1: Full Testing (Recommended)

1. Clone both repositories:
```bash
git clone https://github.com/yourusername/enterprise-e2e-test-platform
git clone https://github.com/yourusername/e2e-mock-services
```

2. Start mock services in one terminal:
```bash
cd ../e2e-mock-services
docker-compose up -d
# Or: npm run docker:up
```

3. Run tests in another terminal:
```bash
cd ../enterprise-e2e-test-platform
npm install
npm test
```

### Option 2: Code Review Only

If you want to review **just the test automation code** without running tests:
- Explore `test-platform/` folder
- Check `test-platform/pages/` for Page Object Model
- Review `test-platform/schemas/` for contract testing
- See `test-platform/utils/` for advanced helpers
```

### Step 6: Update .env.example (Remove Service Configs)
Keep only test/client configs:
```bash
# Test Environment
TEST_ENV=local

# Service URLs (pointing to separate repo services)
UI_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001
KAFKA_URL=http://localhost:3003

# Test Configuration
API_TIMEOUT=30000
RETRY_COUNT=3
RETRY_DELAY=1000
PARALLEL_TEST_WORKERS=4
LOG_LEVEL=info

# Observability
GRAFANA_URL=http://localhost:3000
PROMETHEUS_URL=http://localhost:9090
```

### Step 7: Update .gitignore
```
node_modules/
test-platform/node_modules/
.env
.DS_Store
logs/
screenshots/
reports/
test-platform/playwright-report/
test-platform/allure-results/
test-platform/allure-report/
```

### Step 8: Commit Changes
```bash
git add .
git commit -m "refactor: separate test automation from mock services

- Removed apps/ and services/ (now in e2e-mock-services repo)
- Updated README to focus on test automation framework
- Cleaned up package.json (test scripts only)
- Updated documentation to reference separate repos"

git push origin main
```

---

## Phase 3: Update Documentation

### Step 1: Update INDEX.md
- [ ] Add note about repository separation
- [ ] Link to mock services repo
- [ ] Update setup instructions (reference both repos)

### Step 2: Update QUICK_REFERENCE.md
- [ ] Remove services startup commands
- [ ] Add setup instructions for both repos
- [ ] Include links to both repos

### Step 3: Delete Temporary Files (This Repo)
- [ ] Delete `README_TEST_FOCUSED.md` (merged into README.md)
- [ ] Delete `MOCK_SERVICES_README_TEMPLATE.md` (moved to other repo)
- [ ] Delete `REPO_SEPARATION_GUIDE.md` (this doc, after implementation)
- [ ] Delete `README_old.md` (backup)

### Step 4: Keep Reference Files
- [ ] Keep `MOCK_SERVICES.md` (new file explaining the separation)
- [ ] Keep `.github/copilot-instructions.md` (updated if needed)

---

## Phase 4: GitHub Configuration

### Step 1: Configure Test Repo
- [ ] Set as primary/featured repo in your GitHub profile
- [ ] Update "About" section: "Advanced QA test automation framework"
- [ ] Add topics: `testing`, `automation`, `sdet`, `playwright`, `jest`, `qa`
- [ ] Enable: Discussions, Releases, Wiki (optional)

### Step 2: Configure Mock Services Repo
- [ ] Mark as "secondary" reference repo
- [ ] Update "About": "Mock services for E2E testing"
- [ ] Add topics: `testing`, `mock-services`, `e2e`
- [ ] Pin to 🔗 link to test repo in description

### Step 3: Create Repository Links
**In test repo (README.md):**
```markdown
## 🔌 Mock Services

Tests are written against mock services in a separate repository:  
👉 [e2e-mock-services](https://github.com/yourusername/e2e-mock-services)
```

**In mock services repo (README.md):**
```markdown
## 🧪 Testing These Services

Complete test automation framework:  
👉 [enterprise-e2e-test-platform](https://github.com/yourusername/enterprise-e2e-test-platform)
```

---

## Phase 5: Verification (Final Checks)

### Test Repo Checklist
- [ ] Primary README focuses 100% on testing
- [ ] `test-platform/` folder is comprehensive
- [ ] Package.json has NO `start:ui`, `start:api`, `start:kafka` scripts
- [ ] `apps/` and `services/` folders are GONE
- [ ] GitHub profile shows this as primary repo
- [ ] Documentation mentions mock services repo
- [ ] All links point to correct GitHub repos

### Mock Services Repo Checklist
- [ ] README explains it's a supporting repo
- [ ] Contains `apps/` and `services/` folders only
- [ ] Service startup scripts work independently
- [ ] Docker compose runs all services
- [ ] Health check endpoints respond
- [ ] Link to test repo is clear and accessible

### Cross-Repo Verification
- [ ] Both repos are publicly visible
- [ ] Links between repos work correctly
- [ ] Mock services start: `docker-compose up -d`
- [ ] Tests run: `npm test`
- [ ] CI/CD pipeline still works
- [ ] README files render properly on GitHub

---

## 🎉 Success Criteria

When complete, a recruiter visiting your profile will see:

```
✅ "enterprise-e2e-test-platform" (Primary)
   ↳ Advanced testing framework, 65+ test scenarios
   ↳ Shows deep QA/SDET expertise
   ↳ Professional, focused, well-organized

📦 "e2e-mock-services" (Reference)
   ↳ Supporting services for testing
   ↳ Shows full-stack understanding
   ↳ Clear separation of concerns
```

**Impression:** "This person is a serious SDET/QA engineer who knows best practices."

---

## 📋 Quick Reference: What Goes Where

| Item | Test Repo | Mock Repo |
|------|-----------|----------|
| `test-platform/` | ✅ | ❌ |
| `apps/` | ❌ | ✅ |
| `services/` | ❌ | ✅ |
| `docs/` | ✅ | ❌ |
| `.github/workflows/` | ✅ | ❌ |
| Test documentation | ✅ | ❌ |
| Service READMEs | ❌ | ✅ |
| `docker-compose.yml` | ❌ | ✅ |
| Terraform files | ✅ | ❌ |

---

## ⏱️ Estimated Time

- **Phase 1 (Mock Repo):** 15 minutes
- **Phase 2 (Test Repo):** 20 minutes  
- **Phase 3 (Documentation):** 10 minutes
- **Phase 4 (GitHub):** 10 minutes
- **Phase 5 (Verification):** 10 minutes

**Total: ~1.5 hours for complete separation**

---

## 🆘 If You Get Stuck

1. **Verify `.gitignore`** – Did you ignore node_modules?
2. **Check package.json** – Do scripts still reference the folders?
3. **Test mock services** – Can you run `docker-compose up`?
4. **Run one test** – Try `npm run test:api` to verify setup
5. **Check links** – Do GitHub links point to correct repos?

---

**Next Action:** Start with Phase 1 and work through systematically! 🚀
