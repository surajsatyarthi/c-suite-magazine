import { config } from 'dotenv'
import * as path from 'path'
config({ path: path.join(__dirname, '../.env.local') })
import { JulesClient } from '../lib/jules-client'

async function main() {
  const sessionId = process.argv[2]
  if (!sessionId) {
    console.error('Usage: npx tsx scripts/fetch-jules-report.ts <session-id>')
    process.exit(1)
  }

  console.log(`🔍 Fetching report for Session: ${sessionId}...`)
  
  const client = new JulesClient()
  
  try {
    const { activities } = await client.listActivities(sessionId)
    
    if (!activities || activities.length === 0) {
      console.log('⚠️  No activities found. Agent might still be thinking or failed.')
      return
    }

    console.log(`\n📄 Found ${activities.length} activity items:\n`)
    
    activities.forEach((act, i) => {
      console.log(`--- Item ${i + 1} (${act.type}) ---`)
      console.log(act.text || '[No text content]')
      console.log('------------------------\n')
    })

  } catch (error: any) {
    console.error('❌ Failed to fetch report:', error.message)
    process.exit(1)
  }
}

main()
