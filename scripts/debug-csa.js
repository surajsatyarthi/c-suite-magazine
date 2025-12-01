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

async function debugCSA() {
    console.log('🔍 Fetching detailed CSA article data...\n')

    const articles = await client.fetch(`*[_type == "csa"] {
    _id,
    title,
    slug,
    mainImage {
      asset->{
        _id,
        url,
        metadata { dimensions }
      },
      alt
    },
    popupAd {
      image {
        asset->{
          _id,
          url,
          metadata { dimensions }
        }
      },
      targetUrl,
      alt
    },
    "bodyLength": count(body),
    "bodyTypes": body[]._type
  }`)

    articles.forEach((article) => {
        console.log(`\n--------------------------------------------------`)
        console.log(`📄 Article: ${article.title}`)
        console.log(`   ID: ${article._id}`)
        console.log(`   Slug: ${article.slug.current}`)

        console.log(`\n🖼️  Main Image:`)
        if (article.mainImage?.asset) {
            console.log(`   URL: ${article.mainImage.asset.url}`)
            console.log(`   Dims: ${JSON.stringify(article.mainImage.asset.metadata?.dimensions)}`)
        } else {
            console.log(`   ❌ MISSING or Invalid Asset`)
        }

        console.log(`\n📢 Popup Ad:`)
        if (article.popupAd?.image?.asset) {
            console.log(`   URL: ${article.popupAd.image.asset.url}`)
            console.log(`   Dims: ${JSON.stringify(article.popupAd.image.asset.metadata?.dimensions)}`)
        } else {
            console.log(`   ❌ MISSING or Invalid Asset (This causes broken images if rendered)`)
        }
        console.log(`   Target: ${article.popupAd?.targetUrl}`)

        console.log(`\n📝 Body Content:`)
        console.log(`   Length: ${article.bodyLength} blocks`)
        console.log(`   Types: ${JSON.stringify(article.bodyTypes)}`)
    })
}

debugCSA().catch(console.error)
