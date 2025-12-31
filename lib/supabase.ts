import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client for programmatic SEO executive salary data
 *
 * CRITICAL: Uses Supavisor connection pooling to prevent connection exhaustion
 * with Next.js serverless functions on Vercel.
 *
 * Database stores:
 * - Executive profiles (name, title, company)
 * - Compensation data (5-year history from SEC EDGAR)
 * - Company information
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      // Enable Supavisor connection pooling (CRITICAL for Vercel serverless)
      'x-connection-pooler': 'supavisor'
    }
  },
  auth: {
    persistSession: false, // No session persistence needed for data fetching
    autoRefreshToken: false,
  }
})

/**
 * Database TypeScript types
 *
 * Generate with: npx supabase gen types typescript --project-id <project-id>
 * For now, using manual types. Replace with generated types after schema is stable.
 */

export interface Executive {
  id: string
  full_name: string
  slug: string
  current_title: string | null
  company_id: string | null
  bio: string | null
  wikidata_id: string | null
  linkedin_url: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  ticker_symbol: string | null
  industry: string | null
  market_cap: number | null
  founded_year: number | null
  headquarters: string | null
  created_at: string
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
  created_at: string
}

export interface ExecutiveWithCompany extends Executive {
  companies: Company | null
}

export interface ExecutiveWithCompensation extends Executive {
  companies: Company | null
  compensation: Compensation[]
}
