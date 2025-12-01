import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: 'production', // FORCE PRODUCTION
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-10-28',
    useCdn: false,
})

async function fixStella() {
    console.log(`Current Dataset: ${client.config().dataset}`)

    const slugPattern = "stella*"
    console.log(`Searching for ANY doc matching slug: ${slugPattern}`)

    const docs = await client.fetch(`*[slug.current match $slugPattern]`, { slugPattern })
    const drafts = await client.fetch(`*[_id in path("drafts.**") && slug.current match $slugPattern]`, { slugPattern })

    const allDocs = [...docs, ...drafts]

    if (allDocs.length === 0) {
        console.log('❌ No docs found at all.')
        return
    }

    for (const doc of allDocs) {
        console.log(`\n--- Doc: ${doc._id} (${doc._type}) ---`)
        console.log('Keys:', Object.keys(doc).sort().join(', '))

        if (doc.adKeywords) {
            console.log('🚨 FOUND "adKeywords":', doc.adKeywords)
            await unsetField(doc._id, 'adKeywords')
        }
    }
}

async function unsetField(id, field) {
    try {
        await client.patch(id).unset([field]).commit()
        console.log(`✅ Removed "${field}" from ${id}`)
    } catch (err) {
        console.error(`❌ Failed to remove "${field}":`, err.message)
    }
}
fixStella()
