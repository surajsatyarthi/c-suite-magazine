# Vercel Postgres Setup - Final Instructions

All code has been updated to use Vercel Postgres. Follow these steps to complete the setup.

---

## Step 1: Create Vercel Postgres Database (3 minutes)

1. Go to: https://vercel.com/dashboard
2. Click on your **ceo-magazine** project
3. Click **Storage** tab (top navigation)
4. Click **Create Database**
5. Select **Postgres**
6. Configure:
   - **Database Name**: `csuite-executives`
   - **Region**: `us-east-1` (same as your app)
   - **Pricing**: **Hobby** (Free - 256 MB storage)
7. Click **Create**
8. Wait ~30 seconds for provisioning

---

## Step 2: Get Environment Variables (Auto-Added!)

✅ Vercel **automatically** adds these environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**For production/preview:** Already configured ✅

**For local development:** Copy them to `.env.local`

### Get Local Environment Variables:

1. In the database page, click **.env.local** tab
2. Click **Show secret** and copy everything
3. Create `.env.local` in project root
4. Paste the copied content
5. Also add these existing variables:

```bash
# Vercel Postgres variables (pasted from dashboard)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
... (rest of Vercel Postgres vars)

# Sanity CMS (copy from .env.example)
NEXT_PUBLIC_SANITY_PROJECT_ID=demo
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
```

---

## Step 3: Run Database Schema Migration (2 minutes)

1. In Vercel Dashboard, stay on the database page
2. Click **Query** tab
3. Open [db/schema.sql](db/schema.sql) in your code editor
4. Copy **ALL** contents (Cmd+A, Cmd+C)
5. Paste into Vercel Query editor (Cmd+V)
6. Click **Execute** (or Run Query)
7. Should see: **"Success. CREATE TABLE"** messages

**Verify tables created:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

Should show:
- `companies`
- `executives`
- `compensation`

---

## Step 4: Test Connection Locally (1 minute)

```bash
# Start dev server
pnpm dev
```

Visit: http://localhost:3000/api/test-supabase

**Expected response:**
```json
{
  "success": true,
  "message": "Vercel Postgres connection successful",
  "database": "Vercel Postgres",
  "tables": {
    "executives": { "count": 0, "sample": [] },
    "companies": { "count": 0, "sample": [] },
    "compensation": { "count": 0, "sample": [] }
  },
  "connectionPooling": "PgBouncer enabled"
}
```

If you see `"success": true` → Database connection works! ✅

---

## Step 5: Import Sample Data (2 minutes)

### Option A: Using Import Script

1. Edit [scripts/data-import/import-executives.ts](scripts/data-import/import-executives.ts)
2. The Tim Cook example is already there
3. Run the import:

```bash
npx tsx scripts/data-import/import-executives.ts
```

**Expected output:**
```
🚀 Starting executive data import...

📊 Processing: Tim Cook (Apple Inc.)
   ✅ Company created: Apple Inc.
   ✅ Executive created: Tim Cook
   ✅ Compensation added: 2023 ($63.0M)
   ✅ Compensation added: 2022 ($99.4M)

═══════════════════════════════════════════════
📈 Import Summary:
═══════════════════════════════════════════════
✅ Companies created:         1
✅ Executives created:        1
✅ Compensation records:      2
❌ Errors encountered:        0
═══════════════════════════════════════════════
```

### Option B: Manual SQL Insert (via Vercel Dashboard)

1. Go to Vercel Dashboard > Database > Query tab
2. Run these queries one by one:

**Insert Company:**
```sql
INSERT INTO companies (name, ticker_symbol, industry, sector, market_cap, founded_year, headquarters)
VALUES ('Apple Inc.', 'AAPL', 'Technology', 'Information Technology', 2800000000000, 1976, 'Cupertino, California')
RETURNING id;
```

Copy the returned `id` (looks like: `123e4567-e89b-12d3-a456-426614174000`)

**Insert Executive:** (replace `YOUR_COMPANY_ID` with the ID from above)
```sql
INSERT INTO executives (full_name, slug, current_title, company_id, wikidata_id)
VALUES ('Tim Cook', 'tim-cook', 'Chief Executive Officer', 'YOUR_COMPANY_ID', 'Q312129')
RETURNING id;
```

Copy the executive `id`

**Insert Compensation:** (replace IDs)
```sql
INSERT INTO compensation (
  executive_id, company_id, fiscal_year,
  base_salary, bonus, stock_awards, option_awards,
  non_equity_incentive, all_other_compensation, total_compensation,
  source_url, filing_date
)
VALUES (
  'YOUR_EXECUTIVE_ID',
  'YOUR_COMPANY_ID',
  2023,
  3000000, 0, 47260340, 0,
  10715000, 46611, 63021951,
  'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
  '2024-01-11'
);
```

---

## Step 6: Test Executive Page (1 minute)

```bash
# Dev server should still be running
pnpm dev
```

Visit: http://localhost:3000/executives/tim-cook

**You should see:**
- Tim Cook's name and title
- Total compensation: $63,021,951
- Compensation breakdown (salary, stock, bonus)
- 5-year history table (if you added multiple years)
- Company info: Apple Inc. (AAPL)

---

## Step 7: Deploy to Production (1 minute)

```bash
git add .
git commit -m "Add Vercel Postgres for programmatic SEO executive pages

- Migrate from Supabase to Vercel Postgres
- Add database client (lib/db.ts)
- Update executive page template
- Update import scripts
- Configure connection pooling with PgBouncer

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

**What happens:**
- Vercel builds your app
- Database environment variables already configured ✅
- Executive pages will work in production
- ISR will cache pages for 24 hours

---

## Verify Production Deployment

After deployment finishes (~2 minutes):

1. Visit: https://csuitemagazine.global/api/test-supabase
   - Should show: `"success": true`

2. Visit: https://csuitemagazine.global/executives/tim-cook
   - Should show Tim Cook's compensation page

---

## Troubleshooting

### "Failed to connect to Vercel Postgres"

**Cause:** Environment variables not set

**Solution:**
- Check `.env.local` has all `POSTGRES_*` variables
- Restart dev server: `pnpm dev`
- In production: Verify variables in Vercel Dashboard > Settings > Environment Variables

---

### "relation 'executives' does not exist"

**Cause:** Schema migration didn't run

**Solution:**
- Go to Vercel Dashboard > Database > Query tab
- Re-run [db/schema.sql](db/schema.sql)
- Verify with: `SELECT * FROM executives LIMIT 1;`

---

### Page shows 404 for /executives/tim-cook

**Cause:** No data in database

**Solution:**
- Run import script: `npx tsx scripts/data-import/import-executives.ts`
- OR manually insert data via Vercel Query tab
- Verify: `SELECT * FROM executives WHERE slug='tim-cook';`

---

## Summary

✅ All code updated for Vercel Postgres
✅ Connection pooling configured (PgBouncer)
✅ Test API route ready
✅ Import scripts ready
✅ Executive page template ready

**What you did:**
1. Created Vercel Postgres database (free tier)
2. Ran schema migration (created tables)
3. Added environment variables to `.env.local`
4. Imported sample data (Tim Cook)
5. Tested locally
6. Deployed to production

**Next steps:**
- Add more executives using the import script
- Week 2: Collect 50 Fortune 500 executives from SEC filings
- Monitor free tier limits (256 MB storage, 60 compute hours)

---

## Files Changed

- ✅ [lib/db.ts](lib/db.ts) - New Vercel Postgres client (replaces lib/supabase.ts)
- ✅ [app/executives/[slug]/page.tsx](app/executives/[slug]/page.tsx) - Updated to use new client
- ✅ [app/api/test-supabase/route.ts](app/api/test-supabase/route.ts) - Updated for Vercel Postgres
- ✅ [scripts/data-import/import-executives.ts](scripts/data-import/import-executives.ts) - Updated for Vercel Postgres
- ✅ [.env.example](.env.example) - Updated with Postgres variables
- ✅ [package.json](package.json) - Added @vercel/postgres@0.10.0

**No changes to existing site** - All new functionality is isolated to `/executives/*` routes.
