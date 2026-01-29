import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const envPath = path.resolve(process.cwd(), '.env.local')
// Use fs to check if file content looks like env vars
const content = fs.readFileSync(envPath, 'utf8')
console.log('File size:', content.length)
console.log('First 50 chars:', content.substring(0, 50))
console.log('Contains NEXT_PUBLIC_SANITY_PROJECT_ID:', content.includes('NEXT_PUBLIC_SANITY_PROJECT_ID'))

const result = dotenv.config({ path: envPath })
if (result.parsed) {
    console.log('Parsed keys:', Object.keys(result.parsed))
} else {
    console.log('No parsed result')
}
