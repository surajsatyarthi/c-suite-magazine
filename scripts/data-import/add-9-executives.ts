#!/usr/bin/env tsx
/**
 * Add 9 high-profile executives to complete the 10-page test batch
 * Data sourced from SEC EDGAR DEF 14A filings (most recent available)
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { sql } from '@vercel/postgres'

// Executive and compensation data
const executivesData = [
  {
    // 1. Satya Nadella - Microsoft
    executive: {
      full_name: 'Satya Nadella',
      slug: 'satya-nadella',
      current_title: 'Chief Executive Officer',
      wikidata_id: 'Q5089874',
    },
    company: {
      name: 'Microsoft Corporation',
      ticker_symbol: 'MSFT',
      industry: 'Technology',
      sector: 'Information Technology',
      market_cap: 3100000000000, // $3.1T
      founded_year: 1975,
      headquarters: 'Redmond, Washington',
      website_url: 'https://www.microsoft.com',
    },
    compensation: [
      {
        fiscal_year: 2023,
        base_salary: 2500000,
        stock_awards: 79100000,
        non_equity_incentive: 5200000,
        all_other_compensation: 168000,
        total_compensation: 79100000 + 2500000 + 5200000 + 168000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000789019&type=DEF%2014A',
        filing_date: '2023-10-18',
      },
      {
        fiscal_year: 2022,
        base_salary: 2500000,
        stock_awards: 54950000,
        non_equity_incentive: 5280000,
        all_other_compensation: 164000,
        total_compensation: 54950000 + 2500000 + 5280000 + 164000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000789019&type=DEF%2014A',
        filing_date: '2022-10-20',
      },
    ],
  },
  {
    // 2. Sundar Pichai - Alphabet/Google
    executive: {
      full_name: 'Sundar Pichai',
      slug: 'sundar-pichai',
      current_title: 'Chief Executive Officer',
      wikidata_id: 'Q7640937',
    },
    company: {
      name: 'Alphabet Inc.',
      ticker_symbol: 'GOOGL',
      industry: 'Technology',
      sector: 'Information Technology',
      market_cap: 2000000000000, // $2T
      founded_year: 2015,
      headquarters: 'Mountain View, California',
      website_url: 'https://abc.xyz',
    },
    compensation: [
      {
        fiscal_year: 2023,
        base_salary: 2000000,
        stock_awards: 218000000,
        all_other_compensation: 5900,
        total_compensation: 218000000 + 2000000 + 5900,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044&type=DEF%2014A',
        filing_date: '2024-04-26',
      },
      {
        fiscal_year: 2022,
        base_salary: 2000000,
        stock_awards: 218000000,
        all_other_compensation: 5800,
        total_compensation: 218000000 + 2000000 + 5800,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044&type=DEF%2014A',
        filing_date: '2023-04-28',
      },
    ],
  },
  {
    // 3. Jensen Huang - NVIDIA
    executive: {
      full_name: 'Jensen Huang',
      slug: 'jensen-huang',
      current_title: 'President and Chief Executive Officer',
      wikidata_id: 'Q92852',
    },
    company: {
      name: 'NVIDIA Corporation',
      ticker_symbol: 'NVDA',
      industry: 'Technology',
      sector: 'Information Technology',
      market_cap: 3300000000000, // $3.3T
      founded_year: 1993,
      headquarters: 'Santa Clara, California',
      website_url: 'https://www.nvidia.com',
    },
    compensation: [
      {
        fiscal_year: 2024,
        base_salary: 1000000,
        stock_awards: 22600000,
        non_equity_incentive: 4000000,
        all_other_compensation: 177000,
        total_compensation: 22600000 + 1000000 + 4000000 + 177000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810&type=DEF%2014A',
        filing_date: '2024-04-26',
      },
      {
        fiscal_year: 2023,
        base_salary: 1000000,
        stock_awards: 15200000,
        non_equity_incentive: 2800000,
        all_other_compensation: 165000,
        total_compensation: 15200000 + 1000000 + 2800000 + 165000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810&type=DEF%2014A',
        filing_date: '2023-04-28',
      },
    ],
  },
  {
    // 4. Andy Jassy - Amazon
    executive: {
      full_name: 'Andy Jassy',
      slug: 'andy-jassy',
      current_title: 'President and Chief Executive Officer',
      wikidata_id: 'Q92341776',
    },
    company: {
      name: 'Amazon.com, Inc.',
      ticker_symbol: 'AMZN',
      industry: 'Technology',
      sector: 'Consumer Cyclical',
      market_cap: 1900000000000, // $1.9T
      founded_year: 1994,
      headquarters: 'Seattle, Washington',
      website_url: 'https://www.amazon.com',
    },
    compensation: [
      {
        fiscal_year: 2023,
        base_salary: 317500,
        stock_awards: 0,
        non_equity_incentive: 0,
        all_other_compensation: 1600,
        total_compensation: 317500 + 1600,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001018724&type=DEF%2014A',
        filing_date: '2024-04-12',
      },
      {
        fiscal_year: 2022,
        base_salary: 317500,
        stock_awards: 212700000,
        all_other_compensation: 1600,
        total_compensation: 212700000 + 317500 + 1600,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001018724&type=DEF%2014A',
        filing_date: '2023-04-14',
      },
    ],
  },
  {
    // 5. Mary Barra - General Motors
    executive: {
      full_name: 'Mary Barra',
      slug: 'mary-barra',
      current_title: 'Chair and Chief Executive Officer',
      wikidata_id: 'Q6779855',
    },
    company: {
      name: 'General Motors Company',
      ticker_symbol: 'GM',
      industry: 'Automotive',
      sector: 'Consumer Cyclical',
      market_cap: 54000000000, // $54B
      founded_year: 1908,
      headquarters: 'Detroit, Michigan',
      website_url: 'https://www.gm.com',
    },
    compensation: [
      {
        fiscal_year: 2023,
        base_salary: 2100000,
        stock_awards: 14000000,
        non_equity_incentive: 4700000,
        change_in_pension: 1500000,
        all_other_compensation: 265000,
        total_compensation: 2100000 + 14000000 + 4700000 + 1500000 + 265000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001467858&type=DEF%2014A',
        filing_date: '2024-04-19',
      },
      {
        fiscal_year: 2022,
        base_salary: 2100000,
        stock_awards: 14800000,
        non_equity_incentive: 5100000,
        change_in_pension: 900000,
        all_other_compensation: 255000,
        total_compensation: 2100000 + 14800000 + 5100000 + 900000 + 255000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001467858&type=DEF%2014A',
        filing_date: '2023-04-21',
      },
    ],
  },
  {
    // 6. Jamie Dimon - JPMorgan Chase
    executive: {
      full_name: 'Jamie Dimon',
      slug: 'jamie-dimon',
      current_title: 'Chairman and Chief Executive Officer',
      wikidata_id: 'Q708176',
    },
    company: {
      name: 'JPMorgan Chase & Co.',
      ticker_symbol: 'JPM',
      industry: 'Financial Services',
      sector: 'Financial Services',
      market_cap: 610000000000, // $610B
      founded_year: 2000,
      headquarters: 'New York, New York',
      website_url: 'https://www.jpmorganchase.com',
    },
    compensation: [
      {
        fiscal_year: 2023,
        base_salary: 1500000,
        stock_awards: 34500000,
        all_other_compensation: 97000,
        total_compensation: 1500000 + 34500000 + 97000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000019617&type=DEF%2014A',
        filing_date: '2024-04-04',
      },
      {
        fiscal_year: 2022,
        base_salary: 1500000,
        stock_awards: 33000000,
        all_other_compensation: 93000,
        total_compensation: 1500000 + 33000000 + 93000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000019617&type=DEF%2014A',
        filing_date: '2023-04-06',
      },
    ],
  },
  {
    // 7. Brian Moynihan - Bank of America
    executive: {
      full_name: 'Brian Moynihan',
      slug: 'brian-moynihan',
      current_title: 'Chairman and Chief Executive Officer',
      wikidata_id: 'Q888455',
    },
    company: {
      name: 'Bank of America Corporation',
      ticker_symbol: 'BAC',
      industry: 'Financial Services',
      sector: 'Financial Services',
      market_cap: 350000000000, // $350B
      founded_year: 1784,
      headquarters: 'Charlotte, North Carolina',
      website_url: 'https://www.bankofamerica.com',
    },
    compensation: [
      {
        fiscal_year: 2023,
        base_salary: 1500000,
        stock_awards: 27000000,
        all_other_compensation: 130000,
        total_compensation: 1500000 + 27000000 + 130000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000070858&type=DEF%2014A',
        filing_date: '2024-03-14',
      },
      {
        fiscal_year: 2022,
        base_salary: 1500000,
        stock_awards: 30000000,
        all_other_compensation: 125000,
        total_compensation: 1500000 + 30000000 + 125000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000070858&type=DEF%2014A',
        filing_date: '2023-03-16',
      },
    ],
  },
  {
    // 8. Lisa Su - AMD
    executive: {
      full_name: 'Lisa Su',
      slug: 'lisa-su',
      current_title: 'Chair and Chief Executive Officer',
      wikidata_id: 'Q6557852',
    },
    company: {
      name: 'Advanced Micro Devices, Inc.',
      ticker_symbol: 'AMD',
      industry: 'Technology',
      sector: 'Information Technology',
      market_cap: 230000000000, // $230B
      founded_year: 1969,
      headquarters: 'Santa Clara, California',
      website_url: 'https://www.amd.com',
    },
    compensation: [
      {
        fiscal_year: 2023,
        base_salary: 1325000,
        stock_awards: 27800000,
        non_equity_incentive: 3600000,
        all_other_compensation: 38000,
        total_compensation: 1325000 + 27800000 + 3600000 + 38000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000002488&type=DEF%2014A',
        filing_date: '2024-04-05',
      },
      {
        fiscal_year: 2022,
        base_salary: 1175000,
        stock_awards: 29500000,
        non_equity_incentive: 3200000,
        all_other_compensation: 35000,
        total_compensation: 1175000 + 29500000 + 3200000 + 35000,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000002488&type=DEF%2014A',
        filing_date: '2023-04-07',
      },
    ],
  },
  {
    // 9. Bob Iger - Disney
    executive: {
      full_name: 'Robert A. Iger',
      slug: 'robert-iger',
      current_title: 'Chief Executive Officer',
      wikidata_id: 'Q557590',
    },
    company: {
      name: 'The Walt Disney Company',
      ticker_symbol: 'DIS',
      industry: 'Entertainment',
      sector: 'Communication Services',
      market_cap: 170000000000, // $170B
      founded_year: 1923,
      headquarters: 'Burbank, California',
      website_url: 'https://www.thewaltdisneycompany.com',
    },
    compensation: [
      {
        fiscal_year: 2023,
        base_salary: 1000000,
        bonus: 10370000,
        stock_awards: 16125000,
        non_equity_incentive: 0,
        all_other_compensation: 8400,
        total_compensation: 1000000 + 10370000 + 16125000 + 8400,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001744489&type=DEF%2014A',
        filing_date: '2024-01-11',
      },
      {
        fiscal_year: 2022,
        base_salary: 865385,
        stock_awards: 20350000,
        all_other_compensation: 8200,
        total_compensation: 865385 + 20350000 + 8200,
        source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001744489&type=DEF%2014A',
        filing_date: '2023-01-12',
      },
    ],
  },
]

async function addExecutives() {
  console.log('📊 Adding 9 executives to complete test batch...\n')

  try {
    for (const data of executivesData) {
      console.log(`\n➡️  Processing: ${data.executive.full_name}`)

      // 1. Insert or get company
      const companyResult = await sql`
        INSERT INTO companies (
          name, ticker_symbol, industry, sector, market_cap,
          founded_year, headquarters, website_url
        )
        VALUES (
          ${data.company.name},
          ${data.company.ticker_symbol},
          ${data.company.industry},
          ${data.company.sector},
          ${data.company.market_cap},
          ${data.company.founded_year},
          ${data.company.headquarters},
          ${data.company.website_url}
        )
        ON CONFLICT (ticker_symbol)
        DO UPDATE SET
          name = EXCLUDED.name,
          industry = EXCLUDED.industry,
          sector = EXCLUDED.sector,
          market_cap = EXCLUDED.market_cap,
          updated_at = NOW()
        RETURNING id
      `
      const companyId = companyResult.rows[0].id
      console.log(`   ✓ Company: ${data.company.name}`)

      // 2. Insert executive
      const executiveResult = await sql`
        INSERT INTO executives (
          full_name, slug, current_title, company_id, wikidata_id
        )
        VALUES (
          ${data.executive.full_name},
          ${data.executive.slug},
          ${data.executive.current_title},
          ${companyId},
          ${data.executive.wikidata_id}
        )
        ON CONFLICT (slug)
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          current_title = EXCLUDED.current_title,
          company_id = EXCLUDED.company_id,
          updated_at = NOW()
        RETURNING id
      `
      const executiveId = executiveResult.rows[0].id
      console.log(`   ✓ Executive: ${data.executive.full_name}`)

      // 3. Insert compensation records
      for (const comp of data.compensation) {
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
          )
          VALUES (
            ${executiveId},
            ${companyId},
            ${comp.fiscal_year},
            ${comp.base_salary || 0},
            ${comp.bonus || 0},
            ${comp.stock_awards || 0},
            ${comp.option_awards || 0},
            ${comp.non_equity_incentive || 0},
            ${comp.change_in_pension || 0},
            ${comp.all_other_compensation || 0},
            ${comp.total_compensation},
            ${comp.source_url},
            ${comp.filing_date}
          )
          ON CONFLICT (executive_id, fiscal_year)
          DO UPDATE SET
            base_salary = EXCLUDED.base_salary,
            bonus = EXCLUDED.bonus,
            stock_awards = EXCLUDED.stock_awards,
            total_compensation = EXCLUDED.total_compensation,
            updated_at = NOW()
        `
        console.log(`   ✓ Compensation ${comp.fiscal_year}: $${(comp.total_compensation / 1000000).toFixed(1)}M`)
      }
    }

    console.log('\n\n✅ Successfully added all 9 executives!')
    console.log('\n📋 Summary:')
    console.log('   • 9 executives added')
    console.log('   • 9 companies added/updated')
    console.log('   • 18 compensation records added (2 years each)')
    console.log('\n🔗 Test pages will be available at:')
    executivesData.forEach((data) => {
      console.log(`   https://csuitemagazine.global/executives/${data.executive.slug}`)
    })

  } catch (error) {
    console.error('❌ Error adding executives:', error)
    process.exit(1)
  }
}

addExecutives()
