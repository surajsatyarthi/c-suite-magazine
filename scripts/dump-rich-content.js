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

async function dumpRichContent() {
    console.log('🔍 Fetching Rich Stinson content...\n')

    const article = await client.fetch(`*[_type == "csa" && slug.current == "rich-stinson-visionary-leader-powering-america-s-electrification-future"][0] {
    title,
    body
  }`)

    if (!article) {
        console.log('❌ Article not found')
        return
    }

    console.log(`📄 Article: ${article.title}`)
    console.log(`   Body Blocks: ${article.body?.length || 0}\n`)

    if (article.body) {
        article.body.slice(0, 10).forEach((block, i) => {
            console.log(`--- Block ${i + 1} (${block._type}) ---`)
            if (block._type === 'block') {
                const text = block.children?.map(c => c.text).join('') || ''
                console.log(`Text: "${text.substring(0, 100)}..."`) // First 100 chars
                console.log(`Raw: ${JSON.stringify(block)}`)
            } else if (block._type === 'image') {
                console.log(`Image: Alt="${block.alt || ''}"`)
            }
            console.log('')
        })
    }
}

dumpRichContent().catch(console.error)
