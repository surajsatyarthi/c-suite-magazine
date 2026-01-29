import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

async function boldLastLine() {
    const slug = 'elon-musk-building-future-civilization-scale'

    // 1. Fetch the article
    const article = await client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug })

    if (!article || !article.body) {
        console.error('Article not found')
        return
    }

    // 2. Find and update the block
    const newBody = article.body.map((block: any) => {
        if (block._type !== 'block' || !block.children) return block

        const text = block.children.map((c: any) => c.text).join('')
        if (text.includes('Thank you for your time') && text.includes('CSuite')) {
            // Replace children with a single bold span
            return {
                ...block,
                children: [
                    {
                        _type: 'span',
                        marks: ['strong'],
                        text: text // "CSuite: Thank you for your time."
                    }
                ]
            }
        }
        return block
    })

    // 3. Patch the article
    try {
        await client.patch(article._id)
            .set({ body: newBody })
            .commit()
        console.log('Successfully bolded the closing line.')
    } catch (error) {
        console.error('Failed to update article:', error)
    }
}

boldLastLine()
