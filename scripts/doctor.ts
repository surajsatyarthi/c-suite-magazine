import { ENV } from './lib/env'
import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

async function diagnose() {
    console.log('🩺 RUNNING SYSTEM DIAGNOSIS...\n')

    let health = 100
    const issues: string[] = []

    // 1. Check Env File
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
        console.log('✅ .env.local found.')
    } else {
        console.log('⚠️  .env.local missing. Checking for backup...')
        const backupPath = path.resolve(process.cwd(), '..', 'SANITY_KEYS_BACKUP.env')
        if (fs.existsSync(backupPath)) {
            console.log('✅ Backup env found in parent directory. (Safe)')
        } else {
            issues.push('CRITICAL: No .env.local and no Backup found!')
            health -= 50
        }
    }

    // 2. Check Variables
    if (ENV.PROJECT_ID === '2f93fcy8') console.log('✅ Project ID configured.')
    else { issues.push('Warning: Unusual Project ID.'); health -= 10 }

    if (ENV.DATASET === 'production') console.log('✅ Dataset configured (production).')
    else { issues.push(`Warning: Dataset is "${ENV.DATASET}", expected "production".`); health -= 10 }

    if (ENV.TOKEN) console.log('✅ Write Token present.')
    else { issues.push('CRITICAL: Sanity Write Token is MISSING.'); health -= 50 }

    // 3. Connectivity Check
    if (ENV.TOKEN) {
        try {
            const client = createClient({
                projectId: ENV.PROJECT_ID,
                dataset: ENV.DATASET,
                apiVersion: '2024-02-05',
                token: ENV.TOKEN,
                useCdn: false
            })
            await client.fetch('*[_type == "siteSettings"][0]._id')
            console.log('✅ Sanity Connection: OK')
        } catch (e: any) {
            issues.push(`CRITICAL: Sanity Connection Failed: ${e.message}`)
            health = 0
        }
    }

    console.log('\n-------------------------------------')
    if (issues.length > 0) {
        console.log('🚨 ISSUES FOUND:')
        issues.forEach(i => console.log(`   - ${i}`))
        console.log(`\nSYSTEM HEALTH: ${health}%`)
        process.exit(1)
    } else {
        console.log('✅ SYSTEM HEALTHY. READY FOR DEPLOYMENT.')
        console.log('-------------------------------------')
        process.exit(0)
    }
}

diagnose()
