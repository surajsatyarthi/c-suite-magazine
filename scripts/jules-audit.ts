import { config } from 'dotenv'
config({ path: '.env.local' })
import { JulesClient } from '../lib/jules-client'

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (!process.env.JULES_API_KEY) {
    console.error('❌ Error: JULES_API_KEY is not set in environment variables.')
    process.exit(1)
  }

  const client = new JulesClient()

  try {
    if (command === '--test') {
      console.log('🔍 Testing Jules API Connection...')
      const sources = await client.listSources()
      console.log('✅ Connection Successful!')
      console.log('Sources:', JSON.stringify(sources, null, 2))
    } else if (command === '--bolt') {
       console.log('⚡ Triggering Jules Bolt (Performance Audit)...')
       const session = await client.createSession(
         'Audit this repository for performance optimizations. Focus on bundle size and unnecessary polyfills.',
         'Bolt Performance Audit'
       )
       console.log(`✅ Session Started: ${session.name}`)
       console.log(`🔗 Monitor progress in Jules Dashboard or use polling.`)
    } else if (command === '--sentinel') {
        console.log('🛡️ Triggering Jules Sentinel (Security Audit)...')
        const session = await client.createSession(
          'Audit recent API changes for security vulnerabilities, specifically request body consumption and validation.',
          'Sentinel Security Audit'
        )
        console.log(`✅ Session Started: ${session.name}`)
    } else {
      console.log('Usage: npx tsx scripts/jules-audit.ts [--test | --bolt | --sentinel]')
    }
  } catch (error: any) {
    console.error('❌ Jules API Failed:', error.message)
    process.exit(1)
  }
}

main()
