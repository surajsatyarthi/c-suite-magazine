# Supabase Setup Guide - Programmatic SEO Executive Compensation

This guide walks you through setting up Supabase for the executive compensation programmatic SEO feature.

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Vercel account with csuitemagazine.global project access
- Access to this repository

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Configure the project:
   - **Name**: `csuite-magazine-prod` (or your preferred name)
   - **Database Password**: Generate a strong password (save this securely)
   - **Region**: Choose closest to your Vercel deployment region (US East recommended)
   - **Pricing Plan**: Free tier is sufficient for Phase 1 MVP (50-100 executive pages)

4. Wait for the project to provision (~2 minutes)

## Step 2: Run Database Schema Migration

1. Once the project is ready, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the entire contents of `db/schema.sql` from this repository
4. Paste into the SQL editor
5. Click "Run" to execute the migration
6. Verify success - you should see tables created:
   - `companies`
   - `executives`
   - `compensation`

**Expected Output:**
```
CREATE EXTENSION
CREATE TABLE
CREATE INDEX
CREATE TABLE
CREATE INDEX
CREATE TABLE
CREATE INDEX
CREATE FUNCTION
CREATE TRIGGER
CREATE TRIGGER
CREATE TRIGGER
ALTER TABLE
ALTER TABLE
ALTER TABLE
CREATE POLICY (multiple)
```

## Step 3: Get API Credentials

1. Click "Settings" (gear icon) in the left sidebar
2. Click "API" in the settings menu
3. Copy the following values:

   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Service Role Key** (under "Project API keys" - **Keep this secret!**)

## Step 4: Configure Environment Variables

### Local Development (.env.local)

Create `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Your service role key
```

### Vercel Production Environment

Add the same variables to Vercel:

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Add environment variables (production)
echo -n "https://[your-project-id].supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo -n "your-service-role-key-here" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Add environment variables (preview)
echo -n "https://[your-project-id].supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo -n "your-service-role-key-here" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```

**Or use the Vercel Dashboard:**
1. Go to https://vercel.com/[your-team]/ceo-magazine/settings/environment-variables
2. Add `NEXT_PUBLIC_SUPABASE_URL` - Production & Preview
3. Add `SUPABASE_SERVICE_ROLE_KEY` - Production & Preview

## Step 5: Install Supabase Client Library

```bash
pnpm add @supabase/supabase-js
```

**Note:** This should already be installed if you cloned the repository.

## Step 6: Test Connection

### Option A: Quick Test with Sample Data

1. Go to Supabase Dashboard > Table Editor
2. Manually insert test data:

**Companies Table:**
```sql
INSERT INTO companies (name, ticker_symbol, industry, sector, market_cap, founded_year, headquarters)
VALUES (
  'Apple Inc.',
  'AAPL',
  'Technology',
  'Information Technology',
  2800000000000,
  1976,
  'Cupertino, California'
);
```

**Executives Table** (use the company ID from the previous insert):
```sql
INSERT INTO executives (full_name, slug, current_title, company_id, wikidata_id)
VALUES (
  'Tim Cook',
  'tim-cook',
  'Chief Executive Officer',
  '[COMPANY_ID_FROM_ABOVE]', -- Replace with actual UUID
  'Q312129'
);
```

**Compensation Table** (use executive and company IDs):
```sql
INSERT INTO compensation (
  executive_id,
  company_id,
  fiscal_year,
  base_salary,
  bonus,
  stock_awards,
  option_awards,
  non_equity_incentive,
  all_other_compensation,
  total_compensation,
  source_url,
  filing_date
)
VALUES (
  '[EXECUTIVE_ID_FROM_ABOVE]',
  '[COMPANY_ID_FROM_ABOVE]',
  2023,
  3000000,
  0,
  47260340,
  0,
  10715000,
  46611,
  60762011,
  'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
  '2024-01-11'
);
```

### Option B: Test via Next.js Page

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Visit: http://localhost:3000/executives/tim-cook

3. Expected result:
   - Page loads without errors
   - Shows "Tim Cook" as heading
   - Displays compensation breakdown
   - Shows total compensation: $60,762,011

### Option C: Test via API Route (Quick Verify)

Create a test API route `app/api/test-supabase/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('executives')
    .select('full_name, slug')
    .limit(5)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    count: data?.length || 0,
    executives: data
  })
}
```

Visit: http://localhost:3000/api/test-supabase

Expected output:
```json
{
  "success": true,
  "count": 1,
  "executives": [
    {
      "full_name": "Tim Cook",
      "slug": "tim-cook"
    }
  ]
}
```

## Step 7: Verify Connection Pooling (Critical for Vercel)

The Supabase client in `lib/supabase.ts` is configured with connection pooling (Supavisor):

```typescript
global: {
  headers: {
    'x-connection-pooler': 'supavisor' // CRITICAL for Vercel serverless
  }
}
```

**Why this matters:**
- Vercel serverless functions create new connections on every request
- Without pooling, you'll exhaust PostgreSQL connection limits (default: 60)
- Supavisor manages connection pooling automatically

**To verify pooling is working:**
1. Go to Supabase Dashboard > Database > Connection Pooling
2. Check that "Connection Pooling" is enabled
3. Default pool size: 15 (sufficient for Phase 1)

## Troubleshooting

### Issue: "Failed to fetch executive" in console

**Cause:** Row Level Security (RLS) blocking queries

**Solution:** The schema enables public read access. Verify policies exist:
```sql
SELECT * FROM pg_policies WHERE tablename = 'executives';
```

Should show policy: "Allow public read access on executives"

### Issue: "relation 'executives' does not exist"

**Cause:** Schema migration didn't run

**Solution:** Re-run `db/schema.sql` in SQL Editor

### Issue: Connection pooling not working

**Cause:** Using direct connection instead of pooler

**Solution:** Verify `lib/supabase.ts` includes:
```typescript
global: {
  headers: {
    'x-connection-pooler': 'supavisor'
  }
}
```

### Issue: Environment variables not loading

**Cause:** .env.local not in project root or missing NEXT_PUBLIC_ prefix

**Solution:**
- Public variables need `NEXT_PUBLIC_` prefix
- Server-only variables (service role key) do NOT need prefix
- Restart dev server after adding .env.local

## Step 8: Import Executive Data

### Option A: Using the Import Script (Recommended for Batch Import)

We've created a TypeScript script to streamline importing executive data:

**Location:** `scripts/data-import/import-executives.ts`

**Usage:**

1. Install tsx (TypeScript executor) if not already installed:
   ```bash
   pnpm add -D tsx
   ```

2. Edit the script and fill in `EXECUTIVES_DATA` array with real data from:
   - **SEC EDGAR DEF 14A filings**: https://www.sec.gov/cgi-bin/browse-edgar
   - **Wikidata API**: https://www.wikidata.org/wiki/Special:EntityData/Q312129.json
   - **Company financial reports**

3. Run the import script:
   ```bash
   npx tsx scripts/data-import/import-executives.ts
   ```

**Expected Output:**
```
🚀 Starting executive data import...

📊 Processing: Tim Cook (Apple Inc.)
   ✅ Company created: Apple Inc.
   ✅ Executive created: Tim Cook
   ✅ Compensation added: 2023 ($63.0M)
   ✅ Compensation added: 2022 ($99.4M)

═══════════════════════════════════════════════════════════
📈 Import Summary:
═══════════════════════════════════════════════════════════
✅ Companies created:         1
✅ Executives created:        1
✅ Compensation records:      2
❌ Errors encountered:        0
═══════════════════════════════════════════════════════════

🎉 Import completed successfully!
```

### Option B: Manual SQL Insert (For Quick Testing)

Use the manual SQL examples in Step 6 above for quick one-off testing.

## Next Steps

After successful setup and data import:

1. **Week 2 (Data Entry):**
   - Research Fortune 500 executives (prioritize by search volume)
   - Pull compensation data from SEC EDGAR DEF 14A filings
   - Pull executive bios from Wikidata API
   - Use import script to batch-add 50 executives

2. **Week 3-4 (Build Comparison Pages):**
   - Create `/executives/compare/[slug1]-vs-[slug2]` template
   - Build executives listing page `/executives`
   - Implement ISR testing

3. **Week 5-6 (Deploy & Monitor):**
   - Deploy 50 executive pages to production
   - Monitor traffic, bounce rate, time on page
   - Hire freelance journalist for editorial pieces

## Security Notes

- **NEVER** commit `.env.local` to git (already in .gitignore)
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` publicly (bypasses RLS)
- Use `NEXT_PUBLIC_SUPABASE_URL` for client-side queries (RLS enforced)
- Service role key is only for server-side operations (data imports, admin scripts)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Connection Pooling Guide](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [SEC EDGAR Search](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany)
- [Wikidata API](https://www.wikidata.org/wiki/Wikidata:Data_access)
