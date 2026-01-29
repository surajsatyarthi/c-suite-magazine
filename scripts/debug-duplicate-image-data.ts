
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error("Missing env vars. Ensure .env.local exists.")
    process.exit(1)
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN, // Needs read access
    useCdn: false,
})

const TITLES_TO_CHECK = [
    "The One-Sentence Rule: If You Can't Pitch It in 10 Seconds, You Can't Pitch It",
    "The Asynchronous Enterprise: Why Meetings are the Enemy of Scale",
    "Internal Comms IS Your Strategy: Why the 'Nervous System' of Your Enterprise is Broken"
]

async function checkArticles() {
    console.log("🔍 Checking articles for duplicate image data...")

    for (const title of TITLES_TO_CHECK) {
        // Search by title (partial match)
        const query = `*[_type == "post" && title match $title][0] {
      _id,
      title,
      mainImage {
        asset->{
          _id,
          url,
          originalFilename
        },
        url,
        generatedAt,
        generationMethod
      }
    }`

        const result = await client.fetch(query, { title })

        if (result) {
            console.log(`\n📄 Title: ${result.title}`)
            console.log(`   ID: ${result._id}`)
            if (result.mainImage) {
                console.log(`   Image Data:`, JSON.stringify(result.mainImage, null, 2))
            } else {
                console.log(`   ❌ No mainImage found.`)
            }
        } else {
            console.log(`\n❌ Could not find article matching: "${title}"`)
        }
    }
}

checkArticles().catch(err => console.error(err))
