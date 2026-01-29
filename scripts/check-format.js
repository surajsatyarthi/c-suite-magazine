import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-10-28',
    useCdn: false,
})

async function checkOtherArticle() {
    // Fetch a random post that is NOT the Rich Stinson one
    const article = await client.fetch(`*[_type == "post" && slug.current != "rich-stinson-visionary-leader-powering-america-s-electrification-future"][0] {
    title,
    slug,
    body[0...3]
  }`)

    if (!article) {
        console.log('❌ No other articles found')
        return
    }

    console.log(`Checking Article: ${article.title}`)
    console.log('--- Body Structure (First 3 Blocks) ---')
    console.log(JSON.stringify(article.body, null, 2))
}

checkOtherArticle()
