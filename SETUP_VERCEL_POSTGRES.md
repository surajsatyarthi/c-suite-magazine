# Alternative Setup: Vercel Postgres (Free Tier)

**Use this if you can't create a new Supabase project due to free tier limits.**

This guide shows how to use Vercel Postgres instead of Supabase. Same functionality, different provider.

---

## Option 1: Vercel Postgres (Recommended - Free & Already Integrated)

### Step 1: Create Vercel Postgres Database (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Click on your **ceo-magazine** project
3. Click **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose:
   - **Database Name**: `csuite-executives`
   - **Region**: Same as your deployment (US East recommended)
   - **Pricing**: **Hobby (Free)** - 256 MB storage (enough for 1,000+ executives)
7. Click **Create**

### Step 2: Get Connection String (30 seconds)

After creation, Vercel shows you connection details:

1. Click on the database you just created
2. Go to **.env.local** tab
3. Copy the shown environment variables:
   ```
   POSTGRES_URL="..."
   POSTGRES_PRISMA_URL="..."
   POSTGRES_URL_NON_POOLING="..."
   ```

### Step 3: Auto-Add to Vercel (Automatic!)

✅ Vercel automatically adds these to your project's environment variables.

No manual configuration needed for production/preview!

### Step 4: Add to Local Environment (30 seconds)

Create `.env.local` in project root:

```bash
# Vercel Postgres (copy from Vercel dashboard)
POSTGRES_URL="postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:xxxxx@xxxxx-pooler.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb"

# Copy these from .env.example
NEXT_PUBLIC_SANITY_PROJECT_ID=demo
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
```

### Step 5: Install PostgreSQL Client (1 minute)

```bash
pnpm add @vercel/postgres
```

### Step 6: Update Database Client Code

**Edit `lib/supabase.ts` → rename to `lib/db.ts`:**

```typescript
import { sql } from '@vercel/postgres'

export interface Executive {
  id: string
  full_name: string
  slug: string
  current_title: string | null
  company_id: string | null
  bio: string | null
  wikidata_id: string | null
  linkedin_url: string | null
  birth_year: number | null
  education: string | null
  profile_image_url: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  ticker_symbol: string | null
  industry: string | null
  sector: string | null
  market_cap: number | null
  founded_year: number | null
  headquarters: string | null
  website_url: string | null
  logo_url: string | null
}

export interface Compensation {
  id: string
  executive_id: string
  company_id: string
  fiscal_year: number
  base_salary: number
  bonus: number
  stock_awards: number
  option_awards: number
  non_equity_incentive: number
  change_in_pension: number
  all_other_compensation: number
  total_compensation: number
  source_url: string
  filing_date: string | null
}

export interface ExecutiveWithCompensation extends Executive {
  companies: Company | null
  compensation: (Compensation & { companies: Company | null })[]
}

// Query helper for executive data
export async function getExecutiveBySlug(slug: string): Promise<ExecutiveWithCompensation | null> {
  try {
    const result = await sql`
      SELECT
        e.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'ticker_symbol', c.ticker_symbol,
          'industry', c.industry,
          'sector', c.sector
        ) as companies,
        (
          SELECT json_agg(
            json_build_object(
              'id', comp.id,
              'fiscal_year', comp.fiscal_year,
              'base_salary', comp.base_salary,
              'bonus', comp.bonus,
              'stock_awards', comp.stock_awards,
              'option_awards', comp.option_awards,
              'non_equity_incentive', comp.non_equity_incentive,
              'all_other_compensation', comp.all_other_compensation,
              'total_compensation', comp.total_compensation,
              'source_url', comp.source_url,
              'companies', json_build_object('name', c2.name, 'ticker_symbol', c2.ticker_symbol)
            ) ORDER BY comp.fiscal_year DESC
          )
          FROM compensation comp
          LEFT JOIN companies c2 ON comp.company_id = c2.id
          WHERE comp.executive_id = e.id
        ) as compensation
      FROM executives e
      LEFT JOIN companies c ON e.company_id = c.id
      WHERE e.slug = ${slug}
      LIMIT 1
    `

    if (result.rows.length === 0) return null

    return result.rows[0] as ExecutiveWithCompensation
  } catch (error) {
    console.error('[db] Failed to fetch executive:', error)
    return null
  }
}

export { sql }
```

### Step 7: Update Executive Page

**Edit `app/executives/[slug]/page.tsx`:**

Change line 2:
```typescript
// OLD
import { supabase, type ExecutiveWithCompensation } from '@/lib/supabase'

// NEW
import { getExecutiveBySlug, type ExecutiveWithCompensation } from '@/lib/db'
```

Change function `getExecutiveData` (around line 15):
```typescript
// OLD
async function getExecutiveData(slug: string): Promise<ExecutiveWithCompensation | null> {
  const { data, error } = await supabase
    .from('executives')
    .select(`
      *,
      companies (*),
      compensation (
        *,
        companies (name, ticker_symbol)
      )
    `)
    .eq('slug', slug)
    .order('fiscal_year', { foreignTable: 'compensation', ascending: false })
    .single()

  if (error || !data) {
    console.error('[executives/[slug]] Failed to fetch executive:', error)
    return null
  }

  return data as ExecutiveWithCompensation
}

// NEW
async function getExecutiveData(slug: string): Promise<ExecutiveWithCompensation | null> {
  return await getExecutiveBySlug(slug)
}
```

Change `generateStaticParams` (around line 42):
```typescript
// OLD
export async function generateStaticParams() {
  const { data: executives } = await supabase
    .from('executives')
    .select('slug')
    .limit(100)

  return executives?.map((exec) => ({
    slug: exec.slug
  })) || []
}

// NEW
import { sql } from '@/lib/db'

export async function generateStaticParams() {
  try {
    const result = await sql`SELECT slug FROM executives LIMIT 100`
    return result.rows.map((row) => ({ slug: row.slug }))
  } catch (error) {
    console.error('[generateStaticParams] Failed:', error)
    return []
  }
}
```

### Step 8: Run Schema Migration in Vercel Dashboard

1. Go to your Vercel Postgres database
2. Click **Query** tab
3. Copy/paste the entire contents of `db/schema.sql`
4. Click **Run Query**
5. Verify: "Success" message appears

### Step 9: Update Import Script

**Edit `scripts/data-import/import-executives.ts`:**

Change the database client at the top:
```typescript
// OLD
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  db: { schema: 'public' },
  global: {
    headers: { 'x-connection-pooler': 'supavisor' }
  }
})

// NEW
import { sql } from '@vercel/postgres'

if (!process.env.POSTGRES_URL) {
  console.error('❌ Missing POSTGRES_URL environment variable')
  process.exit(1)
}
```

Then update all database queries to use SQL instead of Supabase client. (I can help with this if you choose this path.)

### Step 10: Test Everything

```bash
# Start dev server
pnpm dev

# Visit test page
http://localhost:3000/executives/tim-cook
```

---

## Option 2: Neon.tech (Free Tier)

Alternative free PostgreSQL provider if you prefer not to use Vercel Postgres.

### Quick Setup:

1. Go to: https://neon.tech
2. Sign up (GitHub fastest)
3. Create new project: `csuite-magazine`
4. Copy connection string
5. Add to `.env.local` as `DATABASE_URL`
6. Follow same steps as Vercel Postgres above (use `@neondatabase/serverless` package)

**Free tier:**
- 10 GB storage
- 100 hours compute/month
- Generous limits for 1,000+ pages

---

## Summary: Vercel Postgres vs Supabase

| Feature | Vercel Postgres | Supabase |
|---------|----------------|----------|
| **Free Tier Storage** | 256 MB | 500 MB |
| **Connection Pooling** | Built-in (PgBouncer) | Supavisor |
| **Setup Complexity** | Medium (raw SQL) | Easy (JS client) |
| **Vercel Integration** | Native | External |
| **Auto Environment Vars** | ✅ Yes | ❌ Manual |
| **Cost** | Free (hobby tier) | Free (2 projects max) |

**Recommendation:**
- If you're comfortable with SQL: **Vercel Postgres** (better Vercel integration)
- If you prefer JavaScript client: **Neon.tech** (more generous free tier)

---

## Notes

- This guide does NOT modify your existing site
- Only use this if you can't create a new Supabase project
- All the code changes above are OPTIONAL - only do them if you choose this path
- I recommend waiting for budget to upgrade Supabase to Pro ($25/month) for simplicity
