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

async function inspectBody() {
    const slug = 'elon-musk-building-future-civilization-scale'
    const article = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
    body
  }`, { slug })

    if (!article || !article.body) {
        console.log('Article or body not found')
        return
    }

    // Find the block with the target text
    const targetBlock = article.body.find((block: any) => {
        if (block._type !== 'block' || !block.children) return false
        const text = block.children.map((c: any) => c.text).join('')
        return text.includes('Thank you for your time')
    })

    console.log(JSON.stringify(targetBlock, null, 2))
}

inspectBody()
