import 'server-only'
/**
 * Database Client - Vercel Postgres
 *
 * This module provides database access for the executive compensation
 * programmatic SEO feature using Vercel Postgres.
 */

import { sql } from '@vercel/postgres'
// Guardian import removed as file is missing
// import { guardian } from './guardian'
export { sql }

// Type definitions
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
  created_at: string
  updated_at: string
}

export interface PerformanceMetrics {
  fiscal_year: number
  performance_period: string
  annual_cash_incentive?: {
    target_amount: number
    actual_payout: number
    payout_percentage: number
    metrics: Array<{
      category: string
      description: string
      weight_percentage: number
      actual_achievement: string
      payout_modifier: number
    }>
    board_discretion?: string
  }
  stock_awards?: {
    grant_date: string
    grant_value: number
    vesting_schedule: string
    vesting_conditions: string[]
  }
  strategic_objectives?: Array<{
    objective: string
    description: string
    achievement: string
  }>
  company_performance?: {
    revenue: number
    revenue_change_pct: number
    operating_income: number
    net_income: number
    stock_price_return: number
    total_shareholder_return_1yr: number
    context: string
  }
  board_rationale?: string
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
  performance_metrics?: PerformanceMetrics | null
  source_url: string
  filing_date: string | null
  created_at: string
  updated_at: string
}

export interface ExecutiveWithCompensation extends Executive {
  companies: Company | null
  compensation: (Compensation & { companies: Pick<Company, 'name' | 'ticker_symbol'> | null })[]
}

/**
 * Fetch executive data with compensation history by slug
 */
export async function getExecutiveBySlug(slug: string): Promise<ExecutiveWithCompensation | null> {
  try {
    const result = await sql`
      SELECT
        e.id,
        e.full_name,
        e.slug,
        e.current_title,
        e.company_id,
        e.bio,
        e.wikidata_id,
        e.linkedin_url,
        e.birth_year,
        e.education,
        e.profile_image_url,
        e.created_at,
        e.updated_at,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'ticker_symbol', c.ticker_symbol,
          'industry', c.industry,
          'sector', c.sector,
          'market_cap', c.market_cap,
          'founded_year', c.founded_year,
          'headquarters', c.headquarters,
          'website_url', c.website_url,
          'logo_url', c.logo_url,
          'created_at', c.created_at,
          'updated_at', c.updated_at
        ) as companies,
        (
          SELECT json_agg(
            json_build_object(
              'id', comp.id,
              'executive_id', comp.executive_id,
              'company_id', comp.company_id,
              'fiscal_year', comp.fiscal_year,
              'base_salary', comp.base_salary,
              'bonus', comp.bonus,
              'stock_awards', comp.stock_awards,
              'option_awards', comp.option_awards,
              'non_equity_incentive', comp.non_equity_incentive,
              'change_in_pension', comp.change_in_pension,
              'all_other_compensation', comp.all_other_compensation,
              'total_compensation', comp.total_compensation,
              'source_url', comp.source_url,
              'filing_date', comp.filing_date,
              'created_at', comp.created_at,
              'updated_at', comp.updated_at,
              'companies', json_build_object(
                'name', c2.name,
                'ticker_symbol', c2.ticker_symbol
              )
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

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as ExecutiveWithCompensation
  } catch (error) {
    console.error('[db] Failed to fetch executive:', error)
    return null
  }
}

/**
 * Get list of executive slugs for static generation
 */
export async function getExecutiveSlugs(limit: number = 100): Promise<string[]> {
  try {
    const result = await sql`
      SELECT slug
      FROM executives
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.rows.map((row) => row.slug as string)
  } catch (error) {
    console.error('[db] Failed to fetch executive slugs:', error)
    return []
  }
}

/**
 * Get list of all executives (for testing)
 */
export async function getAllExecutives(limit: number = 5): Promise<Partial<Executive>[]> {
  try {
    const result = await sql`
      SELECT id, full_name, slug, current_title
      FROM executives
      ORDER BY full_name
      LIMIT ${limit}
    `
    return result.rows as Partial<Executive>[]
  } catch (error) {
    console.error('[db] Failed to fetch executives:', error)
    return []
  }
}

/**
 * Get list of all companies (for testing)
 */
export async function getAllCompanies(limit: number = 5): Promise<Partial<Company>[]> {
  try {
    const result = await sql`
      SELECT id, name, ticker_symbol
      FROM companies
      ORDER BY name
      LIMIT ${limit}
    `
    return result.rows as Partial<Company>[]
  } catch (error) {
    console.error('[db] Failed to fetch companies:', error)
    return []
  }
}

/**
 * Get compensation records (for testing)
 */
export async function getCompensationRecords(limit: number = 5): Promise<Partial<Compensation>[]> {
  try {
    const result = await sql`
      SELECT id, fiscal_year, total_compensation
      FROM compensation
      ORDER BY fiscal_year DESC
      LIMIT ${limit}
    `
    return result.rows as Partial<Compensation>[]
  } catch (error) {
    console.error('[db] Failed to fetch compensation:', error)
    return []
  }
}

/**
 * Get all executives with their latest compensation for the hub page
 * Used for the /executives listing page with sortable table
 */
export interface ExecutiveForHub {
  id: string
  full_name: string
  slug: string
  current_title: string | null
  company_name: string | null
  ticker_symbol: string | null
  latest_fiscal_year: number | null
  total_compensation: number | null
  previous_year_compensation: number | null
  yoy_change_percent: number | null
}

export async function getAllExecutivesWithCompensation(limit: number = 10000): Promise<ExecutiveForHub[]> {
  try {
    const result = await sql`
      SELECT
        e.id,
        e.full_name,
        e.slug,
        e.current_title,
        c.name as company_name,
        c.ticker_symbol,
        latest.fiscal_year as latest_fiscal_year,
        latest.total_compensation,
        previous.total_compensation as previous_year_compensation,
        CASE
          WHEN previous.total_compensation IS NOT NULL AND previous.total_compensation > 0
          THEN ROUND(((latest.total_compensation - previous.total_compensation) * 100.0 / previous.total_compensation)::numeric, 1)
          ELSE NULL
        END as yoy_change_percent
      FROM executives e
      LEFT JOIN companies c ON e.company_id = c.id
      LEFT JOIN LATERAL (
        SELECT fiscal_year, total_compensation
        FROM compensation
        WHERE executive_id = e.id
        ORDER BY fiscal_year DESC
        LIMIT 1
      ) latest ON true
      LEFT JOIN LATERAL (
        SELECT total_compensation
        FROM compensation
        WHERE executive_id = e.id
        AND fiscal_year = (latest.fiscal_year - 1)
        LIMIT 1
      ) previous ON true
      WHERE latest.total_compensation IS NOT NULL
      ORDER BY latest.total_compensation DESC NULLS LAST
      LIMIT ${limit}
    `
    return result.rows as ExecutiveForHub[]
  } catch (error) {
    console.error('[db] Failed to fetch executives with compensation:', error)
    return []
  }
}

// Export sql already handled at top

