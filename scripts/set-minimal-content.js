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

function generateKey() {
    return Math.random().toString(36).substring(2, 10)
}

async function setMinimalContent() {
    const slug = 'rich-stinson-visionary-leader-powering-america-s-electrification-future'
    console.log(`Updating article: ${slug}`)

    const article = await client.fetch(`*[_type == "csa" && slug.current == $slug][0]`, { slug })

    if (!article) {
        console.error('❌ Article not found!')
        return
    }

    const minimalBody = [
        {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
                {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'This is a minimal content test. If you can see this, the rendering pipeline is working.',
                    marks: []
                }
            ],
            markDefs: []
        }
    ]

    try {
        await client.patch(article._id).set({ body: minimalBody }).commit()
        console.log('✅ Article updated with minimal content!')
    } catch (err) {
        console.error('❌ Update failed:', err.message)
    }
}

setMinimalContent()
