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

async function checkOrder() {
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]{
    items[]{
      title,
      link
    }
  }`)

    console.log('Current Juggernauts Order:')
    config.items.forEach((item: any, index: number) => {
        console.log(`${index + 1}. ${item.title} - ${item.link}`)
    })
}

checkOrder()
