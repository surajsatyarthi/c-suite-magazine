import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

/**
 * ROBUST ENVIRONMENT LOADER
 * 
 * Standardizes how scripts load environment variables.
 * - Tries loading from .env.local (development)
 * - Tries loading from process.env (CI/CD)
 * - Enforces required keys
 */

// Try to load .env.local from project root
const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath })
} else {
    // Try parent .env.local (monorepo fallback)
    const parentEnvPath = path.resolve(process.cwd(), '..', '.env.local')
    if (fs.existsSync(parentEnvPath)) {
        dotenv.config({ path: parentEnvPath })
    }
}

// Normalized getter for variables
export function getEnv(key: string, required = false): string | undefined {
    const value = process.env[key]
    if (required && !value) {
        console.error(`❌ CRITICAL ERROR: Missing required environment variable: ${key}`)
        console.error(`   Please check your .env.local file or CI settings.`)
        process.exit(1)
    }
    return value
}

// Specialized getter for Sanity Token (handles multiple legacy names)
export function getSanityToken(): string | undefined {
    return process.env.SANITY_API_TOKEN ||
        process.env.SANITY_WRITE_TOKEN ||
        process.env.SANITY_TOKEN ||
        process.env.SANITY_API_READ_TOKEN
}

export const ENV = {
    PROJECT_ID: getEnv('NEXT_PUBLIC_SANITY_PROJECT_ID') || '2f93fcy8',
    DATASET: getEnv('NEXT_PUBLIC_SANITY_DATASET') || 'production',
    TOKEN: getSanityToken()
}
