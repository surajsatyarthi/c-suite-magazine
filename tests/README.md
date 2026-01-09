# E2E Testing Infrastructure

## Overview
Automated E2E tests catch issues before deployment, preventing broken features from reaching production.

## Running Tests Locally

### All Tests
```bash
pnpm run test:e2e
```

### With UI (Visual Mode)
```bash
pnpm run test:e2e:ui
```

### Critical Tests Only
```bash
pnpm run test:critical
```

### Production Smoke Tests
```bash
pnpm run test:smoke
```

## What Tests Check

### Critical Revenue Tests (`category-page.spec.ts`)
- ✅ All 3 CSA articles visible
- ✅ Exactly 21 articles per page
- ✅ Pagination UI renders
- ✅ Industry juggernauts in positions 1-9
- ✅ CSAs visible on first page (positions 10-12)
- ✅ Pagination navigation works
- ✅ All CSA articles have excerpts
- ✅ No console errors

### Production Smoke Tests (`smoke.spec.ts`)
- ✅ Homepage loads
- ✅ CXO Interview category loads
- ✅ All CSA articles accessible
- ✅ All 9 juggernaut articles accessible
- ✅ Spotlight section rendering
- ✅ No 404 errors on critical paths

## CI/CD Integration

Tests run automatically on:
- Every push to `main`
- Every pull request
- Before deployment (if configured)

## Pre-Deployment Checklist

Before pushing code:
```bash
# 1. Run critical tests
pnpm run test:critical

# 2. If tests pass, build
pnpm run build

# 3. Run smoke tests (optional)
pnpm run test:smoke

# 4. Push to deploy
git push origin main
```

## Test Failures

If tests fail:
1. Check the error message in terminal
2. Run with UI to see visual failure: `pnpm run test:e2e:ui`
3. Fix the issue
4. Re-run tests before deploying

## Debugging

### View test in headed mode
```bash
pnpm run test:e2e:headed
```

### Debug specific test
```bash
npx playwright test --debug tests/e2e/category-page.spec.ts
```

### View test report
```bash
npx playwright show-report
```

## Adding New Tests

1. Create test file in `tests/e2e/`
2. Follow existing test structure
3. Run locally to verify
4. CI will automatically run on push

## Configuration

- **Config**: `playwright.config.ts`
- **Tests**: `tests/e2e/`
- **Reports**: `playwright-report/` (gitignored)
