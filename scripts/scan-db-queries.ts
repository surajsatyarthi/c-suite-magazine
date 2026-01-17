import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const RESET = '\x1b[0m'

async function scan() {
  console.log('🛡️  UAQS v3.0: Scanning for Unbounded Database Queries...')

  const files = await glob('**/*.{ts,tsx,js,jsx}', { 
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'scripts/**'] 
  })

  let errors = 0

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    lines.forEach((line, i) => {
      // Very basic regex to catch "SELECT * FROM" or similar without LIMIT in the same block/context
      // This is a naive check but effective for our codebase's patterns
      if (line.includes('SELECT') && line.includes('FROM') && !line.includes('LIMIT')) {
        // Check next few lines for LIMIT
        const context = lines.slice(i, i + 15).join(' ')
        if (!context.includes('LIMIT') && !context.includes('COUNT(*)')) {
            console.log(`${RED}❌ Unbounded Query Risk found in ${file}:${i + 1}${RESET}`)
            console.log(`   Line: ${line.trim()}`)
            console.log(`   Fix: Add "LIMIT" clause or pagination.\n`)
            errors++
        }
      }
    })
  }

  if (errors > 0) {
    console.log(`${RED}FAILED: Found ${errors} potential unbounded queries.${RESET}`)
    process.exit(1)
  } else {
    console.log(`${GREEN}✅ All SQL queries appear safe (contain LIMIT or COUNT).${RESET}`)
  }
}

scan()
