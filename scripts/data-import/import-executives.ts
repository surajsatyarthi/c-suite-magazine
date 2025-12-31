/**
 * Executive Data Import Script
 *
 * Usage:
 *   1. Add your Vercel Postgres credentials to .env.local
 *   2. Prepare executive data in the format shown below
 *   3. Run: npx tsx scripts/data-import/import-executives.ts
 *
 * This script imports executive compensation data from SEC EDGAR filings
 * into the Vercel Postgres database for programmatic SEO pages.
 */

import { sql } from '@vercel/postgres'

// Check environment variables
if (!process.env.POSTGRES_URL) {
  console.error('❌ Missing required environment variable:')
  console.error('   POSTGRES_URL')
  console.error('\nAdd this to .env.local and try again.')
  console.error('Get it from: Vercel Dashboard > Storage > Your Database > .env.local tab')
  process.exit(1)
}

/**
 * Sample Executive Data Structure
 *
 * Fill this array with real data from:
 * - SEC EDGAR DEF 14A filings: https://www.sec.gov/cgi-bin/browse-edgar
 * - Wikidata API: https://www.wikidata.org/wiki/Special:EntityData/Q312129.json
 * - Company financial reports
 */
const EXECUTIVES_DATA = [
  {
    company: {
      name: 'Apple Inc.',
      ticker_symbol: 'AAPL',
      industry: 'Technology',
      sector: 'Information Technology',
      market_cap: 2800000000000, // $2.8T
      founded_year: 1976,
      headquarters: 'Cupertino, California',
      website_url: 'https://www.apple.com',
      logo_url: 'https://logo.clearbit.com/apple.com'
    },
    executive: {
      full_name: 'Tim Cook',
      slug: 'tim-cook',
      current_title: 'Chief Executive Officer',
      bio: 'Timothy Donald Cook is an American business executive who has been the chief executive officer of Apple Inc. since 2011. Cook previously served as the company\'s chief operating officer under its co-founder Steve Jobs.',
      wikidata_id: 'Q312129',
      linkedin_url: 'https://www.linkedin.com/in/tim-cook-134b431',
      birth_year: 1960,
      education: 'MBA from Duke University, BS in Industrial Engineering from Auburn University',
      profile_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Tim_Cook_2009_cropped.jpg/440px-Tim_Cook_2009_cropped.jpg'
    },
    compensation: [
      {
        fiscal_year: 2023,
        base_salary: 3000000,
        bonus: 0,
        stock_awards: 47260340,
        option_awards: 0,
        non_equity_incentive: 10715000,
        change_in_pension: 0,
        all_other_compensation: 46611,
        total_compensation: 63021951,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
        filing_date: '2024-01-11'
      },
      {
        fiscal_year: 2022,
        base_salary: 3000000,
        bonus: 0,
        stock_awards: 82978500,
        option_awards: 0,
        non_equity_incentive: 12000000,
        change_in_pension: 0,
        all_other_compensation: 1425933,
        total_compensation: 99420277,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
        filing_date: '2023-01-12'
      }
    ]
  },
  // Add more executives here following the same structure
]

async function importExecutives() {
  console.log('🚀 Starting executive data import...\n')

  let companiesCreated = 0
  let executivesCreated = 0
  let compensationRecordsCreated = 0
  let errors = 0

  for (const data of EXECUTIVES_DATA) {
    try {
      console.log(`📊 Processing: ${data.executive.full_name} (${data.company.name})`)

      // Step 1: Insert or get company
      const existingCompany = await sql`
        SELECT id FROM companies WHERE ticker_symbol = ${data.company.ticker_symbol}
      `

      let companyId: string

      if (existingCompany.rows.length > 0) {
        companyId = existingCompany.rows[0].id
        console.log(`   ℹ️  Company already exists: ${data.company.name}`)
      } else {
        const newCompany = await sql`
          INSERT INTO companies (
            name, ticker_symbol, industry, sector, market_cap,
            founded_year, headquarters, website_url, logo_url
          )
          VALUES (
            ${data.company.name},
            ${data.company.ticker_symbol},
            ${data.company.industry},
            ${data.company.sector},
            ${data.company.market_cap},
            ${data.company.founded_year},
            ${data.company.headquarters},
            ${data.company.website_url || null},
            ${data.company.logo_url || null}
          )
          RETURNING id
        `

        companyId = newCompany.rows[0].id
        companiesCreated++
        console.log(`   ✅ Company created: ${data.company.name}`)
      }

      // Step 2: Insert or get executive
      const existingExecutive = await sql`
        SELECT id FROM executives WHERE slug = ${data.executive.slug}
      `

      let executiveId: string

      if (existingExecutive.rows.length > 0) {
        executiveId = existingExecutive.rows[0].id
        console.log(`   ℹ️  Executive already exists: ${data.executive.full_name}`)
      } else {
        const newExecutive = await sql`
          INSERT INTO executives (
            full_name, slug, current_title, company_id, bio,
            wikidata_id, linkedin_url, birth_year, education, profile_image_url
          )
          VALUES (
            ${data.executive.full_name},
            ${data.executive.slug},
            ${data.executive.current_title || null},
            ${companyId},
            ${data.executive.bio || null},
            ${data.executive.wikidata_id || null},
            ${data.executive.linkedin_url || null},
            ${data.executive.birth_year || null},
            ${data.executive.education || null},
            ${data.executive.profile_image_url || null}
          )
          RETURNING id
        `

        executiveId = newExecutive.rows[0].id
        executivesCreated++
        console.log(`   ✅ Executive created: ${data.executive.full_name}`)
      }

      // Step 3: Insert compensation records
      for (const comp of data.compensation) {
        try {
          await sql`
            INSERT INTO compensation (
              executive_id, company_id, fiscal_year,
              base_salary, bonus, stock_awards, option_awards,
              non_equity_incentive, change_in_pension, all_other_compensation,
              total_compensation, source_url, filing_date
            )
            VALUES (
              ${executiveId},
              ${companyId},
              ${comp.fiscal_year},
              ${comp.base_salary},
              ${comp.bonus || 0},
              ${comp.stock_awards || 0},
              ${comp.option_awards || 0},
              ${comp.non_equity_incentive || 0},
              ${comp.change_in_pension || 0},
              ${comp.all_other_compensation || 0},
              ${comp.total_compensation},
              ${comp.source_url},
              ${comp.filing_date || null}
            )
            ON CONFLICT (executive_id, fiscal_year) DO NOTHING
          `
          compensationRecordsCreated++
          console.log(`   ✅ Compensation added: ${comp.fiscal_year} ($${(comp.total_compensation / 1000000).toFixed(1)}M)`)
        } catch (error) {
          console.log(`   ⚠️  Compensation record exists: ${comp.fiscal_year}`)
        }
      }

      console.log('')
    } catch (error) {
      errors++
      console.error(`   ❌ Error processing ${data.executive.full_name}:`, error)
      console.log('')
    }
  }

  // Summary
  console.log('═'.repeat(60))
  console.log('📈 Import Summary:')
  console.log('═'.repeat(60))
  console.log(`✅ Companies created:         ${companiesCreated}`)
  console.log(`✅ Executives created:        ${executivesCreated}`)
  console.log(`✅ Compensation records:      ${compensationRecordsCreated}`)
  console.log(`❌ Errors encountered:        ${errors}`)
  console.log('═'.repeat(60))

  if (errors === 0) {
    console.log('\n🎉 Import completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Visit /api/test-supabase to verify data')
    console.log('2. Visit /executives/tim-cook to see the page')
    console.log('3. Add more executives to EXECUTIVES_DATA and re-run')
  } else {
    console.log('\n⚠️  Import completed with errors. Review the output above.')
  }
}

// Run the import
importExecutives().catch((error) => {
  console.error('💥 Fatal error during import:', error)
  process.exit(1)
})
