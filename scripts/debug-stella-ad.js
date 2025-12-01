const { createClient } = require('@sanity/client')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN,
})

async function debugStella() {
    // Search for Stella Ambrose article
    const query = `*[_type == "csa" && title match "Stella Ambrose"][0]{
    _id,
    title,
    slug,
    popupAd {
      targetUrl,
      alt,
      image {
        asset->{
          _id,
          url,
          originalFilename
        }
      }
    },
    body[]{
      _type,
      _key,
      triggersPopup,
      href
    }
  }`

    const article = await client.fetch(query)
    console.log(JSON.stringify(article, null, 2))
}

debugStella()
