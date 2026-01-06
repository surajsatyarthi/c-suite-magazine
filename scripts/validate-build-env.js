#!/usr/bin/env node

/**
 * BUILD ENVIRONMENT VALIDATION
 * 
 * Validates that all required environment variables are present before build.
 * Fails fast with clear error messages rather than producing a broken build.
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const REQUIRED_ENV_VARS = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'NEXT_PUBLIC_SANITY_API_VERSION',
]

const OPTIONAL_ENV_VARS = [
    'SANITY_API_TOKEN',
    'SANITY_WRITE_TOKEN',
    'NEXT_PUBLIC_VERCEL_URL',
]

let hasErrors = false

console.log('🔍 Validating build environment...\n')

// Check required variables
REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ MISSING REQUIRED: ${varName}`)
        hasErrors = true
    } else {
        console.log(`✅ ${varName}`)
    }
})

// Check optional variables (warnings only)
OPTIONAL_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
        console.warn(`⚠️  OPTIONAL (not set): ${varName}`)
    } else {
        console.log(`✅ ${varName}`)
    }
})

if (hasErrors) {
    console.error('\n❌ Build environment validation FAILED!\n')
    console.error('Required environment variables are missing.')
    console.error('\nTo fix this:')
    console.error('  1. Create/update .env.local with the missing variables')
    console.error('  2. For CI/CD, add them as GitHub Secrets or Vercel Environment Variables')
    console.error('\nExample .env.local:')
    console.error('  NEXT_PUBLIC_SANITY_PROJECT_ID=2f93fcy8')
    console.error('  NEXT_PUBLIC_SANITY_DATASET=production')
    console.error('  NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01\n')
    process.exit(1)
}

console.log('\n✅ Environment validation passed!\n')
