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

async function dumpContent() {
    const slug = 'rich-stinson-visionary-leader-powering-america-s-electrification-future'
    console.log(`Fetching article: ${slug}`)

    const article = await client.fetch(`*[_type == "csa" && slug.current == $slug][0] {
    title,
    "bodyCount": count(body),
    body
  }`, { slug })

    if (!article) {
        console.log('❌ Article not found')
        return
    }

    console.log(`Title: ${article.title}`)
    console.log(`Body Block Count: ${article.bodyCount}`)

    if (article.body && article.body.length > 0) {
        console.log('--- First 3 Blocks ---')
        article.body.slice(0, 3).forEach((b, i) => {
            console.log(`[${i}] Type: ${b._type}, Style: ${b.style}`)
            if (b.children) {
                console.log(`    Text: ${b.children.map(c => c.text).join('')}`)
            }
        })
    } else {
        console.log('❌ Body is empty!')
    }
}

dumpContent()
