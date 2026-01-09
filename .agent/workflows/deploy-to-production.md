---
description: Deploy code changes to production
---

# Production Deployment Workflow

**ZERO-SKIP ENFORCEMENT - ALL STEPS MANDATORY**

## Pre-Deployment Checklist

Before committing ANY code:

- [ ] Local build passes
- [ ] All modified files reviewed
- [ ] No console.log() or debugger statements
- [ ] No commented-out code blocks
- [ ] Environment variables documented (if new ones added)

---

## Step 1: Local Build Verification

// turbo
```bash
pnpm run build
```

**CHECKPOINT:** Build must complete with exit code 0

Expected output (at end):
```
✓ Generating static pages using 3 workers (N/N)
  Finalizing page optimization ...
Exit code: 0
```

**If build fails:**
- ❌ STOP immediately
- ❌ Fix errors before proceeding
- ❌ Re-run build until it passes

---

## Step 2: Review Changes

```bash
git status
git diff
```

**CHECKPOINT:** Review every changed file

Ask yourself:
- Are all changes intentional?
- Any debug code left in?
- Any sensitive data exposed?
- Are there unrelated changes that should be separate commits?

---

## Step 3: Stage Changes

```bash
git add [specific files]
```

**⚠️ WARNING:** Do NOT use `git add .` or `git add -A` without reviewing

**CHECKPOINT:** Verify only intended files staged
```bash
git status
```

---

## Step 4: Commit with Descriptive Message

```bash
git commit -m "type: description of what changed"
```

**Commit message format:**
```
feat: add pagination to category pages
fix: correct schema field validation
chore: update dependencies
docs: add deployment protocol
```

**CHECKPOINT:** Commit created successfully

---

## Step 5: Push to GitHub

```bash
git push origin main
```

**CHECKPOINT:** Push confirmed

Expected output:
```
To github.com:username/repo.git
   [hash]..[hash]  main -> main
```

---

## Step 6: Verify Vercel Deployment Triggered

**WAIT 30 SECONDS** then check:

// turbo
```bash
pnpm vercel ls | head -10
```

**CHECKPOINT:** New deployment must appear with status "Building"

Expected output:
```
Age     Deployment                            Status
30s     https://[project]-[hash].vercel.app   ● Building
```

**If deployment not triggered:**
- ❌ STOP - Check Vercel GitHub integration
- ❌ Check .vercel/project.json exists
- ❌ Manual trigger may be needed

---

## Step 7: Monitor Deployment Progress

Check status every 60 seconds:

```bash
pnpm vercel ls | head -5
```

**CHECKPOINT:** Wait until status changes to "● Ready"

Typical deployment time: 2-4 minutes

**If deployment fails:**
- ❌ Check Vercel dashboard for error logs
- ❌ Revert commit if critical issue
- ❌ DO NOT deploy more code until issue resolved

---

## Step 8: Verify Live Site

**MANDATORY LIVE SITE TESTING**

Visit production URL and test deployed changes:

1. **Open**: https://csuitemagazine.global
2. **Navigate**: to the page with changes
3. **Test**: the specific feature deployed
4. **Verify**: functionality works as expected
5. **Screenshot**: take proof of working feature

**CHECKPOINT:** Feature works on live site (screenshot required)

### Common verification points:
- New components render correctly
- Navigation works
- No console errors in browser DevTools
- Mobile responsive (if UI changes)
- All links functional

---

## Step 9: Smoke Test Critical Paths

Even if your change was minor, verify critical site functions:

- [ ] Homepage loads
- [ ] Category pages load
- [ ] Article pages load and display correctly
- [ ] Navigation menu works
- [ ] Search functions (if applicable)

**Any failure = rollback immediately**

---

## Step 10: Document Deployment

Update deployment log:

```bash
echo "$(date): Deployed [feature-name] - Vercel build [build-id]" >> .agent/deployment-log.txt
```

**CHECKPOINT:** Log entry created

---

## Post-Deployment Verification Checklist

- [ ] GitHub push confirmed
- [ ] Vercel deployment triggered
- [ ] Deployment status: Ready
- [ ] Live site tested (screenshot taken)
- [ ] Critical paths smoke tested
- [ ] No errors in browser console
- [ ] Deployment logged

**ALL checkboxes must be checked before claiming deployment success.**

---

## Emergency Rollback

If critical issue discovered after deployment:

```bash
git revert HEAD
git push origin main
```

**CHECKPOINT:** Revert deployment triggered, confirm in Vercel

---

## Completion Criteria

Deployment is ONLY complete when:

1. ✅ Code pushed to GitHub
2. ✅ Vercel deployment status "Ready"
3. ✅ Feature verified working on live site
4. ✅ Screenshot proof captured
5. ✅ No critical errors detected

**Missing ANY criterion = deployment NOT complete**
