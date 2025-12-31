# Quick Supabase Setup - 5 Minutes ⚡

This is the fastest way to get Supabase running. No CLI needed.

## Step 1: Create Supabase Project (2 minutes)

1. **Go to:** https://app.supabase.com/sign-up
2. **Sign up** with GitHub (fastest) or email
3. Click **"New Project"**
4. Fill in:
   - **Organization**: Create new or select existing
   - **Name**: `csuite-magazine-prod`
   - **Database Password**: Click "Generate password" and SAVE IT
   - **Region**: `US East (North Virginia)`
   - **Pricing**: Free (sufficient for MVP)
5. Click **"Create new project"**
6. Wait ~2 minutes for provisioning

## Step 2: Run Schema Migration (1 minute)

1. Once project is ready, click **"SQL Editor"** in left sidebar
2. Click **"+ New query"**
3. Open this file: `db/schema.sql`
4. Copy ALL contents (Cmd+A, Cmd+C)
5. Paste into SQL editor (Cmd+V)
6. Click **"Run"** button (bottom right)
7. Should see: "Success. No rows returned"

## Step 3: Get Credentials (1 minute)

1. Click **⚙️ Settings** (bottom left)
2. Click **"API"** in settings menu
3. Copy **Project URL**
   - Example: `https://abcdefghijklmnop.supabase.co`
4. Find **"service_role"** under "Project API keys"
5. Click **"Reveal"** and copy the key
   - Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 4: Create .env.local (30 seconds)

Create file `.env.local` in project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Copy these from .env.example if you need local dev
NEXT_PUBLIC_SANITY_PROJECT_ID=demo
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
```

**Replace:**
- `[YOUR-PROJECT-ID]` with your actual project URL
- `eyJhbG...` with your actual service role key

## Step 5: Add to Vercel (30 seconds)

**Option A: Using Vercel CLI**

```bash
# Production
echo -n "https://[YOUR-PROJECT-ID].supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo -n "YOUR_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Preview
echo -n "https://[YOUR-PROJECT-ID].supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo -n "YOUR_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```

**Option B: Using Vercel Dashboard**

1. Go to: https://vercel.com/[your-team]/ceo-magazine/settings/environment-variables
2. Add `NEXT_PUBLIC_SUPABASE_URL`:
   - Value: `https://[YOUR-PROJECT-ID].supabase.co`
   - Environments: ✅ Production, ✅ Preview
3. Add `SUPABASE_SERVICE_ROLE_KEY`:
   - Value: `eyJhbGci...` (your service role key)
   - Environments: ✅ Production, ✅ Preview

## Step 6: Import Sample Data (Optional - 1 minute)

Edit `scripts/data-import/import-executives.ts` to include real data, then:

```bash
npx tsx scripts/data-import/import-executives.ts
```

Or manually insert via Supabase Dashboard > Table Editor:

**Companies:**
```sql
INSERT INTO companies (name, ticker_symbol, industry, sector, market_cap, founded_year, headquarters)
VALUES ('Apple Inc.', 'AAPL', 'Technology', 'Information Technology', 2800000000000, 1976, 'Cupertino, California');
```

**Get company ID:** Click on the inserted row, copy the `id` value

**Executives:**
```sql
INSERT INTO executives (full_name, slug, current_title, company_id, wikidata_id)
VALUES ('Tim Cook', 'tim-cook', 'Chief Executive Officer', '[PASTE-COMPANY-ID-HERE]', 'Q312129');
```

**Get executive ID:** Click on the inserted row, copy the `id` value

**Compensation:**
```sql
INSERT INTO compensation (
  executive_id, company_id, fiscal_year,
  base_salary, bonus, stock_awards, option_awards,
  non_equity_incentive, all_other_compensation, total_compensation,
  source_url, filing_date
)
VALUES (
  '[PASTE-EXECUTIVE-ID]', '[PASTE-COMPANY-ID]', 2023,
  3000000, 0, 47260340, 0,
  10715000, 46611, 63021951,
  'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
  '2024-01-11'
);
```

## Step 7: Test Everything

**Test connection:**
```bash
pnpm dev
```

Then visit:
- http://localhost:3000/api/test-supabase (should show `{"success": true}`)
- http://localhost:3000/executives/tim-cook (should show Tim Cook's compensation page)

## Troubleshooting

**"Failed to fetch executive"**
- Check that schema.sql ran successfully
- Verify Row Level Security policies exist: Dashboard > Authentication > Policies

**"Invalid API key"**
- Make sure you copied the `service_role` key, not `anon` key
- Check for extra spaces when pasting

**"relation does not exist"**
- Schema migration didn't run
- Re-run db/schema.sql in SQL Editor

**Environment variables not loading**
- Restart dev server: `pnpm dev`
- Check `.env.local` is in project root (same folder as package.json)

## Summary

Total time: **~5-6 minutes**

You should now have:
- ✅ Supabase project with database tables
- ✅ Local environment configured (.env.local)
- ✅ Vercel environment variables set
- ✅ Sample data imported (optional)
- ✅ Executive pages working

**Next:** Start Week 2 data collection - add 50 Fortune 500 executives!
