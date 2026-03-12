# Setup Verification

This repository is dedicated solely to the **test automation framework**. Use this checklist to confirm the workspace is clean and focused.

## ✅ Essentials

- [x] `test-platform/` directory present with all tests, pages, utils, and configs
- [x] `package.json` includes only testing-related npm scripts
- [x] `README.md` and documentation concentrate on testing, with no service code
- [x] `setup.sh` and `setup.ps1` install dependencies and prepare test directories
- [x] Quick reference (`QUICK_REFERENCE.md`) contains test commands only
- [x] No `apps/`, `services/`, `docker/`, `infrastructure/`, or `k8s/` folders remain

## 🛠 Useful Commands

```bash
npm install        # install test dependencies
npm test           # run full test suite
npm run report:html  # open Playwright report
npm run docs       # show documentation list
``` 

## 📁 Directory Health

```bash
ls -1
# should show:
# README.md
# QUICK_REFERENCE.md
# SETUP_VERIFICATION.md
# test-platform/
# ... other test-related files
```

If any non-test artefacts are listed, they should be removed to keep the repo focused on automation efforts.
