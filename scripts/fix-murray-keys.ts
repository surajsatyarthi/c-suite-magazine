import { createClient } from '@sanity/client'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

const SLUG = 'murray-auchincloss-pragmatic-reset-steering-bp-value'

async function fixMurrayKeys() {
    try {
        console.log(`Fetching article with slug: ${SLUG}...`)
        const article = await client.fetch(
            `*[_type == "post" && slug.current == $slug][0]`,
            { slug: SLUG }
        )

        if (!article) {
            console.error('Article not found!')
            return
        }

        console.log(`Found article: ${article.title} (${article._id})`)

        const patches: any = {}
        let hasChanges = false

        // Fix categories
        if (article.categories && Array.isArray(article.categories)) {
            const newCategories = article.categories.map((cat: any) => {
                if (!cat._key) {
                    hasChanges = true
                    return { ...cat, _key: uuidv4() }
                }
                return cat
            })
            if (hasChanges) {
                patches.categories = newCategories
                console.log('Fixed keys in categories')
            }
        }

        // Fix body
        if (article.body && Array.isArray(article.body)) {
            let bodyChanges = false
            const newBody = article.body.map((block: any) => {
                if (!block._key) {
                    bodyChanges = true
                    return { ...block, _key: uuidv4() }
                }
                return block
            })
            if (bodyChanges) {
                patches.body = newBody
                hasChanges = true
                console.log('Fixed keys in body')
            }
        }

        if (!hasChanges) {
            console.log('No missing keys found. Article is already healthy.')
            return
        }

        console.log('Applying patches...')
        await client.patch(article._id).set(patches).commit()
        console.log('Successfully patched article!')

    } catch (error) {
        console.error('Error fixing keys:', error)
    }
}

fixMurrayKeys()
