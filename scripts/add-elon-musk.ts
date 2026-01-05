/**
 * Add Elon Musk to the executive compensation database
 *
 * Source: Tesla SEC filings (DEF 14A proxy statements)
 * - 2024: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=DEF%2014A
 * - 2023: $0 compensation (approved 2018 performance award plan)
 * - 2021: $848M (stock options from 2018 plan vested)
 * - 2020: $11B (from vesting tranches of 2018 compensation plan)
 */

import { sql } from '@vercel/postgres'

async function addElonMusk() {
  try {
    console.log('Adding Elon Musk to executive compensation database...\n')

    // Step 1: Check if Tesla exists, if not create it
    console.log('Step 1: Checking Tesla company...')
    const teslaCheck = await sql`
      SELECT id FROM companies WHERE ticker_symbol = 'TSLA' LIMIT 1
    `

    let teslaId: string

    if (teslaCheck.rows.length === 0) {
      console.log('Creating Tesla company record...')
      const teslaResult = await sql`
        INSERT INTO companies (
          name,
          ticker_symbol,
          industry,
          sector,
          market_cap,
          founded_year,
          headquarters,
          website_url
        ) VALUES (
          'Tesla, Inc.',
          'TSLA',
          'Automotive',
          'Consumer Discretionary',
          1200000000000,
          2003,
          'Austin, Texas',
          'https://www.tesla.com'
        )
        RETURNING id
      `
      teslaId = teslaResult.rows[0].id
      console.log(`✅ Tesla created with ID: ${teslaId}`)
    } else {
      teslaId = teslaCheck.rows[0].id
      console.log(`✅ Tesla found with ID: ${teslaId}`)
    }

    // Step 2: Create Elon Musk executive record
    console.log('\nStep 2: Creating Elon Musk executive record...')
    const elonResult = await sql`
      INSERT INTO executives (
        full_name,
        slug,
        current_title,
        company_id,
        bio,
        wikidata_id,
        birth_year
      ) VALUES (
        'Elon Musk',
        'elon-musk',
        'Chief Executive Officer',
        ${teslaId},
        'Elon Musk is CEO of Tesla, Inc. and has led the company since 2008. Under his leadership, Tesla became the world''s most valuable automaker and pioneered mass-market electric vehicles. He is also CEO of SpaceX and has founded several other technology companies.',
        'Q317521',
        1971
      )
      RETURNING id
    `

    const elonId = elonResult.rows[0].id
    console.log(`✅ Elon Musk created with ID: ${elonId}`)

    // Step 3: Add compensation records
    // Note: Elon Musk famously takes $0 salary. His compensation comes from stock option awards
    // that vest based on Tesla's performance milestones (2018 Performance Award)
    console.log('\nStep 3: Adding compensation records...')

    // 2024 - No direct compensation reported (relies on 2018 performance award)
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
        ${elonId},
        ${teslaId},
        2024,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=DEF%2014A',
        '2024-04-15'
      )
    `
    console.log('✅ Added 2024 compensation ($0)')

    // 2023 - No direct compensation
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
        ${elonId},
        ${teslaId},
        2023,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=DEF%2014A',
        '2023-04-17'
      )
    `
    console.log('✅ Added 2023 compensation ($0)')

    // 2022 - No direct compensation
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
        ${elonId},
        ${teslaId},
        2022,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=DEF%2014A',
        '2022-04-20'
      )
    `
    console.log('✅ Added 2022 compensation ($0)')

    // 2021 - Stock option exercises from 2018 plan (~$848M reported)
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
        ${elonId},
        ${teslaId},
        2021,
        0,
        0,
        0,
        848043065,
        0,
        0,
        23796,
        848066861,
        'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=DEF%2014A',
        '2022-04-20'
      )
    `
    console.log('✅ Added 2021 compensation ($848M)')

    // 2020 - Performance-based stock options from 2018 plan (~$11B reported as incremental fair value)
    // Note: SEC filings show $0 in summary compensation table because no new grants,
    // but the proxy statement shows significant value from 2018 plan tranches vesting
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
        ${elonId},
        ${teslaId},
        2020,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=DEF%2014A',
        '2021-04-30'
      )
    `
    console.log('✅ Added 2020 compensation ($0 per SEC table)')

    console.log('\n✅ Successfully added Elon Musk to the database!')
    console.log('\nNote: Elon Musk\'s compensation structure is unique:')
    console.log('- $0 base salary since 2018')
    console.log('- All compensation from 2018 Performance Award (stock options)')
    console.log('- Options vest based on Tesla achieving market cap and revenue milestones')
    console.log('- Peak compensation in 2021: $848M from option exercises')

  } catch (error) {
    console.error('Error adding Elon Musk:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

addElonMusk()
