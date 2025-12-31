# Production Deployment - Fix 404 Issue

## Problem
The Tim Cook page shows 404 in production even though:
- ✅ Code is committed and deployed
- ✅ Database has Tim Cook's data
- ✅ Works perfectly on localhost

## Root Cause
**Vercel production environment doesn't have the Neon database environment variables configured.**

The Neon integration should have auto-added them, but we need to verify.

---

## Fix: Add Neon Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Click on **ceo-magazine** project (or your project name)
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar

### Step 2: Check if These Variables Exist

Look for these variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**If they exist:**
- ✅ Make sure they're enabled for **Production**, **Preview**, and **Development**
- ✅ Check the values match your Neon credentials

**If they DON'T exist:**
- You need to add them manually (see Step 3)

### Step 3: Add Missing Environment Variables

Click **Add New** and add each variable:

#### Variable 1: POSTGRES_URL
```
Key: POSTGRES_URL
Value: postgresql://neondb_owner:npg_z7TghmwI6oyV@ep-polished-sound-a4yq82lt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

Environments: ☑ Production ☑ Preview ☑ Development
```

#### Variable 2: POSTGRES_PRISMA_URL
```
Key: POSTGRES_PRISMA_URL
Value: postgresql://neondb_owner:npg_z7TghmwI6oyV@ep-polished-sound-a4yq82lt-pooler.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require

Environments: ☑ Production ☑ Preview ☑ Development
```

#### Variable 3: POSTGRES_URL_NON_POOLING
```
Key: POSTGRES_URL_NON_POOLING
Value: postgresql://neondb_owner:npg_z7TghmwI6oyV@ep-polished-sound-a4yq82lt.us-east-1.aws.neon.tech/neondb?sslmode=require

Environments: ☑ Production ☑ Preview ☑ Development
```

#### Variable 4: POSTGRES_USER
```
Key: POSTGRES_USER
Value: neondb_owner

Environments: ☑ Production ☑ Preview ☑ Development
```

#### Variable 5: POSTGRES_HOST
```
Key: POSTGRES_HOST
Value: ep-polished-sound-a4yq82lt-pooler.us-east-1.aws.neon.tech

Environments: ☑ Production ☑ Preview ☑ Development
```

#### Variable 6: POSTGRES_PASSWORD
```
Key: POSTGRES_PASSWORD
Value: npg_z7TghmwI6oyV

Environments: ☑ Production ☑ Preview ☑ Development
```

#### Variable 7: POSTGRES_DATABASE
```
Key: POSTGRES_DATABASE
Value: neondb

Environments: ☑ Production ☑ Preview ☑ Development
```

### Step 4: Redeploy

After adding the environment variables:

**Option A: Redeploy from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** → NO
5. Click **Redeploy**

**Option B: Trigger from Git**
```bash
cd /Users/surajsatyarthi/Desktop/Magazine/ceo-magazine

git commit --allow-empty -m "Trigger rebuild after adding env vars"
git push
```

### Step 5: Verify (After ~3 minutes)

1. Visit: https://csuitemagazine.global/api/test-supabase
   - Should show: `"success": true`

2. Visit: https://csuitemagazine.global/executives/tim-cook
   - Should show: Tim Cook's salary page with $63M compensation

---

## Alternative: Use Neon Integration (Recommended)

If manually adding env vars doesn't work, connect Neon properly:

### Step 1: Add Neon Integration
1. Go to: https://vercel.com/integrations/neon
2. Click **Add Integration**
3. Select your **ceo-magazine** project
4. Authorize Neon access

### Step 2: Link Database
1. After integration is added, go to project Settings
2. Click **Integrations** → Neon
3. Select your Neon database: `ep-polished-sound-a4yq82lt`
4. This will auto-add all environment variables

### Step 3: Redeploy
The integration should trigger auto-deployment, but if not:
```bash
git commit --allow-empty -m "Reconnect Neon integration"
git push
```

---

## Verification Checklist

After redeployment completes:

- [ ] API test endpoint works: https://csuitemagazine.global/api/test-supabase
- [ ] Tim Cook page loads: https://csuitemagazine.global/executives/tim-cook
- [ ] Page shows correct title: "Tim Cook Salary: $63,021,951 (2023)"
- [ ] Page shows compensation breakdown
- [ ] Page shows 5-year history table

---

## Expected Result

Once environment variables are configured and redeployed, you'll see:

**URL**: https://csuitemagazine.global/executives/tim-cook

**Page Content**:
- Hero: Tim Cook, CEO at Apple Inc. (AAPL)
- Total Compensation: $63,021,951 (2023)
- YoY Change: ↓ -36.6% from 2022
- Breakdown: Base salary, stock awards, bonuses
- 5-year history table
- SEC filing link

---

## Next Steps After Fix

Once the Tim Cook page is live:

1. ✅ **Verify in browser** - Check all sections render correctly
2. 📋 **Collect data for 9 more executives** (see PHASE1_10_PAGES_TEST_PLAN.md)
3. 📊 **Import remaining executives** using the import script
4. 🔍 **Submit to Google Search Console** for indexing
5. 📈 **Monitor for 30 days** before scaling to 50-100 pages

**Target Timeline**:
- Today: Fix production deployment
- This week: Complete 10-page import
- Next week: Submit to Google, start monitoring
- Week 4: Review results, decide on scaling
