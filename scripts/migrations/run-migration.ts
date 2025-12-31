#!/usr/bin/env tsx
import { sql } from '@vercel/postgres'

async function runMigration() {
  console.log('🔄 Running migration: Add performance_metrics column...')

  try {
    // Add performance_metrics column
    await sql`
      ALTER TABLE compensation
      ADD COLUMN IF NOT EXISTS performance_metrics JSONB
    `
    console.log('✅ Added performance_metrics column')

    // Add GIN index for JSONB queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_compensation_performance_metrics
      ON compensation USING GIN (performance_metrics)
    `
    console.log('✅ Added GIN index on performance_metrics')

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
