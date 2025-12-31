# Production Deployment Checklist

**STOP! Read this before deploying ANYTHING to production.**

---

## ⚠️ Critical Reminder

This is a **LIVE, REVENUE-GENERATING** site worth thousands of dollars.

A broken deployment can:
- Lose traffic and revenue
- Damage client relationships
- Hurt SEO rankings
- Waste hours fixing issues

**ALWAYS follow this checklist. No exceptions.**

---

## Pre-Deployment Checklist

### ☐ 1. Test Locally
```bash
vercel env pull .env.local
pnpm dev
# Manually test your changes at http://localhost:3000
```

### ☐ 2. Create Feature Branch
```bash
git checkout -b fix/description-of-fix
git add .
git commit -m "fix: description"
git push origin fix/description-of-fix
```

### ☐ 3. Deploy to Preview
```bash
vercel
# Save the preview URL: https://ceo-magazine-xyz.vercel.app
```

### ☐ 4. Verify Preview Deployment

**Visit preview URL and check:**
- [ ] The specific fix/feature works
- [ ] No console errors (F12 > Console tab)
- [ ] No broken images or links
- [ ] Page loads in <3 seconds
- [ ] Mobile responsive (test on phone)

**For environment variable changes:**
```bash
vercel env pull .env.preview
cat .env.preview | grep VAR_NAME | od -c
# Verify no trailing \n or spaces
```

**For Google Analytics changes:**
- [ ] View page source
- [ ] Search for "googletagmanager.com/gtag/js"
- [ ] Verify measurement ID appears correctly

### ☐ 5. Create Pull Request
- Create PR on GitHub from feature branch to main
- Wait for automated checks to pass
- Review code changes one more time

### ☐ 6. Merge to Main
```bash
git checkout main
git merge fix/description-of-fix
git push origin main
```
This triggers production deployment automatically.

---

## Post-Deployment Verification (MANDATORY)

### ☐ 1. Wait for Deployment (5 minutes)
Check Vercel dashboard for green checkmark.

### ☐ 2. Run Automated Smoke Tests
```bash
./scripts/verify-production.sh
```

Expected output: `✅ ALL TESTS PASSED`

If any tests fail: **ROLLBACK IMMEDIATELY**
```bash
vercel rollback
```

### ☐ 3. Manual Verification
Visit https://csuitemagazine.global and verify:
- [ ] Homepage loads correctly
- [ ] At least one article page works
- [ ] Search functionality works
- [ ] No console errors in DevTools
- [ ] Your specific fix/feature works in production

### ☐ 4. Monitor for 15 Minutes
- Keep Vercel dashboard open
- Watch for error rate spikes
- Check real-time logs for issues

---

## Environment Variable Changes - Special Process

### ☐ 1. Set in Preview First
```bash
# Use -n flag to prevent trailing newline!
echo -n "VALUE" | vercel env add VAR_NAME preview
```

### ☐ 2. Verify No Hidden Characters
```bash
vercel env pull .env.verify
cat .env.verify | grep VAR_NAME | od -c

# Good: ends with " \n (newline OUTSIDE quotes)
# Bad: ends with \ n " \n (newline INSIDE quotes)
```

### ☐ 3. Test in Preview
```bash
vercel  # Deploy to preview
# Visit preview URL and verify env var works
```

### ☐ 4. Set in Production
```bash
echo -n "VALUE" | vercel env add VAR_NAME production
vercel env pull .env.prod-verify
cat .env.prod-verify | grep VAR_NAME | od -c
```

### ☐ 5. Trigger Rebuild
```bash
git commit --allow-empty -m "rebuild: apply env var change"
git push origin main
```

### ☐ 6. Verify in Production
Wait 5 minutes, then check live site.

---

## If Something Breaks

### Immediate Action (Do This First)
```bash
vercel rollback
```

### Verify Rollback Worked
```bash
./scripts/verify-production.sh
```

### Investigate
```bash
# Check recent commits
git log -5 --oneline

# Check Vercel logs
vercel logs

# Check what changed
git diff HEAD~1 HEAD
```

### Fix Properly
1. Create new feature branch
2. Fix the issue
3. Test in preview
4. Deploy to production
5. Verify again

---

## Quick Command Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Rollback production
vercel rollback

# Check environment variables
vercel env ls production

# Pull environment variables
vercel env pull .env.local

# View production logs
vercel logs

# Run smoke tests
./scripts/verify-production.sh

# Create feature branch
git checkout -b fix/description

# Merge to main
git checkout main && git merge fix/description && git push
```

---

## Remember

**PREVIEW → VERIFY → PRODUCTION**

Never skip verification.

A few extra minutes of testing prevents hours of debugging.

---

## Contact for Help

If you're unsure about a deployment:
- Check DEVELOPMENT_WORKFLOW.md for detailed instructions
- Review recent successful deployments in Vercel dashboard
- When in doubt, test in preview environment first
