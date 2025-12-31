import { NextResponse } from 'next/server'
import { getAllExecutives, getAllCompanies, getCompensationRecords } from '@/lib/db'

/**
 * Test API route to verify Vercel Postgres connection
 * Visit: /api/test-supabase to check connectivity
 */
export async function GET() {
  try {
    // Test 1: Query executives table
    const executives = await getAllExecutives(5)

    // Test 2: Query companies table
    const companies = await getAllCompanies(5)

    // Test 3: Query compensation table
    const compensation = await getCompensationRecords(5)

    return NextResponse.json({
      success: true,
      message: 'Vercel Postgres connection successful',
      database: 'Vercel Postgres',
      tables: {
        executives: {
          count: executives.length,
          sample: executives
        },
        companies: {
          count: companies.length,
          sample: companies
        },
        compensation: {
          count: compensation.length,
          sample: compensation
        }
      },
      connectionPooling: 'PgBouncer enabled',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to Vercel Postgres',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Check that POSTGRES_URL environment variable is set and database schema is created'
    }, { status: 500 })
  }
}
