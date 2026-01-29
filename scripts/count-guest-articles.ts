
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

async function getGuestWriterCounts() {
    console.log("Fetching guest writer article counts...")

    // GROQ query to get writers and count posts referencing them
    // references(^._id) efficiently finds any document linking to this writer
    const query = `
    *[_type == "writer" && writerType == "guest"] {
      name,
      "articleCount": count(*[_type == "post" && references(^._id)])
    } | order(articleCount desc)
  `

    const results = await client.fetch(query)

    console.table(results)
}

getGuestWriterCounts()
