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

async function checkCSATriggers() {
    console.log('🔍 Checking CSA articles for inline popup triggers...\n')

    const csaArticles = await client.fetch(`*[_type == "csa"] {
    title,
    "inlineImages": body[_type == "image"] {
      "alt": alt,
      "triggersPopup": triggersPopup,
      "href": href
    }
  }`)

    csaArticles.forEach((article, i) => {
        console.log(`${i + 1}. ${article.title}`)
        const triggers = article.inlineImages.filter(img => img.triggersPopup)

        if (triggers.length > 0) {
            console.log(`   ✅ Found ${triggers.length} inline image(s) that trigger popup:`)
            triggers.forEach(img => {
                console.log(`      - Alt: ${img.alt || 'None'}`)
                console.log(`      - Link: ${img.href || 'None'}`)
            })
        } else {
            console.log(`   ❌ No inline images configured to trigger popup`)
        }
        console.log('')
    })
}

checkCSATriggers().catch(console.error)
