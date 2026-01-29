import dotenv from 'dotenv'
import path from 'path'

const result = dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (result.error) {
    console.error('Error loading .env.local:', result.error)
} else {
    console.log('.env.local loaded successfully')
}

console.log('SANITY_PROJECT_ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? 'Set' : 'Missing')
console.log('SANITY_DATASET:', process.env.NEXT_PUBLIC_SANITY_DATASET ? 'Set' : 'Missing')
console.log('SANITY_API_TOKEN:', process.env.SANITY_API_TOKEN ? 'Set' : 'Missing')
