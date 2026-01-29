/**
 * Check what executives exist in the database
 */

import { sql } from '@vercel/postgres'

async function checkExecutives() {
  try {
    console.log('Fetching executives from database...\n')

    // Get all executives with their latest compensation
    const result = await sql`
      SELECT
        e.full_name,
        e.slug,
        e.current_title,
        c.name as company_name,
        c.ticker_symbol,
        (
          SELECT comp.total_compensation
          FROM compensation comp
          WHERE comp.executive_id = e.id
          ORDER BY comp.fiscal_year DESC
          LIMIT 1
        ) as latest_compensation,
        (
          SELECT comp.fiscal_year
          FROM compensation comp
          WHERE comp.executive_id = e.id
          ORDER BY comp.fiscal_year DESC
          LIMIT 1
        ) as latest_year
      FROM executives e
      LEFT JOIN companies c ON e.company_id = c.id
      ORDER BY latest_compensation DESC NULLS LAST
      LIMIT 100
    `

    console.log(`Found ${result.rows.length} executives:\n`)

    result.rows.forEach((exec, index) => {
      const compensation = exec.latest_compensation
        ? `$${(exec.latest_compensation / 1000000).toFixed(1)}M (${exec.latest_year})`
        : 'No compensation data'

      console.log(`${index + 1}. ${exec.full_name}`)
      console.log(`   Company: ${exec.company_name || 'Unknown'} (${exec.ticker_symbol || 'N/A'})`)
      console.log(`   Title: ${exec.current_title || 'Unknown'}`)
      console.log(`   Latest Compensation: ${compensation}`)
      console.log(`   Slug: ${exec.slug}`)
      console.log()
    })

    // Check specifically for Elon Musk
    const elonCheck = result.rows.find(row =>
      row.full_name.toLowerCase().includes('elon') ||
      row.full_name.toLowerCase().includes('musk')
    )

    if (elonCheck) {
      console.log('✅ Elon Musk found in database!')
    } else {
      console.log('❌ Elon Musk NOT found in database - needs to be added')
    }

  } catch (error) {
    console.error('Error checking executives:', error)
  } finally {
    process.exit(0)
  }
}

checkExecutives()
