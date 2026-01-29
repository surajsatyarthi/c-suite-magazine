#!/usr/bin/env tsx
/**
 * Add 5 Years of Compensation Data for Tim Cook (FY 2020-2024)
 *
 * Progressive Rollout - Phase A: Test with Tim Cook first
 * Source: SEC EDGAR DEF 14A filings and verified news sources
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { sql } from '@vercel/postgres'

async function main() {
  console.log('🚀 Starting Tim Cook 5-year compensation import...\n')

  try {
    // Find Tim Cook's executive ID
    const timCookResult = await sql`
      SELECT id FROM executives WHERE slug = 'tim-cook'
    `

    if (timCookResult.rows.length === 0) {
      console.error('❌ Tim Cook not found in database')
      process.exit(1)
    }

    const executiveId = timCookResult.rows[0].id
    console.log(`✓ Found Tim Cook (ID: ${executiveId})`)

    // Find Apple Inc. company ID
    const appleResult = await sql`
      SELECT id FROM companies WHERE ticker_symbol = 'AAPL'
    `

    if (appleResult.rows.length === 0) {
      console.error('❌ Apple Inc. not found in database')
      process.exit(1)
    }

    const companyId = appleResult.rows[0].id
    console.log(`✓ Found Apple Inc. (ID: ${companyId})\n`)

    // Compensation data for FY 2020-2024
    const compensationData = [
      {
        fiscal_year: 2024,
        base_salary: 3_000_000,
        bonus: 0,
        stock_awards: 58_090_000,
        option_awards: 0,
        non_equity_incentive: 12_000_000,
        change_in_pension: 0,
        all_other_compensation: 1_520_000,
        total_compensation: 74_610_000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
        filing_date: '2025-01-09'
      },
      {
        fiscal_year: 2023,
        base_salary: 3_000_000,
        bonus: 0,
        stock_awards: 46_970_000,
        option_awards: 0,
        non_equity_incentive: 10_700_000,
        change_in_pension: 0,
        all_other_compensation: 2_530_000,
        total_compensation: 63_200_000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
        filing_date: '2024-01-11'
      },
      {
        fiscal_year: 2022,
        base_salary: 3_000_000,
        bonus: 0,
        stock_awards: 83_000_000,
        option_awards: 0,
        non_equity_incentive: 12_000_000,
        change_in_pension: 0,
        all_other_compensation: 1_400_000,
        total_compensation: 99_400_000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
        filing_date: '2023-01-12'
      },
      {
        fiscal_year: 2021,
        base_salary: 3_000_000,
        bonus: 0,
        stock_awards: 82_000_000,
        option_awards: 0,
        non_equity_incentive: 12_000_000,
        change_in_pension: 0,
        all_other_compensation: 1_389_000,
        total_compensation: 98_734_000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
        filing_date: '2022-01-07'
      },
      {
        fiscal_year: 2020,
        base_salary: 3_000_000,
        bonus: 0,
        stock_awards: 0,
        option_awards: 0,
        non_equity_incentive: 10_700_000,
        change_in_pension: 0,
        all_other_compensation: 1_000_000,
        total_compensation: 14_769_000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
        filing_date: '2021-01-08'
      }
    ]

    // Insert compensation records (idempotent with ON CONFLICT DO UPDATE)
    console.log('📊 Inserting compensation data...\n')

    for (const comp of compensationData) {
      await sql`
        INSERT INTO compensation (
          executive_id,
          company_id,
          fiscal_year,
          base_salary,
          bonus,
          stock_awards,
          option_awards,
          non_equity_incentive,
          change_in_pension,
          all_other_compensation,
          total_compensation,
          source_url,
          filing_date
        ) VALUES (
          ${executiveId},
          ${companyId},
          ${comp.fiscal_year},
          ${comp.base_salary},
          ${comp.bonus},
          ${comp.stock_awards},
          ${comp.option_awards},
          ${comp.non_equity_incentive},
          ${comp.change_in_pension},
          ${comp.all_other_compensation},
          ${comp.total_compensation},
          ${comp.source_url},
          ${comp.filing_date}
        )
        ON CONFLICT (executive_id, fiscal_year)
        DO UPDATE SET
          base_salary = EXCLUDED.base_salary,
          bonus = EXCLUDED.bonus,
          stock_awards = EXCLUDED.stock_awards,
          option_awards = EXCLUDED.option_awards,
          non_equity_incentive = EXCLUDED.non_equity_incentive,
          change_in_pension = EXCLUDED.change_in_pension,
          all_other_compensation = EXCLUDED.all_other_compensation,
          total_compensation = EXCLUDED.total_compensation,
          source_url = EXCLUDED.source_url,
          filing_date = EXCLUDED.filing_date,
          updated_at = NOW()
      `

      console.log(`  ✓ FY ${comp.fiscal_year}: $${(comp.total_compensation / 1_000_000).toFixed(1)}M total compensation`)
    }

    // Verify data
    console.log('\n✅ Verifying data...')
    const verifyResult = await sql`
      SELECT fiscal_year, total_compensation
      FROM compensation
      WHERE executive_id = ${executiveId}
      ORDER BY fiscal_year DESC
    `

    console.log('\nTim Cook Compensation Records:')
    verifyResult.rows.forEach(row => {
      console.log(`  FY ${row.fiscal_year}: $${(Number(row.total_compensation) / 1_000_000).toFixed(1)}M`)
    })

    console.log('\n✅ SUCCESS! Tim Cook now has 5 years of compensation data (FY 2020-2024)')
    console.log('\n📋 Next Steps:')
    console.log('1. Visit: https://csuitemagazine.global/executives/tim-cook')
    console.log('2. Verify the 5-year table displays correctly with all years')
    console.log('3. Report back for approval before proceeding with other executives')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
