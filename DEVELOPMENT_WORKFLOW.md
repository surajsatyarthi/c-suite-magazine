# Development Workflow & Quality Assurance Process

**Status:** MANDATORY for all changes to production
**Last Updated:** December 31, 2025
**Severity:** CRITICAL - Site is live and revenue-generating

---

## Core Principle

**NEVER deploy to production without verification in preview environment first.**

The site is worth thousands of dollars. A single faulty deployment can:
- Break revenue-generating features (featured article placements)
- Damage client trust and reputation
- Cause SEO ranking drops
- Result in lost traffic and income

---

## Mandatory Pre-Deployment Checklist

Before ANY change reaches production:

### 1. Local Testing (REQUIRED)
```bash
# Pull latest production environment variables
vercel env pull .env.local

# Verify the specific fix locally
pnpm dev

# Open browser to http://localhost:3000
# Manually verify the fix works
# For GA fix: Check browser DevTools > Network tab for gtag.js request
```

**DO NOT PROCEED** unless verified locally.

---

### 2. Preview Deployment (REQUIRED)
```bash
# Create feature branch
git checkout -b fix/description-of-fix

# Make changes
# Commit changes
git add .
git commit -m "fix: description"

# Deploy to preview environment (NOT production)
vercel

# Vercel will return a preview URL like:
# https://ceo-magazine-abc123.vercel.app
```

**WAIT for preview deployment to complete.**

---

### 3. Preview Verification (REQUIRED)

Visit the preview URL and verify:

**For Environment Variable Fixes:**
```bash
# Pull the environment variables to verify
vercel env pull .env.preview

# Check for issues like trailing newlines
cat .env.preview | grep VARIABLE_NAME | od -c

# Expected: Clean value without \n
# Bad: Value ends with \ n
```

**For GA/Analytics Fixes:**
- Open preview URL in incognito browser
- Open DevTools > Network tab
- Filter for "gtag" or "analytics"
- Verify request to `https://www.googletagmanager.com/gtag/js?id=G-P58LP0EZLL` loads
- Check response is 200 OK
- View page source and search for measurement ID
- Use Google Tag Assistant Chrome extension to verify

**For API Fixes:**
- Test the API endpoint directly: `curl https://preview-url.vercel.app/api/endpoint`
- Check logs in Vercel dashboard for errors
- Verify error handling works by sending bad requests

**For UI/Component Fixes:**
- Test on mobile device (responsive)
- Test keyboard navigation (accessibility)
- Test with JavaScript disabled (progressive enhancement)
- Check Lighthouse score hasn't degraded

---

### 4. Staging Environment Variables (NEW - TO BE CREATED)

**Problem:** Currently only have production/preview/development environments.
**Solution:** Create dedicated "staging" environment that mirrors production exactly.

```bash
# Copy all production env vars to staging
vercel env ls production > prod-vars.txt

# For each variable, add to staging:
echo -n "VALUE" | vercel env add VAR_NAME staging
```

**Staging environment must:**
- Use same database (Sanity production dataset) but with read-only access
- Use same Vercel configuration
- Use same build settings
- Mirror production exactly except for domain

---

### 5. Automated Testing (TO BE IMPLEMENTED)

Create test suite to prevent regression:

```bash
# Install testing dependencies
pnpm add -D playwright @playwright/test

# Create tests/e2e/critical-paths.spec.ts
```

**Critical path tests:**
1. Homepage loads successfully
2. Article pages load and display content
3. Google Analytics tag loads on every page
4. Search functionality returns results
5. RSS feed generates valid XML
6. API endpoints return expected responses

**Run before every deployment:**
```bash
pnpm test:e2e
```

**DO NOT MERGE** if tests fail.

---

### 6. Production Deployment Process

**ONLY after preview verification passes:**

```bash
# Merge to main branch (triggers production deployment)
git checkout main
git merge fix/description-of-fix
git push origin main

# OR use vercel --prod (direct production deployment)
vercel --prod
```

**IMMEDIATELY after deployment:**

1. **Verify deployment succeeded:**
   - Check Vercel dashboard for green checkmark
   - Check build logs for errors
   - Visit https://csuitemagazine.global

2. **Smoke test critical paths:**
   - Homepage loads
   - One article page loads
   - Check browser DevTools for console errors
   - Verify GA tag loaded (if that was the fix)

3. **Monitor for 15 minutes:**
   - Check Vercel analytics for error rate spike
   - Check Sentry/error logging (if configured)
   - Keep browser open to Vercel dashboard

4. **Rollback if issues detected:**
   ```bash
   # Instantly rollback to previous deployment
   vercel rollback
   ```

---

## Environment Variable Changes - Special Process

Environment variables are ESPECIALLY risky because:
- They're baked into the build at deploy time
- You can't verify them without rebuilding
- Trailing characters (newlines, spaces) break functionality silently

**MANDATORY steps for env var changes:**

### 1. Before Setting Variable
```bash
# Use -n flag to prevent trailing newline
echo -n "VALUE" | vercel env add VAR_NAME preview

# VERIFY immediately:
vercel env pull .env.verify
cat .env.verify | grep VAR_NAME | od -c

# Check output for hidden characters:
# Good: V A L U E "
# Bad:  V A L U E \ n "
```

### 2. Test in Preview
```bash
# Deploy to preview
vercel

# Visit preview URL
# View page source and search for the env var value
# Confirm it appears correctly (no \n, no extra quotes, etc.)
```

### 3. Only Then Set in Production
```bash
# Same command with production flag
echo -n "VALUE" | vercel env add VAR_NAME production

# VERIFY again
vercel env pull .env.prod-verify
cat .env.prod-verify | grep VAR_NAME | od -c
```

### 4. Trigger Production Rebuild
```bash
# Empty commit to trigger rebuild
git commit --allow-empty -m "rebuild: apply env var change"
git push origin main
```

### 5. Verify in Production
```bash
# Wait 5 minutes for deployment
# Visit https://csuitemagazine.global
# View source and verify env var is used correctly
```

---

## Git Branch Strategy

**Main branch = Production**
- NEVER commit directly to main without testing
- All commits to main trigger production deployment
- Requires pull request review (to be configured)

**Feature branches = Development**
- Create branch: `git checkout -b fix/issue-name`
- Test locally, deploy to preview, verify
- Only merge to main after verification

**Branch naming convention:**
- `fix/` - Bug fixes (fix/ga-trailing-newline)
- `feature/` - New features (feature/programmatic-seo)
- `refactor/` - Code refactoring (refactor/api-error-handling)
- `docs/` - Documentation only (docs/update-readme)

---

## Incident Response - What to Do When Production Breaks

### Immediate Actions (0-5 minutes)

1. **Rollback instantly:**
   ```bash
   vercel rollback
   ```

2. **Verify rollback worked:**
   - Visit https://csuitemagazine.global
   - Confirm site is functional
   - Check error rate in Vercel analytics

3. **Communicate:**
   - If clients are affected, notify them immediately
   - Document what broke in incident log

### Investigation (5-30 minutes)

1. **Check Vercel logs:**
   - Runtime logs for errors
   - Build logs for deployment issues

2. **Review recent changes:**
   ```bash
   git log -5 --oneline
   git diff HEAD~1 HEAD
   ```

3. **Identify root cause:**
   - What change caused the issue?
   - Why did preview testing not catch it?

### Prevention (30+ minutes)

1. **Fix the issue properly:**
   - Test fix in preview environment
   - Add automated test to prevent regression

2. **Update this document:**
   - Add new verification step if needed
   - Document the failure pattern

3. **Post-mortem:**
   - What went wrong?
   - Why did it reach production?
   - What process change prevents recurrence?

---

## Lessons Learned from GA Fix Failure

**Incident:** December 31, 2025 - Google Analytics trailing newline

**What went wrong:**
1. ❌ Used `echo "VALUE"` instead of `echo -n "VALUE"` (added newline)
2. ❌ Did not verify env var value after setting it
3. ❌ Did not test in preview environment before production
4. ❌ Did not check live site after deployment to verify fix worked
5. ❌ Assumed fix worked without verification

**What should have happened:**
1. ✅ Set env var in preview environment first
2. ✅ Verify env var has no trailing characters: `vercel env pull` then `od -c`
3. ✅ Deploy to preview URL
4. ✅ Visit preview URL and view source - confirm GA tag loads
5. ✅ Use Chrome DevTools Network tab - confirm gtag.js request succeeds
6. ✅ ONLY THEN set in production and redeploy
7. ✅ Verify on live site immediately after deployment

**Process improvements implemented:**
- This mandatory workflow document
- Environment variable verification process
- Preview environment testing requirement
- Production smoke testing requirement

---

## Verification Commands Reference

### Check Environment Variables
```bash
# Pull and inspect
vercel env pull .env.check
cat .env.check | grep VAR_NAME

# Check for hidden characters (newlines, spaces)
cat .env.check | grep VAR_NAME | od -c

# Good output example:
# 0000000   N   E   X   T   _   P   U   B   L   I   C   _   G   A   _   M
# 0000020   E   A   S   U   R   E   M   E   N   T   _   I   D   =   "   G
# 0000040   -   P   5   8   L   P   0   E   Z   L   L   "  \n
#                                                         ^^^^ This newline is OUTSIDE quotes - OK

# Bad output example:
# 0000000   N   E   X   T   _   P   U   B   L   I   C   _   G   A   _   M
# 0000020   E   A   S   U   R   E   M   E   N   T   _   I   D   =   "   G
# 0000040   -   P   5   8   L   P   0   E   Z   L   L   \   n   "  \n
#                                                     ^^^^ This newline is INSIDE quotes - BAD
```

### Verify Google Analytics Tag Loads
```bash
# Using curl (check for gtag in HTML)
curl -s https://csuitemagazine.global | grep -o 'googletagmanager.com/gtag/js[^"]*'

# Expected output:
# googletagmanager.com/gtag/js?id=G-P58LP0EZLL

# No output = GA tag not loading = BROKEN
```

### Test API Endpoints
```bash
# Search API
curl -s "https://csuitemagazine.global/api/search?q=ceo" | jq

# Should return JSON with results array
# If returns error or empty, API is broken

# RSS Feed
curl -s "https://csuitemagazine.global/rss.xml" | head -20

# Should return valid XML starting with <?xml version="1.0"?>
# If returns error HTML, feed is broken
```

### Check Build Logs
```bash
# Get latest deployment
vercel ls

# View logs for specific deployment
vercel logs [deployment-url]
```

### Rollback to Previous Version
```bash
# Instant rollback (no confirmation)
vercel rollback

# Rollback to specific deployment
vercel rollback [deployment-url]
```

---

## Code Review Checklist

Before merging any PR to main:

- [ ] Code changes reviewed for logic errors
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables use `NEXT_PUBLIC_` prefix if needed client-side
- [ ] Error handling added for all external API calls
- [ ] Console.log statements removed (use proper logging)
- [ ] TypeScript types are correct (no `any` without justification)
- [ ] Accessibility: Semantic HTML, ARIA labels, keyboard navigation
- [ ] SEO: Meta tags, structured data not broken
- [ ] Performance: No unnecessary re-renders, lazy loading where appropriate
- [ ] Preview deployment verified working
- [ ] Tests added/updated for changed functionality
- [ ] Documentation updated if behavior changed

---

## Automated Checks to Implement (Future)

### GitHub Actions CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test:e2e

      # Block merge if tests fail
      - name: Check test results
        if: failure()
        run: exit 1

  preview-deploy:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      - run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}

      # Smoke test preview deployment
      - name: Smoke test preview
        run: |
          curl -f ${{ steps.deploy.outputs.url }} || exit 1
          curl -f ${{ steps.deploy.outputs.url }}/api/search?q=test || exit 1

  production-deploy:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: test
    steps:
      - uses: actions/checkout@v3
      - run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}

      # Smoke test production after deployment
      - name: Smoke test production
        run: |
          sleep 30 # Wait for deployment to propagate
          curl -f https://csuitemagazine.global || exit 1
          curl -f https://csuitemagazine.global/api/search?q=test || exit 1

          # Verify GA tag loads
          curl -s https://csuitemagazine.global | grep -q 'googletagmanager.com/gtag/js' || exit 1
```

### Pre-commit Hooks

```bash
# Install husky for git hooks
pnpm add -D husky lint-staged

# .husky/pre-commit
#!/bin/sh
pnpm lint-staged

# package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### Branch Protection Rules (GitHub Settings)

Navigate to: Repository Settings > Branches > Add rule

**Protect main branch:**
- ✅ Require pull request reviews before merging (1 reviewer minimum)
- ✅ Require status checks to pass before merging
  - CI/CD Pipeline
  - Vercel Preview Deployment
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

**Result:** No direct commits to main, all changes require PR + tests passing

---

## Monitoring & Alerts (To Be Implemented)

### Vercel Integration Monitoring

**Set up Slack notifications:**
1. Vercel Dashboard > Project Settings > Integrations
2. Add Slack integration
3. Configure alerts for:
   - ❌ Deployment failures
   - ❌ Runtime errors (>10 errors/minute)
   - ⚠️ Slow response times (>3s p95)
   - ✅ Successful deployments

### Error Tracking with Sentry

```bash
pnpm add @sentry/nextjs

# sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV || 'development'
})
```

**Alert on:**
- New error types (never seen before)
- Error rate spike (>50 errors in 5 minutes)
- Critical user paths failing (article page loads, search, etc.)

### Uptime Monitoring

**Use UptimeRobot or similar:**
- Monitor: https://csuitemagazine.global (every 5 minutes)
- Monitor: https://csuitemagazine.global/api/search?q=test
- Monitor: https://csuitemagazine.global/rss.xml
- Alert via: Email, Slack, SMS if down >5 minutes

---

## Sign-off Required

**All developers/contractors working on this codebase must:**

1. Read this document thoroughly
2. Acknowledge understanding of production safety requirements
3. Follow preview → verify → production workflow for ALL changes
4. Never deploy to production without verification

**Signature:**
- Name: _________________
- Date: _________________
- I understand that this is a live, revenue-generating production site and will follow all safety protocols.

---

## Summary: The Golden Rule

**PREVIEW → VERIFY → PRODUCTION**

Never skip the verification step. Ever.

A few extra minutes of testing prevents hours of debugging and potential revenue loss.

**When in doubt:**
1. Test locally first
2. Deploy to preview
3. Verify thoroughly
4. Only then deploy to production
5. Verify again in production immediately

This is not optional. This is mandatory for a production site worth thousands of dollars.
