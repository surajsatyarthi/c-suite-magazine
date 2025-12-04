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

async function verifyJuggernauts() {
  const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]{
    items[]{
      title,
      link
    }
  }`)

  if (!config || !config.items) {
    console.error('Config not found')
    return
  }

  console.log('| Card | Title | Link | First 2 Lines of Article |')
  console.log('|---|---|---|---|')

  for (let i = 0; i < config.items.length; i++) {
    const item = config.items[i]
    const slug = item.link.split('/').pop()

    let articlePreview = "Article not found or link invalid"

    if (slug) {
      const article = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
        body
      }`, { slug })

      if (article && article.body) {
        const textBlocks = article.body
          .filter((block: any) => block._type === 'block' && block.children)
          .map((block: any) => block.children.map((child: any) => child.text).join(''))
          .slice(0, 2)

        articlePreview = textBlocks.join(' <br> ')
      }
    }

    console.log(`| ${i + 1} | ${item.title} | ${item.link} | ${articlePreview} |`)
  }
}

verifyJuggernauts()
